import { SuperGroupView } from "@/utils/renderClass";
import { labelColorMap } from '@/utils/setting';

export default class InfoView extends SuperGroupView {
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
    this._margin = { top: 10, bottom: 10, left: 10, right: 10 };
    
    this._xScale = undefined;
  }

  joinData(value, xScale) {
    this._rawData = value;
    this._xScale = xScale;
    console.log('批次规格数据: ', this._rawData)
    return this;
  }

  render() {
    this.#renderBlackground();
    return this;
  }

  #renderBlackground() {
    this._container.append('rect')
      .attr('width', this._viewWidth)
      .attr('height', this._viewHeight)
      .attr('fill', labelColorMap[0])

    this._container.append('text')
      .attr('y', 20)
      .text(this._rawData.id)
  }
}