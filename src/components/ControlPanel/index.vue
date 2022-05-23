<template>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <span>Control Panel</span>
      </div>
    </template>
    <div id="ControlPanelMain">SVG SVG SVG</div>
  </el-card>
</template>

<script setup>
import { onMounted, ref, watch, toRaw } from "vue-demi";

onMounted(() => console.log('control panel'))
</script>

<style>
@import url('@/assets/style/MyCard.scss');
#ControlPanelMain {
  height: 480px;
}
</style>