import request from '@/utils/request';

export function mareyTimesData (dateStart, dateEnd, coefficient, data) {
  return request({
    url: `/v1.0/newGetMareyTimesDataApi/all/${dateStart}/${dateEnd}/${coefficient}`,
    method: 'post',
    data
  })
}

export function mareyStation (dateStart, dateEnd, data) {
  return request({
    url: `/v1.0/newGetMareyStationsDataApi/all/${dateStart}/${dateEnd}/`,
    method: 'post',
    data
  })
}

export function monitorData (dateStart, dateEnd, type, limit, data) {
  return request({
    url: `/v1.0/baogangPlot/monitordatabytime/${dateStart}/${dateEnd}/${type}/${limit}`,
    method: 'post',
    data
  })
}

export function eventData (dateStart, dateEnd, threshold, operation) {
  return request({
    url: `/v1.0/eventDataApi/${dateStart}/${dateEnd}/30/${threshold}/${operation}/`,
    method: 'get'
  })
}