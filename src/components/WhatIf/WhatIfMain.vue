<template>
  <div :id="menuId"></div>
</template>

<script setup>
import { onMounted, reactive, ref, toRaw, watch } from "vue-demi";
import { WhatIfView, TREND, GANTT } from './main';

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

</script>