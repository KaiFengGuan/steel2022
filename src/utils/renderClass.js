class SuperView {
  constructor(w, h) {
    this._viewWidth = w;
    this._viewHeight = h;
  }

  joinData(key, value) {
    this[`data_${key}`] = value;
    return this;
  }

  render() {}
}

/**
 * 定义 SVG 根节点超类
 */
import * as d3 from 'd3';

export class SuperSVGView extends SuperView {
  constructor (w, h, ele) {
    super(w, h);

    this._container = d3.select(ele)
      .append('svg')
      .attr('class', 'root-svg')
      .attr('width', w)
      .attr('height', h);
  }

}

/**
 * 定义 SVG Group 节点的超类
 */
export class SuperGroupView extends SuperView {
  constructor (w, h, parentNode, rootName) {
    super(w, h);

    this._parent = parentNode;
    this._container = parentNode.append('g')
      .attr('id', rootName);
    this._margin = { top: 10, bottom: 10, left: 10, right: 10 };
  }

}