<template>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <span>Control Panel</span>
      </div>
    </template>
    <div class="control-panel">
      <control-panel-main></control-panel-main>
    </div>
  </el-card>
</template>

<script>
import { defineComponent } from "vue-demi";

import ControlPanelMain from './ControlPanelMain.vue';

export default defineComponent({
  name: 'ControlPanel',
  components: {
    ControlPanelMain,
  },
  setup () {
    
  }
});
</script>

<style>
@import url('@/assets/style/MyCard.scss');
.control-panel {
  height: 480px;
}
</style>