import request from '@/utils/request';

export function getDiagnosisData (dateStart, dateEnd, data) {
  return request({
    url: `/v1.0/baogangPlot/diagnosesdatabytime/${dateStart}/${dateEnd}/default/1000`,
    method: 'post',
    data
  })
}

export function correlationData (dateStart, dateEnd, nums, data) {
  return request({
    url: `/v1.0/model/VisualizationCorrelation/${dateStart}/${dateEnd}/${nums}`,
    method: 'post',
    data
  })
}