import request from '@/utils/request';
import { baseURL, nodeURL } from '@/utils/request';

/**
 * 获取时间线上的生产质量趋势统计
 * @param {Number} interval   时间间隔/粒度
 * @param {String} dateStart  选取的起始时间
 * @param {String} dateEnd    选取的结束时间
 * @returns 
 */
export function getPlatesStatistics (interval, dateStart, dateEnd) {
  return request({
    url: baseURL + `/v2.0/PlateYieldStaisticsApi/${interval}/${dateStart}/${dateEnd}/`,
    method: 'get'
  })
}

/**
 * 获取时间范围内绘制gantt图的数据
 * @param {String} dateStart 起始时间
 * @param {String} dateEnd   结束时间
 * @returns 
 */
export function getGantData (dateStart, dateEnd) {
  return request({
    url: baseURL + `/v2.0/GanttChartApi/${dateStart}/${dateEnd}/`,
    method: 'get'
  })
}
export function getGanttDataFromNode (dateStart, dateEnd) {
  return request({
    url: nodeURL + `/gantt?dateStart=${dateStart}&dateEnd=${dateEnd}`,
    method: 'get'
  })
}