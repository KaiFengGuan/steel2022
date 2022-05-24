import * as d3 from 'd3';
import { SuperGroupView } from '@/utils/renderClass';
import { labelColor, eventBus } from '@/utils';
import store from '@/store';
import { SET_BRUSH_DATE } from '@/store/actionTypes';
import { Boundary } from './Boundary';

export default class TrendView extends SuperGroupView {
  constructor({
    width,
    height,
    moveX = 0,
    moveY = 0,
  } = {}, parentNode, tooltipIns, rootName) {
    super({ width, height, moveX, moveY }, parentNode, rootName);

    this._rootName = rootName;
    this._key = ['bad_flag', 'good_flag', 'no_flag'];
    this._tooltip = tooltipIns;

    this._xScale = undefined;
    this._selectStatus = false;   // 是否刷选的状态
  }

  /**
   * 添加原始数据，并转换为绘图数据
   */
  joinData(key, value) {
    this._rawData = value;

    const len = this._rawData.endTimeOutput.length;
    const dataFlat = new Array();
    for (let i = 0; i < len; i++) {
      dataFlat.push({
        endTimeOutput: this._rawData.endTimeOutput[i],
        no_flag: this._rawData.no_flag[i],
        good_flag: this._rawData.good_flag[i],
        bad_flag: this._rawData.bad_flag[i],
      })
    }
    this._stackData = d3.stack()
      .keys(this._key)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone)(dataFlat)

