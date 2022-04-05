
/**
 * 一些 数据处理逻辑 函数
 */
import * as d3 from 'd3';
import { computed } from "vue-demi";
import { useStore } from "vuex";
import { getColor } from '@/utils';
import { getOneDimensionalData } from '@/api/diagnosis';

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


// GanttView: 批次规格视图显示的指标
export const infoTarget = ['tgtthickness', 'tgtwidth', 'tgtlength'];
export const infoTargetMap = {
  tgtlength: {name: "L", unit: "m"},
  tgtwidth: {name: "W", unit: "m"},
  tgtthickness: {name: "T", unit: "mm"},
}

/**
 * GanttView: 计算所有批次规格信息视图需要展示的数据
 * @param {*} data 
 * @returns 整理后得到的数组
 */
export function allInfoData(data) {
  const result = [];
  const len = data.length;
  if (len <= 0) return result;

  const allPlates = data.map(d => d.category.map(e => e.detail)).flat(2);
  const infoExtent = {};
  infoTarget.forEach(key => infoExtent[key] = d3.extent(allPlates, d => d[key]));

  for (let i = 0; i < len; i++) {
    let count = 0;  // 是批次里的第几个块
    const batIdx = data[i].batch;
    const startTime = data[i].startTime;  // 批次startTime
    const endTime = data[i].endTime;      // 批次endTime
    const merge = data[i].category.filter(d => d.merge_flag);
    const noMerge = data[i].category.filter(d => !d.merge_flag);

    let groups = d3.groups(merge, d => d.platetype);
    for (let [cate, dat] of groups) {
      const plates = dat.map(e => e.detail).flat();
      const detail = getPlatesDetail(plates);
      const infoData = getInfoTargetData(plates, infoExtent);  // 计算这个块的规格数据
      const ID = `${batIdx}-${cate}`;
      result.push({
        batch: batIdx,
        id: ID,
        category: cate,
        startTime: startTime,
        endTime: endTime,
        count: count++,
        infoData: infoData,
        link: dat.map(linkInfo),
        detail: detail,
      });
    }
    
    if (noMerge.length) {
      noMerge.sort((a, b) => b.total - a.total);
      const plates = noMerge.map(e => e.detail).flat();
      const detail = getPlatesDetail(plates);
      const infoData = getInfoTargetData(plates, infoExtent);  // 计算这个块的规格数据
      result.push({
        batch: batIdx,
        id: `${batIdx}-${'noMerge'}`,
        category: Array.from(new Set(noMerge.map(d => d.platetype))),
        startTime: startTime,
        endTime: endTime,
        count: count++,
        infoData: infoData,
        link: noMerge.map(linkInfo),
        detail: detail,
      });
    }
  }

  return {
    data: result,
    extent: infoExtent,
  };
}
// 计算连接线的数据, allInfoData内调用
function linkInfo(data, index) {
  return {
    date: [data.startTime, data.endTime],
    color: getColor(data.good_flag, data.bad_flag, data.no_flag),
  }
}
// 计算给定钢板的规格数据, allInfoData内调用
function getInfoTargetData(plates, extent) {
  const infoData = {};
  for (let key of infoTarget) {
    infoData[key] = d3.mean(plates, d => d[key]) / extent[key][1];
  }
  return infoData;
}
// 计算给定钢板的id数据
function getPlatesDetail(plates) {
  return plates.map(d => d.upid);
}


// 计算 视窗内 批次数据过滤
function filterDisplayData(newX, data) {
  const filterHandle = (d, range) => new Date(d.startTime) >= range[0] && new Date(d.endTime) <= range[1];
  return data.filter(d => filterHandle(d, newX.domain()));
}
/**
 * GanttView: 计算 视窗内 需要显示的批次规格信息数据过滤
 * @param {*} newX 
 * @param {*} data 
 * @returns 
 */
export function getBatchDisplayInfoData(newX, data) {
  const disData = filterDisplayData(newX, data);
  const newDisData = new Map();
  
  const len = disData.length;
  if (len <= 0) return newDisData;
  let prevId = undefined;
  for (let i = 0; i < len; i++) {
    const item = disData[i];
    item['prevId'] = prevId;
    newDisData.set(item.id, item);
    prevId = item.id;
  }
  
  return newDisData;
}

/**
 * GanttView: 计算 视窗内 需要发送到诊断视图的数据
 * @param {*} newX 
 * @param {*} data 
 */
const cacheDiag = new Map();
const newCacheDiag = new Map();
export async function getDispalyDiagnosisData(newX, data, map, boundary) {
  const disData = filterDisplayData(newX, data).filter(d => map.get(d.id) > boundary ? false : true);
  const indexList = disData.map(d => d.id);
  const N = disData.length,
        mid = Math.floor(N / 2);
  let l = mid - 1, r = mid, count = 0;
  const MAX = 150;
  const res = [];
  while((l >= 0 || r < N) && count < MAX) {
    if (l >= 0) {
      count += disData[l].detail.length;
      res.push({
        id: disData[l].id,
        upids: disData[l].detail,
      });
      l -= 1;
    }
    if (r < N) {
      count += disData[r].detail.length;
      res.push({
        id: disData[r].id,
        upids: disData[r].detail,
      });
      r++;
    }
  }
  // 确保按显示的顺序返回
  // const store = useStore();
  // const monthPickDate = computed(() => store.state.monthPickDate);
  res.sort((a, b) => indexList.indexOf(a.id) - indexList.indexOf(b.id));
  // console.log('选中的日期：', monthPickDate)
  // console.log('数据：', res)

  const reqUpids = res.filter(d => !cacheDiag.has(d.id));
  reqUpids.forEach(d => cacheDiag.set(d.id, null)); // 先占坑
  if (reqUpids.length) {
    let reqDiag = (await getOneDimensionalData({ date: '2021-06', upids: reqUpids })).data;
    // console.log('请求：', reqDiag)
    
    // 缓存
    reqDiag.forEach(d => cacheDiag.set(d.id, d.data));
    // console.log(cacheDiag)
  }

  const toDiag = res.map(d => ({
    id: d.id,
    data: cacheDiag.get(d.id),
  })).filter(d => d.data && d.data.length !== 0)
  // console.log(toDiag)
  return toDiag;
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