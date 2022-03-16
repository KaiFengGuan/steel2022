import { SuperSVGView } from '@/utils/renderClass';
import TrendView from './modules/TrendView';
import TemporalView from './modules/TemporalView';
import { TREND_HEIGHT, TEMPORAL_HEIGHT} from './size';

export const TREND = 'trend';
export const GANT = 'gant';
export const TEMPORAL = 'temporal';

export class WhatIfView extends SuperSVGView {
  constructor (w, h, ele) {
    super(w, h, ele);

    this._container.attr('id', 'what-if-view');
    
    this._trendView = new TrendView(w, TREND_HEIGHT, this._container, 'trend-view-root');

    this._temporalView = new TemporalView(w, h - TEMPORAL_HEIGHT, this._container, 'temporal-view-root', TEMPORAL_HEIGHT);
  }

  render(key, value) {
    switch(key) {
      case TREND:
        // console.log('TREND')
        this._trendView.joinData(TREND, value).render();
        break;
      case TEMPORAL:
        console.log('TEMPORAL')
        this._temporalView.joinData(TEMPORAL, value).render()
        break;
      default:
        break;
    }
  }
}