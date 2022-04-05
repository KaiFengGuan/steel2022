<template>
  <el-card class="box-card overview-card">
    <template #header>
      <div class="card-header">
        <span>OverView</span>
      </div>
    </template>
    <OverviewMain 
      class="overview"
      :scatterData="scatterData"
    />
  </el-card>
</template>

<script setup>
import { onMounted, reactive } from "vue-demi";
import OverviewMain from './OverviewMain.vue';

// 离线数据
import scatter from '@/data/scatter.json';


let scatterData = reactive({ value: {} });
onMounted(() => {
  // 模拟promise获取数据
  setTimeout(() => {
    scatterData.value = scatter;
  }, 500);
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
</style>