    return this;
  }

  render() {
    let maxValue = d3.max(
      this._rawData.good_flag,
      (d, i) => d + this._rawData.bad_flag[i] + this._rawData.no_flag[i]);
    
    this._container.selectChildren().remove();  // 先清空container
    
    const options = {
      width: this._viewWidth,
      height: this._viewHeight,
      yDomain: [0, maxValue],
      xDomain: this._rawData.endTimeOutput,
      colors: labelColor,
    }
    this.#renderStackBar(this._stackData, options);
    return this;
  }

  updateXSelect(disDomain) {  // 提示gantt图显示的区域
    if (!disDomain) return;

    // this._container.selectAll('.zoom-range')
    //   .data(paintData, d => d)
    //   .join(
    //     enter => enter.append('path')
    //       .attr('class', 'zoom-range')
    //       .attr('fill', '#666')
    //       .attr('d', Boundary.zoomDisArea({ width: 10, height: 10 })),
    //   )
    //   .attr('transform', (d, i) => `translate(${this._xScale(disDomain[i])}, ${tranY})`)

    // 更改样式
    const [good, bad, no] = this.#filterXSelectData(this._rawData, disDomain);
    const total = good + bad + no;
    const paintData = [Math.round(bad / total * 100), Math.round((good + no) / total * 100)];
    if (!this._selectStatus) {
      this.#renderXSelectBar(total, paintData, disDomain);
      this._selectStatus = true;
    } else {
      this.#updateXSelectBar(total, paintData, disDomain);
    }
  }

  #renderStackBar(data, {
    width = 640, // outer width, in pixels
    height, // outer height, in pixels
    marginTop = 10,
    marginRight = 0,
    marginBottom = 10,
    marginLeft = 0,
    yDomain, // [ymin, ymax]
    yRange = [height - marginBottom, marginTop], // [bottom, top]
    xDomain, // array of x-values
    xRange = [marginLeft, width - marginRight], // [left, right]
    yPadding = 0.1, // amount of y-range to reserve to separate bars
    colors = d3.schemeTableau10, // array of colors
  } = {}) {
    const that = this;
    const barGroup = this._container.append('g')
      .attr('class', 'trend-stack-bar-group')
      .attr('transform', `translate(${[marginLeft, marginTop]})`);
    
    const xScale = d3.scaleBand(xDomain, xRange).paddingInner(yPadding);
    const yScale = d3.scaleLinear(yDomain, yRange);
    this._xScale = d3.scaleTime([new Date(xDomain[0]), new Date(xDomain[xDomain.length - 1])], xRange);

    const bar = barGroup
      .selectAll('.stack-bar')
      .data(data)
      .join('g')
        .attr('class', (_, i) => `stack-bar-${this._key[i]}`)
        .attr('fill', (_, i) => colors[i])
      .selectAll('.bar-rect')
      .data(d => d)
      .join('rect')
        .attr('x', (_, i) => xScale(xDomain[i]))
        .attr('y', ([y1, y2]) => Math.min(yScale(y1), yScale(y2)))
        .attr('height', ([y1, y2]) => Math.abs(yScale(y1) - yScale(y2)))
        .attr('width', xScale.bandwidth())
        .attr('opacity', 0.2);

    const brush = d3.brushX()
      .extent([[marginLeft, marginTop], [width - marginRight, height - marginBottom]])
      .on('start brush', ({selection}) => that.#brushing(selection, bar, xScale))
      .on('end', ({selection}) => that.#brushEnd(selection, xDomain, xScale));

    barGroup.append('g')
      .attr('class', 'trend-brush')
      .call(brush)
      // .call(brush.move, [3, 5].map(x))
  }

  #brushing(selection, eles, xScale) {
    if (selection === null) {
      eles.attr('opacity', 0.2);
    } else {
      const computedOpacity = d => {
        let newX = xScale(d.data.endTimeOutput);
        return newX >= selection[0] && newX < selection[1];
      }
      eles.attr('opacity', d => computedOpacity(d) ? 1 : 0.2);
    }
    
    let brushGroup = this._container.select('.trend-brush');
    brushGroup.call(g => this.#brushHandle.call(this, g, selection));
  }

  #brushEnd(selection, xDomain, xScale) {
    if (selection === null) return;
    const brushRange = d3.filter(xDomain, d => {
      let x = xScale(d);
      return selection[0] <= x && x <= selection[1];
    })
    let newState = [brushRange[0], brushRange.slice(-1)[0]];
    store.dispatch(SET_BRUSH_DATE, newState);  // 派发修改state: 刷选的时间
  }

  #brushHandle(g, selection) {
    g.selectAll(".handle--custom")
      .data([{type: "w"}, {type: "e"}])
      .join(
        enter => {
          enter.append("path")
            .attr("class", "handle--custom")
            .attr("fill", "#666")
            .attr("cursor", "ew-resize")
            .attr("d", (_, i) => Boundary.brush({
              width: 10,
              height: this._viewHeight - this._margin.top - this._margin.bottom,
              direction: i === 0 ? 'left' : 'right' 
            }))
        }
      )
      .attr("display", selection === null ? "none" : null)
      .attr("transform", selection === null ? null : (d, i) => `translate(${selection[i]},${this._margin.top})`)
  }

  #filterXSelectData(_rawData, disDomain) {
    const [start, end] = disDomain.map(d => d.getTime());
    const len = _rawData.endTimeOutput.length;
    let good = 0, bad = 0, no = 0;
    for (let i = 0; i < len; i++) {
      const itemDate = new Date(_rawData.endTimeOutput[i]).getTime();
      if (itemDate >= start && itemDate <= end) {
        good += _rawData.good_flag[i];
        bad += _rawData.bad_flag[i];
        no += _rawData.no_flag[i];
      }
    }
    return [good, bad, no];
  }

  #renderXSelectBar(total, paintData, disDomain) {
    const width = 22;   // 小圆圈的尺寸
    const tranY = this._viewHeight;

    // 中间的棍
    const rectHeight = width;
    const rectWidth = this._xScale(disDomain[1]) - this._xScale(disDomain[0]);
    const linkGroup = this._container.append('g')
      .attr('class', 'link-group')
      .attr('transform', `translate(${this._xScale(disDomain[0])}, ${tranY})`)
    linkGroup.append('rect')
      .attr('width', rectWidth)
      .attr('height', rectHeight)
      .attr('fill', '#ccc')
      .attr('stroke', d3.color('#ccc').darker(0.5))
      .attr('stroke-width', 1.5)
    const text = linkGroup.append('text')
      .attr('fill', 'white')
      .text(total)
    const { width: textW, height: textH } = text.node().getBBox();
    text.attr('transform', `translate(${[(rectWidth - textW) / 2, (rectHeight + textH) / 2 - 2]})`);

    // 两边的球
    const rangeGroup = this._container.selectAll('.zoom-range')
      .data(paintData)
      .join('g')
      .attr('class', 'zoom-range')
      .attr('transform', (_, i) => `translate(${this._xScale(disDomain[i])}, ${tranY})`)
    rangeGroup.append('circle')
      .attr('r', width / 2)
      .attr('fill', (_, i) => labelColor[i])
      .attr('stroke', (_, i) => d3.color(labelColor[i]).darker(0.5))
      .attr('stroke-width', 1.5)
      .attr('transform', `translate(${[0, width / 2]})`)
    rangeGroup.append('text')
      .attr('class', 'range-text')
      .attr('fill', 'white')
      .text(d => d)
      .attr('transform', `translate(${[-7, (width + 12) / 2]})`)
  }

  #updateXSelectBar(total, paintData, disDomain) {
    const width = 22;   // 小圆圈的尺寸
    const tranY = this._viewHeight;
    const rectHeight = width;
    const rectWidth = this._xScale(disDomain[1]) - this._xScale(disDomain[0]);

    const linkGroup = this._container.select('.link-group');
    linkGroup.attr('transform', `translate(${this._xScale(disDomain[0])}, ${tranY})`);
    linkGroup.select('rect').attr('width', rectWidth);
    const text = linkGroup.select('text')
    text.text(total);
    const { width: textW, height: textH } = text.node().getBBox();
    text.attr('transform', `translate(${[(rectWidth - textW) / 2, (rectHeight + textH) / 2 - 2]})`);

    const rangeGroup = this._container.selectAll('.zoom-range');
    rangeGroup.attr('transform', (_, i) => `translate(${this._xScale(disDomain[i])}, ${tranY})`)
    this._container.selectAll('.range-text').text((_, i) => paintData[i]);
  }
}