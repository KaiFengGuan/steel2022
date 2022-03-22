import { SuperSVGView } from "@/utils";


export class ComparativeView extends SuperSVGView {
  constructor ({ width, height }, ele) {
    super({ width, height }, ele);

    this._container.attr('id', 'comparative-view');
    
    this._rawData = null;
  }

  joinData(value) {
    this._rawData = value;

    return this;
  }

  render() {
    console.log('拿到数据了：', this._rawData);

    return this;
  }
}