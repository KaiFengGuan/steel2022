<template>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <span>What-If View</span>
      </div>
    </template>
    <!-- <WhatIfMain
      class="what-if-view"
      :plateStati="plateStati"
      :gantData="gantData"
    /> -->
    <div id="WhatIfMain"></div>
  </el-card>
</template>

<script setup>
import { onMounted, computed, ref, reactive, toRaw, watch } from "vue-demi";
import { useStore } from "vuex";

import { HEIGHT } from './size';
import { getPlatesStatistics, getGantData, getGanttDataFromNode } from '@/api/monitor';
import { WhatIfView, TREND, GANTT, TEMPORAL } from './main';

// 离线数据
// import platesStatistics from '@/data/platesStatistics.json';
// import ganttData from '@/data/ganttData.json';
// import batchData from '@/data/batchData.json'

const store = useStore();
const monthPickDate = computed(() => store.state.monthPickDate);
const brushDate = computed(() => store.state.brushDate);

let renderInstance = null;
onMounted(() => {
  const ele = document.getElementById('WhatIfMain');
  const viewWidth = ele.offsetWidth;
  const viewHeight = ele.offsetHeight;
  renderInstance = new WhatIfView({ width: viewWidth, height: viewHeight }, ele);
})


/*******************************
 * 
 *        获取数据并绘图
 * 
 * *****************************
 */

// 趋势概览视图
let plateStati = ref(0);
watch(monthPickDate, () => {
  // 获取生产趋势统计数据
  getPlatesStatistics(5, monthPickDate.value[0], monthPickDate.value[1])
    .then(res => plateStati.value = res.data);
  // setTimeout(() => {
  //   plateStati.value = platesStatistics;
  // }, 10);
});
watch(plateStati, () => {
  renderInstance.render(TREND, toRaw(plateStati.value));
});

// 甘特视图
let gantData = ref(0);
watch(brushDate, () => {
  // 获取甘特图数据
  getGanttDataFromNode(brushDate.value[0], brushDate.value[1])
    .then(res => gantData.value = res.data);
  // setTimeout(() => {
  //   gantData.value = ganttData;
  // }, 10);
})
watch(gantData, () => {
  renderInstance.render(GANTT, toRaw(gantData.value));
});

// 诊断视图
// let time = ref(0);
// setTimeout(() => {
//   time.value = 1
// })
// watch(time, () => {
//   console.log('batch update', batchData)
//   renderInstance.render(TEMPORAL, batchData);
// });

</script>

<style>
@import url('@/assets/style/MyCard.scss');
#WhatIfMain {
  height: v-bind(HEIGHT);
}
</style>