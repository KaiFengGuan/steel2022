import * as d3 from 'd3';

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