<template>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <span>What-If View</span>
      </div>
    </template>
    <WhatIfMain
      class="what-if-view"
      :plateStati="plateStati"
      :gantData="gantData"
    />
  </el-card>
</template>

<script setup>
import { computed, reactive, watch } from "vue-demi";
import { useStore } from "vuex";

import { HEIGHT } from './size';
import WhatIfMain from './WhatIfMain.vue';
import { getPlatesStatistics, getGantData } from '@/api/monitor';

// 离线数据
import platesStatistics from '@/data/platesStatistics.json';
import ganttData from '@/data/ganttData.json';

const store = useStore();
const monthPickDate = computed(() => store.state.monthPickDate);
const brushDate = computed(() => store.state.brushDate);

let plateStati = reactive({ value: {} });
let gantData = reactive({ value: {}});

watch(monthPickDate, () => {
  // 获取生产趋势统计数据
  // getPlatesStatistics(5, monthPickDate.value[0], monthPickDate.value[1])
  //   .then(res => plateStati.value = res.data);
  setTimeout(() => {
    plateStati.value = platesStatistics;
  }, 10);
});
watch(brushDate, () => {
  // 获取甘特图数据
  // getGantData(brushDate.value[0], brushDate.value[1])
  //   .then(res => gantData.value = res.data);
  setTimeout(() => {
    gantData.value = ganttData;
  }, 10);
})

</script>

<style>
@import url('@/assets/style/MyCard.scss');
.what-if-view {
  height: v-bind(HEIGHT);
}
</style>