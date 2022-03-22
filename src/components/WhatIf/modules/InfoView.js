import * as d3 from 'd3';
import {
  SuperGroupView,
  labelColorMap,
  GillSans,   // 字体
  SegoeUI,
} from '@/utils';
import {
  infoTarget,
  infoTargetMap,
} from './utils';

export default class InfoView extends SuperGroupView {
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
    this._margin = { top: 0, bottom: 0, left: 0, right: 0 };
    
    this._xScale = undefined; // 大横轴的比例尺
    this._offset = undefined; // 规格信息group相对于gantt的偏移量
    this._rawData = undefined;  // 原始数据
    this._extent = undefined;   // 规格范围
  }

  joinData(value, extent) {
    this._rawData = value;
    this._extent = extent;
    return this;
  }

  initState(xScale, offset) {
    this._xScale = xScale;
    this._offset = offset;
    return this;
  }

  render() {
    this.#renderBlackground();
    this.#renderLink();
    this.#renderInfoContent({
      xDomain: [0, 1],
      yDomain: infoTarget,
      colors: ['#cbdcea', '#999', d3.color('#cbdcea').darker(1)], // 填充, 边框, 文字
    });
    return this;
  }

  update(xScale, offset) {
    this.initState(xScale, offset);
    
    this.#updateLink();
    return this;
  }

  #renderBlackground() {
    this._container.append('rect')
      .attr('width', this._viewWidth)
      .attr('height', this._viewHeight)
      .attr('stroke', labelColorMap[0])
      .attr('stroke-width', 2)
      .attr('fill', 'white')

    this._container.append('text')
      .attr('y', 20)
      .text(this._rawData.id)
  }

  #linkPath = d => {
    const sX = this._viewWidth / 2;
    const sY = 0;
    const tX = (this._xScale(new Date(d[0])) + this._xScale(new Date(d[1]))) / 2 - this._offset;
    const tY = -70;

    return d3.linkVertical()({ source: [sX, sY], target: [tX, tY] });
  }

  #renderLink() {
    const linkGroup = this._container.append('g')
      .attr('class', 'link-group')

    linkGroup.selectAll('.link-to-block')
      .data(this._rawData.link)
      .join(enter => enter.append('path')
        .attr('class', 'link-to-block')
        .attr('fill', 'none')
        .attr('stroke', d => d.color)
        .attr('stroke-width', 1.5)
        .attr('d', d => this.#linkPath(d.date))
      );
  }

  #updateLink() {
    this._container.selectAll('.link-to-block')
      .attr('d', d => this.#linkPath(d.date))
  }

  #renderInfoContent({
    width = 100,
    height = 100,
    marginTop = 35,
    marginRight = 10,
    marginBottom = 10,
    marginLeft = 25,
    yDomain,
    yRange = [0, height - marginTop - marginBottom],
    xDomain,
    xRange = [0, width - marginLeft - marginRight],
    yPadding = 0.35,
    colors = ['blue', 'black', 'red'], // 填充, 边框, 文字
  } = {}) {
    const fontSize = 11;
    const strokeWidth = 1.5;
    const xScale = d3.scaleLinear(xDomain, xRange);
    const yScale = d3.scaleBand(yDomain, yRange).paddingInner(yPadding);
    const yAxis = d3.axisLeft(yScale)
      .tickSizeOuter(0)
      .tickFormat(d => infoTargetMap[d].name);
    const data = infoTarget.map(d => {
      return {
        target: d,
        value: this._rawData.infoData[d],
      }
    });

    const barGroup = this._container.append('g')
      .attr('class', 'target-content')
      .attr('transform', `translate(${[marginLeft, marginTop]})`)
      .style('font-size', fontSize)
      .style('font-family', GillSans)
      .style('font-weight', 'normal')
      .style('font-style', 'normal')
      .style('text-anchor', 'middle');

    barGroup
      .selectAll('.barChart')
      .data(data)
      .join('g')
    .call(g => g.append('rect')
      .attr('y', d => yScale(d.target))
      .attr('width', d => xScale(1))
      .attr('height', yScale.bandwidth())
      .attr('fill', 'white')
      .attr('stroke', colors[1])
      .attr('stroke-width', strokeWidth))
    .call(g => g.append('rect')
      .attr('x', strokeWidth / 2)
      .attr('y', d => yScale(d.target) + strokeWidth / 2)
      .attr('width', d => xScale(d.value))
      .attr('height', yScale.bandwidth() - strokeWidth)
      .attr('fill', colors[0]))
    .call(g => g.append('text')
      .text(d => `${(d.value * this._extent[d.target][1]).toFixed(2)} ${infoTargetMap[d.target].unit}`)
      .attr('x', xScale(1) / 2)
      .attr('y', d => yScale(d.target) + (yScale.bandwidth() + fontSize) / 2 - 2)
      .attr('fill', colors[2]))

    barGroup.append('g')
      .attr('transform', `translate(${[-strokeWidth, 0]})`)
      .call(yAxis)
  }
}