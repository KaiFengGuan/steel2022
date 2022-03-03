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
  constructor ({
    width,
    height,
  } = {}, ele) {
    super(width, height);

    this._container = d3.select(ele)
      .append('svg')
      .attr('class', 'root-svg')
      .attr('width', width)
      .attr('height', height);
  }

}

/**
 * 定义 SVG Group 节点的超类
 */
export class SuperGroupView extends SuperView {
  constructor ({
    width = 0,
    height = 0,
    moveX = 0,
    moveY = 0,
  } = {}, parentNode, rootName) {
    super(width, height);

    this._parent = parentNode;
    this._container = parentNode.append('g')
      .attr('id', rootName)
      .attr('transform', `translate(${[moveX, moveY]})`);
    this._margin = { top: 10, bottom: 10, left: 10, right: 10 };
  }

}