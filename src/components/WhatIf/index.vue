<template>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <span>What-If View</span>
      </div>
    </template>
    <div class="what-if-view">
      <what-if-main
        :plateStati="plateStati"
        :gantData="gantData"
      ></what-if-main>
    </div>
  </el-card>
</template>

<script>
import { computed, defineComponent, reactive, watch } from "vue-demi";
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

    const plateStati = reactive({});
    const gantData = reactive({});

    watch(monthPickDate, () => {
      // 获取生产趋势统计数据
      getPlatesStatistics(10, monthPickDate.value[0], monthPickDate.value[1])
        .then(res => plateStati.value = res.data);

      // 获取甘特图数据
      setTimeout(() => {
        gantData.value = {a: 1};
      }, 5000);
    });

    return {
      plateStati,
      gantData,
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