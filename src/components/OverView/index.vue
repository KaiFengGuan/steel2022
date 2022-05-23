<template>
  <el-card class="box-card overview-card">
    <template #header>
      <div class="card-header">
        <span>OverView</span>
      </div>
    </template>
    <div id="OverviewMain"></div>
  </el-card>
</template>

<script setup>
import { onMounted, reactive, watch, ref, toRaw } from "vue-demi";
import { OverView, getTooltipInstance } from './main';
import TooltipClass from "@/components/Tooltip/main"


// 离线数据
import scatter from '@/data/scatter.json';


let scatterData = ref(0);
onMounted(() => {
  // 模拟promise获取数据
  // console.log('数据: ', scatterData, scatterData.value)
  setTimeout(() => {
    // scatterData.value++;
    scatterData.value = scatter;
  }, 2000);
})


let renderInstance = null;
onMounted(() => {
  const ele = document.getElementById('OverviewMain');
  const viewWidth = ele.offsetWidth;
  const viewHeight = ele.offsetHeight;

  renderInstance = new OverView({ width: viewWidth, height: viewHeight }, ele);
  const tooltip = new TooltipClass({ width: 200, height: 200 }, ele, 'global-tooltip');
  getTooltipInstance(tooltip);
})

// 这里开始绘制散点图
watch(scatterData, () => {
  // console.log('绘制散点图: ', toRaw(scatterData.value))
  renderInstance.joinData(toRaw(scatterData.value));
  renderInstance.render();
})

</script>

<style>
@import url('@/assets/style/MyCard.scss');
.overview {
  height: 350px;
}
.overview-card {
  margin-top: 10px;
}
#OverviewMain {
  height: 350px;
}
</style>