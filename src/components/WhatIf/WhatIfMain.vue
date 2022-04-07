<template>
  <div :id="menuId"></div>
</template>

<script setup>
import { WhatIfView, TREND, GANTT, TEMPORAL } from './main';
import { onMounted, reactive, ref, toRaw, watch, watchEffect } from "vue-demi";
// import { getDiagnosisData } from "@/api/diagnosis";
// import temporalData from '@/data/temporalData.json'
import batchData from '@/data/batchData.json'
// console.log(batchData)

const props = defineProps(['plateStati', 'gantData']);

const menuId = 'WhatIfMain';
let renderInstance = null;
onMounted(() => {
  const ele = document.getElementById(menuId);
  const viewWidth = ele.offsetWidth;
  const viewHeight = ele.offsetHeight;
  renderInstance = new WhatIfView({ width: viewWidth, height: viewHeight }, ele);
})


// 绘制生产趋势统计数据
const plateStati = props.plateStati;
watch(plateStati, () => {
  renderInstance.render(TREND, toRaw(plateStati.value));
});

// 绘制甘特图
const gantData = props.gantData;
watch(gantData, () => {
  renderInstance.render(GANTT, toRaw(gantData.value));
});


// watchEffect(() => {
//   // console.log(temporalData)
//   // renderInstance.render(TEMPORAL, temporalData);
// })
let time = ref(0);
setTimeout(()=>{
  time.value = 1
})
watch(time, () => {
  console.log('batch update', batchData)
  renderInstance.render(TEMPORAL, batchData);
});
// console.log(modulesFiles)
// watch(selectDate, () => {
//   getDiagnosisData('2021-01-03%2000:00:00', '2021-01-03%2012:00:00', )
// })
// ["slabthickness", "tgtdischargetemp", "tgtplatethickness", "tgtwidth",
//     "tgtplatelength2", "tgttmplatetemp", "cooling_start_temp",
//     "cooling_stop_temp", "cooling_rate1", "productcategory", "steelspec",
//     "status_cooling" , "fqcflag"];

</script>