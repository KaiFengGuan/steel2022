import { SuperSVGView, eventBus } from '@/utils';
import { TooltipClass } from '@/components/Tooltip/main';
import TrendView from './modules/TrendView';
import GanttView from './modules/GanttView';
import TemporalView from './modules/TemporalView';
import { TREND_HEIGHT, GANTT_HEIGHT, TEMPORAL_HEIGHT } from './size';

export const TREND = 'trend';
export const GANTT = 'gantt';
export const TEMPORAL = 'temporal';

// 跨视图交互 订阅 key
export const MOVE_GANTT = 'move_gantt';


export class WhatIfView extends SuperSVGView {
  constructor ({ width, height }, ele) {
    super({ width, height }, ele);

    this._container.attr('id', 'what-if-view');
    this._tooltipInstance = new TooltipClass({width: 0, height: 0}, ele, 'tooltip-what-if');
    
    this._trendView = new TrendView({ width: width, height: TREND_HEIGHT, moveY: 0 }, this._container, this._tooltipInstance, 'trend-view-root');
    this._ganttView = new GanttView({ width: width, height: GANTT_HEIGHT, moveY: TREND_HEIGHT }, this._container, this._tooltipInstance, 'gantt-view-root');
    // this._temporalView = new TemporalView(w, h - TEMPORAL_HEIGHT, this._container, 'temporal-view-root', TEMPORAL_HEIGHT);
  }

  render(key, value) {
    switch(key) {
      case TREND:
        this._trendView.joinData(TREND, value).render();
        eventBus.on(MOVE_GANTT, domain => this._trendView.updateXSelect(domain)); // 订阅, 当gantt视图拖动的时候，更新趋势视图的x轴小三角
        break;
      case GANTT:
        this._ganttView.joinData(GANTT, value).render();
      case TEMPORAL:
        // console.log('TEMPORAL')
        // this._temporalView.joinData(TEMPORAL, value).render()
        break;
      default:
        break;
    }

    return this;
  }
}