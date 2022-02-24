<template>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <span>What-If View</span>
      </div>
    </template>
    <div class="what-if-view">
      <what-if-main></what-if-main>
    </div>
  </el-card>
</template>

<script>
import { defineComponent } from "vue-demi";

import WhatIfMain from './WhatIfMain.vue';

export default defineComponent({
  name: 'WhatIf',
  components: {
    WhatIfMain,
  },
  setup () {
    
  }
});
</script>

<style>
@import url('@/assets/style/MyCard.scss');
.what-if-view {
  height: 1025px;
}
</style>