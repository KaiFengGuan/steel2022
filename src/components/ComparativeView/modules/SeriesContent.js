import * as d3 from 'd3';
import {
  SuperGroupView,
} from '@/utils';
import { compaTooltip } from '../main';

export default class SeriesContent extends SuperGroupView {
  constructor({
    width,
    height,
    moveX = 0,
    moveY = 0,
  } = {}, parentNode, rootName) {
    super({ width, height, moveX, moveY }, parentNode, rootName);

    this._rootName = rootName;
    this._margin = { top: 0, bottom: 0, left: 0, right: 0 };

    this._rawData = null;     // 原始数据
  }

  joinData(value) {
    this._rawData = value;

    return this;
  }

  render() {
    // console.log('tooltip: ', compaTooltip)
    this._container.append('rect')
      .attr('width', this._viewWidth)
      .attr('height', this._viewHeight)
      .attr('fill', 'white')
      .attr('stroke', 'black')
      .attr('stroke-width', 1)
    
    const text = this._container.append('text')
      .text(this._rawData)
    const box = text.node().getBBox();
    text.attr('transform', `translate(${[(this._viewWidth - box.width) / 2, (this._viewHeight + box.height) / 2 - 3]})`)

    return this;
  }

}