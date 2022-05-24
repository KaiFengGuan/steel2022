<template>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <span>ComparativeView</span>
      </div>
    </template>
    <div id="ComparativeView"></div>
  </el-card>
</template>

<script setup>
import { onMounted, ref, watch, toRaw } from "vue-demi";
import { ComparativeView, getTooltipInstance } from './main';
import TooltipClass from "@/components/Tooltip/main"
import { cloneObject } from '@/utils';

// 离线数据
import comparativeDataMock from '@/data/comparativeData.json';


let comparativeData = ref(0);
onMounted(() => {
  // 模拟promise获取数据
  setTimeout(() => {
    comparativeData.value = comparativeDataMock;
  }, 500);
})


let renderInstance = null;
onMounted(() => {
  const ele = document.getElementById('ComparativeView');
  const viewWidth = ele.offsetWidth;
  const viewHeight = ele.offsetHeight;
  renderInstance = new ComparativeView({ width: viewWidth, height: viewHeight }, ele);

  const eleParent = document.getElementById('ComparativeView');
  const tooltip = new TooltipClass({ width: 200, height: 200 }, eleParent, 'global-tooltip');
  getTooltipInstance(tooltip);
})

// 这里开始绘制对比视图
watch(comparativeData, () => {
  const raw = toRaw(comparativeData.value);
  renderInstance.joinData([cloneObject(raw), cloneObject(raw), cloneObject(raw)]);
  renderInstance.render();
})

</script>

<style>
@import url('@/assets/style/MyCard.scss');
#ComparativeView {
  height: 350px;
}
</style>