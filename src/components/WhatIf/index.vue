<template>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <span>What-If View</span>
      </div>
    </template>
    <div class="what-if-view">
      <what-if-main :whatIfData="whatIfData"></what-if-main>
    </div>
  </el-card>
</template>

<script>
import { computed, defineComponent, reactive, watch, watchEffect } from "vue-demi";
import { useStore } from "vuex";

import WhatIfMain from './WhatIfMain.vue';
import { getPlatesStatistics } from '@/api/overview';

export default defineComponent({
  name: 'WhatIf',
  components: {
    WhatIfMain,
  },
  setup () {
    const store = useStore();
    const monthPickDate = computed(() => store.state.monthPickDate);

    const whatIfData = reactive({
      plateStati: null,
    });

    watch(monthPickDate, () => {
      getPlatesStatistics(10, monthPickDate.value[0], monthPickDate.value[1])
        .then(res => whatIfData.plateStati = res.data);
    });

    return {
      whatIfData,
    }
  }
});
</script>

<style>
@import url('@/assets/style/MyCard.scss');
.what-if-view {
  height: 1025px;
}
</style>