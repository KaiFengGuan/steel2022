<template>
  <div :id="OverviewMenuId"></div>
</template>

<script setup>
import { defineProps, onMounted, toRaw, watch } from 'vue-demi';
import { OverView, getTooltipInstance } from './main';
import TooltipClass from "@/components/Tooltip/main"


const props = defineProps(['scatterData']);
const OverviewMenuId = 'OverviewMain';
let renderInstance = null;
onMounted(() => {
  const ele = document.getElementById(OverviewMenuId);
  const viewWidth = ele.offsetWidth;
  const viewHeight = ele.offsetHeight;
  renderInstance = new OverView({ width: viewWidth, height: viewHeight }, ele);

  const eleParent = document.getElementById(OverviewMenuId);
  const tooltip = new TooltipClass({ width: 200, height: 200 }, eleParent, 'global-tooltip');
  getTooltipInstance(tooltip);
})

// 这里开始绘制散点图
const scatterData = props.scatterData;
watch(scatterData, () => {
  renderInstance.joinData(toRaw(scatterData.value));
  renderInstance.render();
})

</script>