import * as d3 from 'd3';
import { SuperGroupView } from '@/utils/renderClass';
import { labelColor } from '@/utils/setting';

export default class TrendView extends SuperGroupView {
  constructor(w, h, parentNode, rootName) {
    super(w, h, parentNode, rootName);

    this._rootName = rootName;
    this._xScale = null;
    this._yScale = null;
  }

  /**
   * 添加原始数据，并转换为绘图数据
   */
  joinData(key, value) {
    this._rawData = value;

    const len = this._rawData.endTimeOutput.length;
    const dataFlat = new Array();
    for (let i = 0; i < len; i++) {
      dataFlat.push({
        endTimeOutput: this._rawData.endTimeOutput[i],
        no_flag: this._rawData.no_flag[i],
        good_flag: this._rawData.good_flag[i],
        bad_flag: this._rawData.bad_flag[i],
      })
    }
    this._stackData = d3.stack()
      .keys(['bad_flag', 'good_flag', 'no_flag'])
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone)(dataFlat)

    return this;
  }

  render() {
    let maxValue = d3.max(
      this._rawData.good_flag,
      (d, i) => d + this._rawData.bad_flag[i] + this._rawData.no_flag[i]);
    
    this._container.selectAll('g').remove();  // 先清空container
    
    const options = {
      width: this._viewWidth,
      height: this._viewHeight,
      yDomain: [0, maxValue],
      xDomain: this._rawData.endTimeOutput,
      colors: labelColor,
    }
    this.#renderStackBar(this._stackData, options);
    return this;
  }

  #renderStackBar(data, {
    width = 640, // outer width, in pixels
    height, // outer height, in pixels
    marginTop = 10,
    marginRight = 0,
    marginBottom = 10,
    marginLeft = 0,
    yDomain, // [ymin, ymax]
    yRange = [height - marginBottom, marginTop], // [bottom, top]
    xDomain, // array of x-values
    xRange = [marginLeft, width - marginRight], // [left, right]
    yPadding = 0.1, // amount of y-range to reserve to separate bars
    colors = d3.schemeTableau10, // array of colors
  } = {}) {
    const X = d3.map(data, (d, i) => i);
    const barGroup = this._container.append('g')
      .attr('class', 'trend-stack-bar-group')
      .attr('transform', `translate(${[marginLeft, marginTop]})`);
    
    const xScale = d3.scaleBand(xDomain, xRange).paddingInner(yPadding);
    const yScale = d3.scaleLinear(yDomain, yRange);

    const bar = barGroup
      .selectAll('.stack-bar')
      .data(data)
      .join('g')
        .attr('class', 'stack-bar')
        .attr('fill', (_, i) => colors[i])
      .selectAll('.bar-rect')
      .data(d => d)
      .join('rect')
        .attr('x', (_, i) => {
          return xScale(xDomain[i])
        })
        .attr('y', ([y1, y2]) => Math.min(yScale(y1), yScale(y2)))
        .attr('height', ([y1, y2]) => Math.abs(yScale(y1) - yScale(y2)))
        .attr('width', xScale.bandwidth());
  }
}