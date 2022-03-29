import * as d3 from 'd3';
import {
  SuperGroupView,
  labelColor,
  labelColorMap,
  getColor,
  eventBus,
} from '@/utils';
import { Boundary } from './Boundary';
import InfoView from './InfoView';
import { MOVE_GANTT } from '../main';
import {
  getTransformFromXScales,
  getBatchDisplayInfoData,
  allInfoData,
  comeFromRight,
} from './utils';

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
    this._rawData = undefined;    // 原始数据
    this._infoData = undefined;   // 全部批次的规格绘图数据
    this._infoExtent = undefined; // 规格范围
    this._xScale = null;
    this._displayScale = null;

    this._batchDisplayMap = new Map();  // 储存显示的图元实例
    this._batchDisplayDat = new Map();  // 储存需要显示的数据

    this._instanceKey = [];
    this._ganttHeight = 30;
  }

  // 添加原始数据，并转换为绘图数据
  joinData(key, value) {
    this._rawData = value;
    this._rawData.sort((a, b) => {
      let ta = new Date(a.startTime).getTime();
      let tb = new Date(b.startTime).getTime();
      return ta - tb;
    });
    let result = allInfoData(this._rawData);
    this._infoData = result.data;
    this._infoExtent = result.extent;
    // console.log(this._infoData)

    let len = this._rawData.length;
    let xDomain = d3.extent(this._rawData, (d, i) => {
      return i < len - 1 ? new Date(d.startTime) : new Date(d.endTime);
    });
    let xRange = [this._margin.left, this._viewWidth - this._margin.right];
    this._xScale = d3.scaleTime(xDomain, xRange);
    return this;
  }

  // 绘制内容
  render() {
    console.log('绘制甘特图', this)
    console.log('数据:', this._rawData);

    const xDomain = this._xScale.domain();
    const timeSpan = (xDomain[1].getTime() - xDomain[0].getTime()) * 0.3;
    const xMock = this._xScale.copy().domain([new Date(xDomain[0].getTime() + timeSpan), new Date(xDomain[1].getTime() - timeSpan)]);
    this._displayScale = xMock;

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

  // 跨视图交互
  #updateOtherInstance() { // 需要更新相关实例: 参数是与zoom相关的横轴, 这里传的是一个范围
    const disDomain = this._displayScale.domain();
    eventBus.emit(MOVE_GANTT, disDomain);
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
          .attr('fill', d => getColor(d.good_flag, d.bad_flag, d.no_flag))
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
          .attr('height', this._ganttHeight)
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
      .scaleExtent([1, 15])
      .extent([x1y1, x2y2])
      .translateExtent([[x1y1[0], -Infinity], [x2y2[0], Infinity]])
      .on('zoom', e => this.#zoomed.call(this, e));
    
    this._container.append('rect')
      .attr('fill', 'white')
      .attr('x', x1y1[0])
      .attr('y', x1y1[1])
      .attr('width', x2y2[0] - x1y1[0])
      .attr('height', x2y2[1] - x1y1[1]);
    const newTransform = getTransformFromXScales(this._xScale, xMock);
    this._container.call(zoom.transform, newTransform); // Update the transform to the calculated one. Without this update, the chart will be jump back to it's initial domain when panning/zooming
    this._container.call(zoom);
  }

  #zoomed(event) {
    const xz = event.transform.rescaleX(this._xScale);
    this._displayScale = xz;
    this.#transAll(xz);
    this.#updateOtherInstance();

    // 过滤计算得到显示的规格数据
    const displayData = getBatchDisplayInfoData(xz, this._infoData);
    this.#batchInfoRender(xz, displayData, this._batchDisplayMap);
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

  #batchInfoRender(newX, data, instanceMap) {
    const that = this;
    const idList = Array.from(data.keys());
    const transY = 150;  // 规格信息group起始高度
    const infoW = 100;
    const infoH = 100;
    const infoSpace = 20;

    let prevPos = undefined, offsetMap = new Map();  // 计算offset并保存
    for (let id of idList) {
      let val = data.get(id);
      let curPos = newX(new Date(val.startTime)) + val.count * (infoW + infoSpace);
      curPos = prevPos && prevPos + (infoW + infoSpace) > curPos ? prevPos + (infoW + infoSpace) : curPos;
      offsetMap.set(id, curPos);
      prevPos = curPos;
    }

    const computedTrans = id => `translate(${[offsetMap.get(id), transY]})`;
    const display = id => offsetMap.get(id) > this._viewWidth - infoW ? 'none' : '';
    const t = this._container.transition().duration(100);

    this._container.selectAll('.info-root')
      .data(idList, id => id)
      .join(enterHandle, updateHandle, exitHandle)
    
    function enterHandle(enter) {
      enter.append('g')
        .attr('class', 'info-root')
        .attr('transform', d => `translate(${[0, transY]})`)
        .attr('display', display)
        .attr('custom--handle', function (id) {
          const offset = offsetMap.get(id);
          const instance = new InfoView({width: infoW, height: infoH}, d3.select(this), null, id);
          instanceMap.set(id, instance);
          instance.joinData(data.get(id), that._infoExtent)
            .initState(newX, offset)
            .render();
        })
      .call(enter => enter.transition(t)
        .attr('transform', computedTrans))
    }
    function updateHandle(update) {
      update
        .attr('display', display)
        .attr('custom--handle', id => {
          const offset = offsetMap.get(id);
          instanceMap.get(id).update(newX, offset);
        })
        .call(g => g.transition(t)
          .attr('transform', computedTrans))
    }
    function exitHandle(exit) {
      exit.attr('custom--handle', id => {
        instanceMap.delete(id);
      })
      .call(g => g.transition(t)
        .attr('opacity', 0)
        .remove())
    }
  }
}