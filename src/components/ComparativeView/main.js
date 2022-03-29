import * as d3 from 'd3';
import { SuperSVGView } from "@/utils";
import ProcessView from "./modules/ProcessView";


export class ComparativeView extends SuperSVGView {
  constructor ({ width, height }, ele) {
    super({ width, height }, ele);

    this._container.attr('id', 'comparative-view');
    
    this._rawData = [];
    this._extend = null;
  }

  joinData(value) {
    const _extend = [];
    const _value = [];
    console.log('对比视图原始数据：', value)
    for (let val of value) {
      _extend.push(val.max_detail);
      delete val.max_detail;
      const temp = [];
      for (let key in val) {
        temp[+key.slice(6) - 1] = val[key];
      }
      _value.push(temp);
    }

    console.log(_extend, _value)

    this._extend = value.max_detail;
    delete value.max_detail;

    this._rawData = _value;
    this._extend = _extend[0];

    console.log('数据：', this._rawData);
    console.log('范围：', this._extend);

    return this;
  }

  render() {
    const seriesGroup = this._container.selectAll('.seriesGroup')
      .data(this._rawData)
      .join(
        enter => enter.append('g')
          .attr('class', 'seriesGroup')
          .attr('transform', (d, i) => `translate(${[0, i * 90]})`)
      )

    this.#renderSeries(seriesGroup);

    return this;
  }

  #renderSeries(group) {
    const that = this;
    const width = 80;
    const gap = 10;

    group.selectAll('.content')
      .data(d => d)
      .join(
        enter => enter.append('g')
          .attr('class', 'content')
          .attr('transform', (d, i) => `translate(${[(width + gap) * i, 0]})`)
          .attr('custom--handle', function (d, i) {  // 自定义执行内容
            const instance = new ProcessView({width: width, height: width}, d3.select(this), null, `series-${i}`);
            instance.joinData(d, that._extend)
              .render();
          })
      )
    
    group.selectAll('.series-line')
      .data(d => new Array(d.length).fill(0))
      .join('path')
      .attr('d', (d, i) => d3.line()([
        [width * (i + 1) + gap * i - 4, width / 2],
        [width * (i + 1) + gap * i + 4 + gap, width / 2],
      ]))
      .attr('stroke', '#ccc')
      .attr('stroke-width', 2)
  }
}