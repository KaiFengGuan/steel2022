<template>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <span>ComparativeView</span>
      </div>
    </template>
    <ComparativeMain
      class="comparative-view"
      :comparativeData="comparativeData"
    />
  </el-card>
</template>

<script setup>
import { onMounted, reactive } from "vue-demi";
import ComparativeMain from './ComparativeMain.vue';

// 离线数据
import comparativeDataMock from '@/data/comparativeData.json';


let comparativeData = reactive({ value: {} });
onMounted(() => {
  // 模拟promise获取数据
  setTimeout(() => {
    comparativeData.value = comparativeDataMock;
  }, 500);
})

</script>

<style>
@import url('@/assets/style/MyCard.scss');
.comparative-view {
  height: 480px;
}
</style>