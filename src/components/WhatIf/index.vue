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
import { getPlatesStatistics } from '@/api/overview';

import platesStatistics from '@/data/platesStatistics.json';

const store = useStore();
const monthPickDate = computed(() => store.state.monthPickDate);

let plateStati = reactive({ value: {} });
let gantData = reactive({ value: {}});

watch(monthPickDate, () => {
  // 获取生产趋势统计数据
  getPlatesStatistics(10, monthPickDate.value[0], monthPickDate.value[1])
    .then(res => plateStati.value = res.data);
  // setTimeout(() => {
  //   plateStati.value = platesStatistics;
  // }, 10);

  // 获取甘特图数据
  setTimeout(() => {
    gantData.value = {a: 1};
  }, 5000);
});

</script>

<style>
@import url('@/assets/style/MyCard.scss');
.what-if-view {
  height: v-bind(HEIGHT);
}
</style>