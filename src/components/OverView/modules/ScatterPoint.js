import * as d3 from 'd3';
import {
  SuperGroupView,
  labelColor,
} from '@/utils';

export default class ScatterPoint extends SuperGroupView {
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
    const data = this._rawData;
    const r = this._viewWidth;
    const pie = d3.pie()([data.bad, data.good, data.no]);
    const path = d3.arc().outerRadius(r).innerRadius(0);
    const arcGroup = this._container.selectAll('.arc')
      .data(pie)
      .join('path')
      .attr('d', path)
      .attr('fill', (_, i) => labelColor[i])

    return this;
  }
}