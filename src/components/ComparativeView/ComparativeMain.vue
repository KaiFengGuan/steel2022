<template>
  <div :id="CompareMenuId"></div>
</template>

<script setup>
import * as d3 from 'd3';
import { defineProps, onMounted, toRaw, watch } from 'vue-demi';
import { ComparativeView, getTooltipInstance } from './main';
import TooltipClass from "@/components/Tooltip/main"
import { cloneObject } from '@/utils';

const props = defineProps(['comparativeData']);
const CompareMenuId = 'ComparativeMiew';
let renderInstance = null;
onMounted(() => {
  const ele = document.getElementById(CompareMenuId);
  const viewWidth = ele.offsetWidth;
  const viewHeight = ele.offsetHeight;
  renderInstance = new ComparativeView({ width: viewWidth, height: viewHeight }, ele);

  const eleParent = document.getElementById(CompareMenuId);
  const tooltip = new TooltipClass({ width: 200, height: 200 }, eleParent, 'global-tooltip');
  getTooltipInstance(tooltip);
})

// 这里开始绘制对比视图
const comparativeData = props.comparativeData;
watch(comparativeData, () => {
  const raw = toRaw(comparativeData.value);
  renderInstance.joinData([cloneObject(raw), cloneObject(raw), cloneObject(raw)]);
  renderInstance.render();
})

</script>