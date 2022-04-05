import * as d3 from 'd3';
import { SuperSVGView, curry } from '@/utils';
import { detailsExtent } from './modules/utils';
import ScatterPoint from './modules/ScatterPoint';
import ProcessView from './modules/ProcessView';
import { dir } from '@/components/Tooltip/main';

export let scatterTooltip = null;
export function getTooltipInstance(instance) {
  scatterTooltip = instance;
}

export class OverView extends SuperSVGView {
  constructor ({ width, height }, ele) {
    super({ width, height }, ele);

    this._container.attr('id', 'over-view');
    
    this._margin = { top: 10, bottom: 10, left: 10, right: 10 };
    this._rawData = [];     // 原始数据
    this._paintData = {};   // 散点图数据映射
    this._idList = [];      // 散点图显示的列表
    this._pointMap = new Map(); // 保存散点图图元实例
    this._processExtent = {}; // 工序图元的数据范围（最大值）

    this._scaleX = null;  // x 标尺
    this._scaleY = null;  // y 标尺
    this._scaleR = null;  // 图元半径 标尺
  }

  joinData(value) {
    this._rawData = value.filter(d => d.x !== undefined);
    this._rawData.sort((a, b) => (a.good + a.bad + a.no) - (b.good + b.bad + b.no));
    this._rawData.forEach(d => {
      const id = `${d.bat_index}-${d.cat_index}`;
      this._idList.push(id);
      this._paintData[id] = d;
    });
    this._processExtent = detailsExtent(this._rawData);
    console.log(this._processExtent)

    const xList = this._rawData.map(d => d.x ? d.x : 0);
    const yList = this._rawData.map(d => d.y ? d.y : 0);
    const nList = this._rawData.map(d => d.good + d.bad + d.no);
    const xDomain = d3.extent(xList);
    const yDomain = d3.extent(yList);
    const rDomain = d3.extent(nList);
    const xRange = [this._margin.left, this._viewWidth - this._margin.right];
    const yRange = [this._margin.top, this._viewHeight - this._margin.bottom];
    const rRange = [0, 15];

    this._scaleX = d3.scaleLinear(xDomain, xRange);
    this._scaleY = d3.scaleLinear(yDomain, yRange);
    this._scaleR = d3.scaleLinear(rDomain, rRange);

    return this;
  }

  render() {
    // console.log(this._paintData)
    // console.log(this._idList)
    this._container.selectAll('.scatterGroup')
      .data(this._idList)
      .join(
        enter => this.#enterHandle(enter),
        update => this.#updateHandle(update),
        exit => this.#exitHandle(exit)
      )

    return this;
  }

  #enterHandle(group) {
    const that = this;

    const scatterGroup = group.append('g')
      .attr('class', 'scatterGroup')
      .attr('transform', id => {
        const datum = that._paintData[id];
        const x = that._scaleX(datum.x);
        const y = that._scaleY(datum.y);
        return `translate(${[x, y]})`;
      })
      .attr('custom--handle', function(id) {
        const datum = that._paintData[id];
        const r = that._scaleR(datum.good + datum.bad + datum.no);
        const instance = new ScatterPoint({width: r, height: r}, d3.select(this), id);
        instance.joinData(datum).render();
        that._pointMap.set(id, instance);
      })
    
    scatterGroup
      .on('mouseenter', (e, d) => this.#mouseenterHandle(e, d))
      .on('mouseleave', (e, d) => this.#mouseleaveHandle(e, d))
  }

  #updateHandle(group) {

  }

  #exitHandle(group) {

  }

  #mouseenterHandle(event, id) {
    const datum = this._paintData[id];
    const contentWidth = 100;
    scatterTooltip && scatterTooltip.showTooltip({
      id: id,
      x: event.pageX, y: event.pageY - 2,
      direction: dir.up,
      displayText: false,
      chartFun: curry(paintContent, datum.details, this._processExtent),
      box: { width: contentWidth, height: contentWidth },
    })

    function paintContent(data, extent, group) {
      const instance = new ProcessView({ width: contentWidth, height: contentWidth}, group, `${id}-content`);
      instance.joinData(data, extent).render();
      
      group.append('circle')
        .attr('r', 10)
    }
  }

  #mouseleaveHandle(event, data) {
    scatterTooltip && scatterTooltip.removeTooltip();
  }
}
