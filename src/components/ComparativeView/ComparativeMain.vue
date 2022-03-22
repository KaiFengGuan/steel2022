<template>
  <div :id="menuId"></div>
</template>

<script setup>
import { defineProps, onMounted, toRaw, watch } from 'vue-demi';
import { ComparativeView } from './main';

const props = defineProps(['comparativeData']);

const menuId = 'ComparativeMiew';
let renderInstance = null;
onMounted(() => {
  const ele = document.getElementById(menuId);
  const viewWidth = ele.offsetWidth;
  const viewHeight = ele.offsetHeight;
  renderInstance = new ComparativeView({ width: viewWidth, height: viewHeight }, ele);
})

// 这里开始绘制对比视图
const comparativeData = props.comparativeData;
watch(comparativeData, () => {
  renderInstance.joinData(toRaw(comparativeData.value));
  renderInstance.render();
})

</script>