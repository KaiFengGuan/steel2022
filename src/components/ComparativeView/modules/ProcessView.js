import * as d3 from 'd3';
import {
  SuperGroupView,
  processColor,
  cloneObject,
} from '@/utils';

import {
  computeAngle,
} from './utils';

export default class ProcessView extends SuperGroupView {
  constructor({
    width,
    height,
    moveX = 0,
    moveY = 0,
  } = {}, parentNode, tooltipIns, rootName) {
    super({ width, height, moveX, moveY }, parentNode, rootName);

    this._rootName = rootName;
    this._tooltip = tooltipIns;
    this._margin = { top: 0, bottom: 0, left: 0, right: 0 };

    this._rawData = null;
    this._extend = null;
    this._angle = null;    // 各工序角度边界
    this._displaySub = true;
    this._colors = cloneObject(processColor);
    this._colors.unshift('#ccc');

    // 一些尺寸定义 
    this._arc_start = -Math.PI/6;
  }

  joinData(value, extent) {
    this._rawData = value;
    this._extend = extent;

    return this;
  }

  render() {
    this._angle = computeAngle();
    console.log(this._rootName + '子类拿到的数据：', this._rawData);
    console.log(this._angle);

    const circleGroup = this._container.append('g')
      .attr('class', 'circle-group')
      .attr('transform', `translate(${[this._viewWidth * 0.5, this._viewHeight * 0.5]})`)
    
    this.#stageStroke(circleGroup);  // 绘制边框
    this.#stageFill(circleGroup);    // 绘制填充

    return this;
  }

  #stageStroke(group) {
    const path_attr = g => g
        .attr('stroke', 'grey')
        .attr('stroke-width', 1)
        .attr('fill', 'none')

    const circleStroke = group.append('g')
      .attr('class', 'circle-stroke')
    // 母工序
    circleStroke.selectAll('.inner_stroke')
      .data(this._angle)
      .join(
        enter => enter.append('path')
          .attr('d', d => this.#arcPath(30, 40, d.stage_start, d.stage_end))
          .attr('class', d => `inner_${d.name}_stroke`)
          .call(path_attr)
      )
    
    if (!this._displaySub) return;
    // 子工序
    circleStroke.selectAll('.outer_stroke')
      .data(this._angle.map(d => d.stage_sub).flat())
      .join(
        enter => enter.append('path')
          .attr('d', d => this.#arcPath(45, 55, d[0], d[1]))
          .attr('class', `outer_stroke`)
          .call(path_attr)
      )
  }

  #stageFill(group) {
    const circleFill = group.append('g')
    .attr('class', 'circle-fill')
    // 母工序
    circleFill.selectAll('.inner_fill')
      .data([this._rawData.production_rhythm, ...this._rawData.total_mean])
      .join(
        enter => enter.append('path')
          .attr('d', (d, i) => {
            const span = this._angle[i].stage_end - this._angle[i].stage_start;
            const start = this._angle[i].stage_start;
            const end = start + (d / this._extend.total_max[i]) * span;
            return this.#arcPath(30, 40, start, end);
          })
          .attr('fill', (_, i) => this._colors[i])
      )
    
    if (!this._displaySub) return;
    // 子工序
    const subData = [[], this._rawData.heating_mean, this._rawData.rolling_mean, this._rawData.cooling_mean];
    circleFill.selectAll('.outer_fill')
      
  }

  #arcPath(r1, r2, a1, a2) {  // 参数：半径范围, 角度范围
    return d3.arc()
      .innerRadius(r1).outerRadius(r2)
      .startAngle(a1).endAngle(a2)();
  }
}