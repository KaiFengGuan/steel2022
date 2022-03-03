import * as d3 from 'd3';
import { SuperGroupView } from '@/utils/renderClass';
import { labelColor } from '@/utils/setting';

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

    const renderData = this._rawData;
    const ganttBatch = this._container.selectAll('.ganttBatch')
    .data(renderData)
    .join('g')
      .attr('class', d => `ganttBatch-${d.batch}`)
      .attr('transform', `translate(0, ${this._margin.top})`)
    .call(g => this.#ganttContent(g))   // 方块
    .call(g => this.#batchBoundary(g))  // 批次边界

    return this;
  }

  #ganttContent(group) {
    const width = d => this._xScale(new Date(d.endTime)) - this._xScale(new Date(d.startTime));
    
    let mergeBlock = group.selectAll('.merge-block')
      .data(d => d.category.filter(e => e.merge_flag))
      .join('g')
      .attr('class', 'merge-block')
      .call(g => merge.call(this, g))
    let noMergeBlock = group.selectAll('.no-merge-block')
      .data(d => d.category.filter(e => !e.merge_flag))
      .join('g')
      .attr('class', 'no-merge-block')
      .call(g => noMerge.call(this, g))

    
    
    function merge(g) {
      g.append('rect')
        .attr('x', d => this._xScale(new Date(d.startTime)))
        .attr('width', width)
        .attr('height', 30)
        .attr('fill', this._color)
    }
    function noMerge(g) {
      g.selectAll('.no-merge-line')
        .data(d => d.detail)
      .join('rect')
        .attr('x', d => this._xScale(new Date(d.toc)))
        .attr('width', 1)
        .attr('height', 30)
        .attr('fill', d => labelColor[d.flag_lable])
    }
    

    return group;
  }

  #batchBoundary(group) {
    group.append('path')
      .attr('x', d => this._xScale(d.startTime))

      group.append('path')
      .attr('x', d => this._xScale(d.endTime))
  }
}