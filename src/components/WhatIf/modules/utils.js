
/**
 * 一些 数据处理逻辑 函数
 */
import * as d3 from 'd3';
import { getColor } from '@/utils';

/**
 * Calculate what the transform should be to achieve the mocked scale
 */
export function getTransformFromXScales (initialScale, frameScale, range = initialScale.range()) {
  // For dates, get the time instead of the date objects
  const initialDomain = initialScale.domain().map(d => d.getTime());
  const frameDomain = frameScale.domain().map(d => d.getTime());

  const frameDomainLength = frameDomain[1] - frameDomain[0];
  const initialDomainLength = initialDomain[1] - initialDomain[0];
  const rangeLength = range[1] - range[0];
  const midpoint = (initialDomain[0] + initialDomain[1]) / 2;
  const rangeConversion = rangeLength / initialDomainLength;

  // Get scale from domain lengths
  const k = initialDomainLength / frameDomainLength;

  // Figure out where the initial domain midpoint falls on the initial domain and the frame domain,
  // as a ratio of the distance-from-the-lower-domain-bound-to-the-midpoint to the appropriate
  // domain length.
  const midpointInitialRatio = (midpoint - initialDomain[0]) / initialDomainLength;
  const midpointFrameRatio = (midpoint - frameDomain[0]) / frameDomainLength;

  // Calculate the ratio translation required to move the initial midpoint ratio to its
  // location on the frame domain. Then convert to domain units, and finally range units.
  const midpointRatioTranslation = midpointFrameRatio - midpointInitialRatio * k;
  const domainXTranslation = midpointRatioTranslation * initialDomainLength;
  const rangeXTranslation = domainXTranslation * rangeConversion;

  return d3.zoomIdentity.translate(rangeXTranslation, 0).scale(k);
}

/**
 * GanttView: 计算 视窗内 需要显示的批次规格信息数据过滤
 * @param {*} newX 
 * @param {*} data 
 * @returns 
 */
export function getBatchDisplayInfoData(newX, data) {
  const filterHandle = (d, range) => new Date(d.startTime) > range[0] && new Date(d.endTime) < range[1];
  const disData = data.filter(d => filterHandle(d, newX.domain()));
  const newDisData = new Map();
  // console.log('显示的批次数据: ', disData);
  
  const len = disData.length;
  if (len <= 0) return newDisData;
  let prevId = undefined;
  for (let i = 0; i < len; i++) {
    let count = 0;
    const batIdx = disData[i].batch;
    const startTime = disData[i].startTime;
    const merge = disData[i].category.filter(d => d.merge_flag);
    const noMerge = disData[i].category.filter(d => !d.merge_flag);

    let groups = d3.groups(merge, d => d.platetype);
    for (let [cate, dat] of groups) {
      // console.log('dat: ', dat);
      const ID = `${batIdx}-${cate}`;
      newDisData.set(ID, {
        batch: batIdx,
        id: ID,
        prevId: prevId,
        count: count++,
        category: cate,
        startTime: startTime,
        link: dat.map(linkInfo),
      });
      prevId = ID;
    }
    // console.log('noMerge: ', noMerge);
    if (noMerge.length) {
      noMerge.sort((a, b) => b.total - a.total);
      newDisData.set(`${batIdx}-${'noMerge'}`, {
        batch: batIdx,
        id: `${batIdx}-${'noMerge'}`,
        prevId: prevId,
        count: count++,
        category: Array.from(new Set(noMerge.map(d => d.platetype))),
        startTime: startTime,
        link: noMerge.map(linkInfo),
      });
    }
  }
  
  return newDisData;
}
// 计算连接线的数据, getBatchDisplayInfoData内调用
function linkInfo(data, index) {
  return {
    date: [data.startTime, data.endTime],
    color: getColor(data.good_flag, data.bad_flag, data.no_flag),
  }
}

/**
 * GanttView: 给定一个大的标尺和小的标尺，判断一个数据是否从右边进入小标尺
 * @param {小范围的标尺} minScale 
 * @param {大范围的标尺} maxScale 
 * @param {日期格式字符串} data 
 * @returns true | false
 */
export function comeFromRight(minScale, maxScale, data) {
  let minDomain = minScale.domain();
  let maxDomain = maxScale.domain();
  let time = new Date(data);

  return time >= minDomain[1] && time <= maxDomain[1] ? true : false;
}