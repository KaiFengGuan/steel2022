import * as d3 from 'd3';
import { SuperSVGView, curry } from "@/utils";
import { dir } from '../Tooltip/main';
import SeriesContent from "./modules/SeriesContent";

let tooltip = null;
export function getTooltipInstance(instance) {
  tooltip = instance;
}

export class ComparativeView extends SuperSVGView {
  constructor ({ width, height }, ele) {
    super({ width, height }, ele);

    this._container.attr('id', 'comparative-view');
    
    this._margin = { top: 5, bottom: 5, left: 5, right: 5 };
    this._rawData = [];
    this._extend = null;

    this._seriesHeight = 50;  // 序列高度
    this._seriesGap = 22;     // 序列之间的空隙
  }

  joinData(value) {
    // const _extend = [];
    // const _value = [];
    // console.log('对比视图原始数据：', value)
    // for (let val of value) {
    //   _extend.push(val.max_detail);
    //   delete val.max_detail;
    //   const temp = [];
    //   for (let key in val) {
    //     temp[+key.slice(6) - 1] = val[key];
    //   }
    //   _value.push(temp);
    // }

    // console.log(_extend, _value)

    // this._extend = value.max_detail;
    // delete value.max_detail;

    // this._rawData = _value;
    // this._extend = _extend[0];

    // console.log('数据：', this._rawData);
    // console.log('范围：', this._extend);

    this._rawData = new Array(5).fill().map(() => new Array(3).fill(0));
    for (let i = 0; i < this._rawData.length; i++) {
      for (let j = 0; j < this._rawData[i].length; j++) {
        this._rawData[i][j] = parseInt(Math.random() * 20);
      }
    }

    return this;
  }

  render() {
    const seriesGroup = this._container.selectAll('.seriesGroup')
      .data(this._rawData)
      .join('g')
      .attr('class', 'seriesGroup')
      .attr('transform', (d, i) => `translate(${[this._margin.left, this._margin.top + i * (this._seriesHeight + this._seriesGap)]})`)

    this.#renderBackGround(seriesGroup);
    this.#renderSeries(seriesGroup);

    return this;
  }

  #computeWidth = () => this._viewWidth - this._margin.left - this._margin.right
  #renderBackGround(group) {
    group.append('rect')
      .attr('class', 'series-bgc')
      .attr('width', this.#computeWidth)
      .attr('height', this._seriesHeight)
      .attr('rx', this._seriesHeight *0.5)
      .attr('fill', 'white')
      .attr('stroke', '#ccc')
      .attr('stroke-width', 1)
    
    const head = 15;
    group.append('path')
      .attr('d', (d, i) => d3.line()([
        [head, this._seriesHeight / 2],
        [this.#computeWidth() - head, this._seriesHeight / 2],
      ]))
      .attr('stroke', '#ccc')
      .attr('stroke-width', 2)

  }

  #renderSeries(group) {
    const that = this;
    const width = 30;
    const gap = 45;

    group.selectAll('.content')
      .data(d => d)
      .join(
        enter => enter.append('g')
          .attr('class', 'content')
          .attr('transform', (d, i) => `translate(${[(width + gap) * i + width + 20, this._seriesHeight / 2 - width / 2]})`)
          .attr('custom--handle', function (d, i) {  // 自定义执行内容
            const instance = new SeriesContent({width: width, height: width}, d3.select(this), `content-${i}`);
            instance.joinData(d)
              .render();
          })
          .on('mouseenter', enterHandle)
          .on('mouseleave', outHandle)
      )

    function enterHandle(event, data) {
      // console.log(event.pageX, event.pageY)
      tooltip && tooltip.showTooltip({
        id: 'ddihdafljadsjfjiasdfjk',
        x: event.pageX, y: event.pageY - 2,
        direction: event.pageY < 100 ? dir.down : dir.up,
        displayText: false,
        chartFun: curry(paintContent, {a: 1}),
        box: { width: 60, height: 60 },
      });
    }
    function outHandle(event, data) {
      tooltip && tooltip.removeTooltip();
    }

    function paintContent(data, group) {
      // console.log('curry test: ', data)
      group.append('rect')
        .attr('width', 30)
        .attr('height', 30)
        .attr('fill', 'red')
      group.append('text')
        .text('以后画点啥')
      group.append('circle')
        .attr('r', 5)
    }
  }
}