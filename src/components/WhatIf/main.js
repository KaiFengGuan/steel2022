import { SuperSVGView } from '@/utils/renderClass';
import TrendView from './modules/TrendView';
import { TREND_HEIGHT } from './size';

export const TREND = 'trend';
export const GANT = 'gant';

export class WhatIfView extends SuperSVGView {
  constructor (w, h, ele) {
    super(w, h, ele);

    this._container.attr('id', 'what-if-view');
    
    this._trendView = new TrendView(w, TREND_HEIGHT, this._container, 'trend-view-root');
  }

  render(key, value) {
    switch(key) {
      case TREND:
        this._trendView.joinData(TREND, value).render();
        break;
      default:
        break;
    }
  }
}