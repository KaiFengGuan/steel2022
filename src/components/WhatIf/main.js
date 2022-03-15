import { SuperSVGView } from '@/utils/renderClass';
import { TooltipClass } from '@/components/Tooltip/main';
import TrendView from './modules/TrendView';
import GanttView from './modules/GanttView';
import { TREND_HEIGHT, GANTT_HEIGHT } from './size';

export const TREND = 'trend';
export const GANTT = 'gantt';

export class WhatIfView extends SuperSVGView {
  constructor ({ width, height }, ele) {
    super({ width, height }, ele);

    this._container.attr('id', 'what-if-view');
    this._tooltipInstance = new TooltipClass({width: 0, height: 0}, ele, 'tooltip-what-if');
    
    this._trendView = new TrendView({ width: width, height: TREND_HEIGHT, moveY: 0 }, this._container, this._tooltipInstance, 'trend-view-root');
    this._ganttView = new GanttView({ width: width, height: GANTT_HEIGHT, moveY: TREND_HEIGHT }, this._container, this._tooltipInstance, 'gantt-view-root');
  }

  render(key, value) {
    switch(key) {
      case TREND:
        this._trendView.joinData(TREND, value).render();
        break;
      case GANTT:
        this._ganttView.joinInstance('trendView', this._trendView);
        this._ganttView.joinData(GANTT, value).render();
        break;
      default:
        break;
    }

    return this;
  }
}