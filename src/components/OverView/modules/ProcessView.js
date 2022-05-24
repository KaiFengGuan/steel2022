import * as d3 from 'd3';
import {
  SuperGroupView,
  processColor,
  cloneObject,
  SegoeUI,
} from '@/utils';

import {
  computeAngle,
  computeArcFillAngle,
} from './utils';

export default class ProcessView extends SuperGroupView {
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
    this._extend = null;      // 原始数据的最大值
    this._angle = null;       // 绘制边界的数据
    this._fillData = null;    // 绘制填充的数据
    this._targetData = null;  // 批次的指标数据

    this._displaySub = true;  // 是否显示子工序
    this._colors = cloneObject(processColor);
    this._colors.unshift('#ccc');

    const temp = this.#getArcRadius();
    this._inner = temp.inner; // 内圈半径, [r1, r2]
    this._outer = temp.outer; // 外圈半径, [r1, r2]
  }

  joinData(value, extent) {
    this._rawData = value;
    this._extend = extent;
    // console.log('内部拿到的数据：', value)
    // console.log('内部拿到的extent：', extent)

    this._angle = computeAngle();
    this._fillData = computeArcFillAngle(value, extent, this._angle);

    this._targetData = {
      steelspec: 'X80M',
      target: [
        ['Length', 30.15, 'm'],
        [' Width', 5.31, 'm'],
        [' Thick', 23.1, 'mm']
      ]
    };

    return this;
  }

  render() {
    // 背景框
    // this._container.append('rect')
    //   .attr('width', this._viewWidth)
    //   .attr('height', this._viewHeight)
    //   .attr('fill', 'white')
    //   .attr('stroke', 'red')
    
    // 分割线
    const splitLineX = this._viewWidth / 2 - 2;
    this._container.append('line')
      .attr('x1', splitLineX).attr('y1', 0)
      .attr('x2', splitLineX).attr('y2', this._viewHeight)
      .attr('stroke', 'grey')
      .attr('stroke-width', 0.5)
    
    // 批次指标
    const targetGroup = this._container.append('g')
      .attr('class', 'batch-target')
    this.#batchTarget(targetGroup);  // 指标信息

    // 工序过程
    const circleGroup = this._container.append('g')
      .attr('class', 'circle-group')
      .attr('transform', `translate(${[this._viewWidth * 0.75, this._viewHeight * 0.5]})`)
    this.#stageFill(circleGroup);    // 绘制填充
    this.#stageStroke(circleGroup);  // 绘制边框

    return this;
  }

  #stageStroke(group) {
    const path_attr = g => g
        .attr('stroke', 'grey')
        .attr('stroke-width', 0.5)
        .attr('fill', 'none')

    const circleStroke = group.append('g')
      .attr('class', 'circle-stroke')
    // 母工序
    circleStroke.selectAll('.inner_stroke')
      .data(this._angle)
      .join(
        enter => enter.append('path')
          .attr('d', d => this.#arcPath(...this._inner, d.stage_start, d.stage_end))
          .attr('class', d => `inner_${d.name}_stroke`)
          .call(path_attr)
      )
    
    if (!this._displaySub) return;
    // 子工序
    circleStroke.selectAll('.outer_stroke')
      .data(this._angle.map(d => d.stage_sub).flat())
      .join(
        enter => enter.append('path')
          .attr('d', d => this.#arcPath(...this._outer, d[0], d[1]))
          .attr('class', `outer_stroke`)
          .call(path_attr)
      )
  }

  #stageFill(group) {
    const circleFill = group.append('g')
    .attr('class', 'circle-fill')
    // 母工序
    circleFill.selectAll('.inner_fill')
      .data(this._fillData.stage)
      .join(
        enter => enter.append('path')
          .attr('d', d => this.#arcPath(...this._inner, d[0], d[1]))
          .attr('fill', (_, i) => this._colors[i])
      )
    
    if (!this._displaySub) return;
    // 子工序
    circleFill.selectAll('.outer_fill')
      .data(this._fillData.sub)
      .join(
        enter => enter.append('g')
          .attr('fill', (_, i) => this._colors[i + 1])
        .selectAll('.sub_fill')
        .data(d => d)
        .join('path')
          .attr('d', d => this.#arcPath(...this._outer, d[0], d[1]))
      )
  }

  #batchTarget(group) {
    const { steelspec, target } = this._targetData;
    const titleSize = 20;
    const contentSize = 14;
    const contentSpan = 8;

    group.attr('fill', 'lightslategrey').style('font-family', SegoeUI);

    group.append('text')
      .attr('transform', `translate(${[2, titleSize]})`)
      .attr('font-size', titleSize)
      .attr('font-weight', '600')
      .text(steelspec);
    
    group.selectAll('item')
      .data(target)
      .join('text')
      .attr('transform', (_, i) => `translate(0, ${titleSize + 5 + (i + 1) * (contentSize + contentSpan)})`)
      .attr('font-size', contentSize)
      .text(d => `${d[0]}: ${d[1]}${d[2]}`);
  }

  #arcPath(r1, r2, a1, a2) {  // 参数: 半径范围, 角度范围
    return d3.arc()
      .innerRadius(r1).outerRadius(r2)
      .startAngle(a1).endAngle(a2)();
  }

  #getArcRadius() {
    const R = this._viewHeight / 2;
    const innerW = 10;
    const outerW = innerW * 0.618;
    const gap = 3;

    const outer_r2 = R - 5;
    const outer_r1 = outer_r2 - outerW;
    const inner_r2 = outer_r1 - gap;
    const inner_r1 = inner_r2 - innerW;
    if (inner_r1 < 0) throw Error('半径不能小于0 !');

    return {
      inner: [inner_r1, inner_r2],
      outer: [outer_r1, outer_r2]
    };
  }
}