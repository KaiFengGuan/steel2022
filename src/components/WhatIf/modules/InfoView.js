import * as d3 from 'd3';
import {
  SuperGroupView,
  labelColorMap,
} from '@/utils';

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
    this._margin = { top: 10, bottom: 10, left: 10, right: 10 };
    
    this._xScale = undefined;
    this._offset = undefined; // 规格信息group相对于gantt的偏移量
  }

  joinData(value, ) {
    this._rawData = value;
    // console.log('批次规格数据: ', this._rawData)
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
    return this;
  }

  update() {
    this.#updateLink();
    return this;
  }

  #renderBlackground() {
    this._container.append('rect')
      .attr('width', this._viewWidth)
      .attr('height', this._viewHeight)
      .attr('stroke', labelColorMap[0])
      .attr('stroke-width', 5)
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
}