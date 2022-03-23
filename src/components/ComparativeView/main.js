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
    this._extend = value.max_detail;
    delete value.max_detail;

    // 先模拟一下
    let temp = [];
    let i = 0;
    for (let key in value) {
      temp.push(value[key]);
      i++;
      if (i === 3) {
        this._rawData.push([...temp]);
        temp = [];
        i = 0;
      }
    }

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
          .attr('transform', (d, i) => `translate(${[0, i * 120]})`)
      )

    this.#renderSeries(seriesGroup);

    return this;
  }

  #renderSeries(group) {
    const that = this;
    const width = 100;
    const gap = 20;

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
  }
}