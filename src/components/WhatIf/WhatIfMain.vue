<template>
  <div :id="menuId"></div>
</template>

<script setup>
import { onMounted, reactive, ref, toRaw, watch } from "vue-demi";
import { WhatIfView, TREND } from './main';

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
  renderInstance.render(TREND, toRaw(plateStati.value));
});

// 绘制甘特图
const gantData = props.gantData;
watch(gantData, () => {
  // console.log('绘制甘特图');
  // console.log('数据: ', gantData.value);
});

</script>