import * as d3 from 'd3';

/**
 * ProcessView: 计算母工序子工序边界
 * @returns 
 */
export function computeAngle() {
  const PI = Math.PI;
  const prStart = -PI / 6;
  const pr_angle = PI / 3;
  const arc_gap_angle = 0.1;
  const sub_num = [5, 7, 2];  // 各母工序包含子工序的个数
  const stage_name = ['H', 'R', 'C'];

  let stage_angle = [];
  let arc_angle_sum = 2*PI - pr_angle -4*arc_gap_angle;
  let per_sub_angle = arc_angle_sum / d3.sum(sub_num);
  sub_num.forEach(d => stage_angle.push(d * per_sub_angle));

  let res = [];
  res.push({
    name: 'PR',
    stage_start: prStart,
    stage_end: prStart + pr_angle,
    stage_sub: []
  });
  for (let i = 0; i < stage_name.length; i++) {
    let stage_start = (i===0 ? (pr_angle/2) : res.slice(-1)[0].stage_end) + arc_gap_angle;
    let stage_end = stage_start + stage_angle[i];

    let _sub = [];
    for (let j = 0; j < sub_num[i]; j++) {
      let s = j===0 ? stage_start : _sub.slice(-1)[0][1];
      let e = s + per_sub_angle;
      _sub.push([s, e]);
    }

    res.push({
      name: stage_name[i],
      stage_start: stage_start,
      stage_end: stage_end,
      stage_sub: _sub
    })
  }
  
  return res;
}

/**
 * ProcessView: 计算母工序子工序每一段填充的角度
 * @param {Array} data      要处理的数据
 * @param {Object} extend   数据的最大值
 * @param {Array} angle    角度边界范围
 */
export function computeArcFillAngle(data, extend, angle) {
  const res = { stage: [], sub: [] };
  const stage = [data.production_rhythm, ...data.total_mean];
  const sub = [data.heating_mean, data.rolling_mean, data.cooling_mean];
  const map = ['heating_max', 'rolling_max', 'cooling__max'];
  stage.forEach((d, i) => {
    const span = angle[i].stage_end - angle[i].stage_start;
    const start = angle[i].stage_start;
    const end = start + (d / extend.total_max[i]) * span;
    res.stage.push([start, end]);
  });
  sub.forEach((item, idx) => {
    const _sub = [];
    const extArr = angle[idx + 1].stage_sub;
    item.forEach((d, i) => {
      const span = extArr[i][1] - extArr[i][0];
      const start = extArr[i][0];
      const end = start + (d / extend[map[idx]][i]) * span;
      _sub.push([start, end]);
    })
    res.sub.push(_sub);
  });

  return res;
}
