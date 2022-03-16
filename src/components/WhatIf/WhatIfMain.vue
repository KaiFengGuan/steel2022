<template>
  <div :id="menuId"></div>
</template>

<script setup>
import { onMounted, reactive, ref, toRaw, watch, watchEffect } from "vue-demi";
import { WhatIfView, TREND, TEMPORAL } from './main';
// import { getDiagnosisData } from "@/api/diagnosis";
// import temporalData from '@/data/temporalData.json'
import batchData from '@/data/batchData.json'
console.log(batchData)

const props = defineProps(['plateStati', 'gantData']);

const menuId = 'WhatIfMain';
const viewWidth = ref(0);
const viewHeight = ref(0);
let renderInstance = null;
onMounted(() => {
  const ele = document.getElementById(menuId);
  viewWidth.value = ele.offsetWidth;
  viewHeight.value = ele.offsetHeight;
  renderInstance = new WhatIfView(viewWidth.value, viewHeight.value, ele);
})


// 绘制生产趋势统计数据
const plateStati = props.plateStati;
watch(plateStati, () => {
  console.log('绘制生产趋势统计数据');
  console.log('数据: ', plateStati.value)
  
  renderInstance.render(TREND, toRaw(plateStati.value));
});

// 绘制甘特图
const gantData = props.gantData;
watch(gantData, () => {
  // console.log('绘制甘特图');
  // console.log('数据: ', gantData.value);
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
  console.log(batchData)
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