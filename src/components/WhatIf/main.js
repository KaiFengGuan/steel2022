import { SuperSVGView } from '@/utils/renderClass';
import { TooltipClass } from '@/components/Tooltip/main';
import TrendView from './modules/TrendView';
import { TREND_HEIGHT } from './size';

export const TREND = 'trend';
export const GANT = 'gant';

export class WhatIfView extends SuperSVGView {
  constructor (w, h, ele) {
    super(w, h, ele);

    this._container.attr('id', 'what-if-view');
    this._tooltipInstance = new TooltipClass(0, 0, ele, 'tooltip-what-if');
    
    this._trendView = new TrendView(w, TREND_HEIGHT, this._container, this._tooltipInstance, 'trend-view-root');

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