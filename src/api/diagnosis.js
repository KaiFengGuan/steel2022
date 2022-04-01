import request from '@/utils/request';
import { baseURL, nodeURL } from '@/utils/request';

export function getDiagnosisData (dateStart, dateEnd, data) {
  return request({
    url: baseURL + `/v1.0/baogangPlot/diagnosesdatabytime/${dateStart}/${dateEnd}/default/1000`,
    method: 'post',
    data
  })
}

export function correlationData (dateStart, dateEnd, nums, data) {
  return request({
    url: baseURL + `/v1.0/model/VisualizationCorrelation/${dateStart}/${dateEnd}/${nums}`,
    method: 'post',
    data
  })
}

export function getOneDimensionalData (data) {
  return request({
    url: nodeURL + `/diagnosis`,
    method: 'post',
    data
  })
}