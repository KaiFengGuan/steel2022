import * as d3 from 'd3';
import { SuperGroupView } from '@/utils/renderClass';
import { labelColor, labelColorMap } from '@/utils/setting';
import { Boundary } from './Boundary';

function getTransformFromXScales (initialScale, frameScale, range = initialScale.range()) {
  // For dates, get the time instead of the date objects
  const initialDomain = initialScale.domain().map(d => d.getTime());
  const frameDomain = frameScale.domain().map(d => d.getTime());

  const frameDomainLength = frameDomain[1] - frameDomain[0];
  const initialDomainLength = initialDomain[1] - initialDomain[0];
  const rangeLength = range[1] - range[0];
  const midpoint = (initialDomain[0] + initialDomain[1]) / 2;
  const rangeConversion = rangeLength / initialDomainLength;

  // Get scale from domain lengths
  const k = initialDomainLength / frameDomainLength;

  // Figure out where the initial domain midpoint falls on the initial domain and the frame domain,
  // as a ratio of the distance-from-the-lower-domain-bound-to-the-midpoint to the appropriate
  // domain length.
  const midpointInitialRatio = (midpoint - initialDomain[0]) / initialDomainLength;
  const midpointFrameRatio = (midpoint - frameDomain[0]) / frameDomainLength;

  // Calculate the ratio translation required to move the initial midpoint ratio to its
  // location on the frame domain. Then convert to domain units, and finally range units.
  const midpointRatioTranslation = midpointFrameRatio - midpointInitialRatio * k;
  const domainXTranslation = midpointRatioTranslation * initialDomainLength;
  const rangeXTranslation = domainXTranslation * rangeConversion;

  return d3.zoomIdentity.translate(rangeXTranslation, 0).scale(k);
}

export default class GanttView extends SuperGroupView {
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
    this._margin = { top: 50, bottom: 10, left: 10, right: 10 };
  }

  /**
   * 添加原始数据，并转换为绘图数据
   */
  joinData(key, value) {
    this._rawData = value;
    this._rawData.sort((a, b) => {
      let ta = new Date(a.startTime).getTime();
      let tb = new Date(b.startTime).getTime();
      return ta - tb;
    });

    let len = this._rawData.length;
    let xDomain = d3.extent(this._rawData, (d, i) => {
      return i < len - 1 ? new Date(d.startTime) : new Date(d.endTime);
    });
    let xRange = [this._margin.left, this._viewWidth - this._margin.right];
    this._xScale = d3.scaleTime(xDomain, xRange);
    this._color = d => {
      let a = [d.bad_flag, d.good_flag, d.no_flag]; // 数量统计
      let max = Math.max(...a);
      return labelColor[a.indexOf(max)];
    }

    return this;
  }

  /**
   * 绘制内容
   */
  render() {
    console.log('绘制甘特图', this)
    console.log('数据:', this._rawData);

    const xDomain = this._xScale.domain();
    const timeSpan = (xDomain[1].getTime() - xDomain[0].getTime()) * 0.3;
    const xMock = this._xScale.copy().domain([new Date(xDomain[0].getTime() + timeSpan), new Date(xDomain[1].getTime() - timeSpan)]);

    this.#renderZoom(xMock);
    const ganttBatch = this._container.selectAll('.ganttBatch')
      .data(this._rawData)
      .join('g')
        .attr('class', d => `ganttBatch`)
        .attr('id', d => `ganttBatch-${d.batch}`)
        .attr('transform', `translate(0, ${this._margin.top})`)
      .call(g => this.#ganttContent(g, xMock))   // 方块
      .call(g => this.#batchBoundary(g, xMock))  // 批次边界

    return this;
  }

  #width = (d, x) => x(new Date(d.endTime)) - x(new Date(d.startTime));

  #ganttContent(group, xScale) {
    group.selectAll('.merge-block')
      .data(d => d.category.filter(e => e.merge_flag))
      .join('g')
      .attr('class', 'merge-block')
      .call(g => 
        g.append('rect')
          .attr('class', 'merge-rect')
          .attr('x', d => xScale(new Date(d.startTime)))
          .attr('width', d => this.#width(d, xScale))
          .attr('height', 30)
          .attr('fill', this._color)
      )
    group.selectAll('.no-merge-block')
      .data(d => d.category.filter(e => !e.merge_flag))
      .join('g')
      .attr('class', 'no-merge-block')
      .call(g => 
        g.selectAll('.no-merge-line')
          .data(d => d.detail)
        .join('rect')
          .attr('class', 'no-merge-rect')
          .attr('x', d => xScale(new Date(d.toc)))
          .attr('width', 1)
          .attr('height', 30)
          .attr('fill', d => labelColorMap[d.flag_lable])
      )
  }

  #batchBoundary(group, xScale) {
    const width = 10;
    const height = this._viewHeight - this._margin.bottom - this._margin.top;
    group.attr('fill', 'red')
    group.append('path')
      .attr('class', 'batch-boundary')
      .attr('transform', d => `translate(${xScale(new Date(d.startTime))}, 0)`)
      .attr('d', Boundary.batch({ width, height }))
  }

  #renderZoom(xMock) {
    const x1y1 = [this._margin.left, this._margin.top];
    const x2y2 = [this._viewWidth - this._margin.right, this._viewHeight - this._margin.bottom];
    const zoom = d3.zoom()
      .scaleExtent([1, 32])
      .extent([x1y1, x2y2])
      .translateExtent([[x1y1[0], -Infinity], [x2y2[0], Infinity]])
      .on('zoom', e => this.#zoomed.call(this, e));

    const newTransform = getTransformFromXScales(this._xScale, xMock);  // Calculate what the transform should be to achieve the mocked scale
    
    this._container.append('rect')
      .attr('fill', 'white')
      .attr('x', x1y1[0])
      .attr('y', x1y1[1])
      .attr('width', x2y2[0] - x1y1[0])
      .attr('height', x2y2[1] - x1y1[1]);
    this._container.call(zoom.transform, newTransform); // Update the transform to the calculated one. Without this update, the chart will be jump back to it's initial domain when panning/zooming
    this._container.call(zoom);
  }

  #zoomed(event) {
    const xz = event.transform.rescaleX(this._xScale);
    this.#transAll(xz);
  }

  #transAll(newX) {
    this._container.selectAll('.ganttBatch .merge-rect')
      .attr('x', d => newX(new Date(d.startTime)))
      .attr('width', d => this.#width(d, newX))
    this._container.selectAll('.ganttBatch .no-merge-rect')
      .attr('x', d => newX(new Date(d.toc)))
    
    this._container.selectAll('.batch-boundary')
      .attr('transform', d => `translate(${newX(new Date(d.startTime))}, 0)`)
  }
}