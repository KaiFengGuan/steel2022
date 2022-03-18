<template>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <span>OverView</span>
      </div>
    </template>
    <div class="overview">
      <overview-main></overview-main>
    </div>
  </el-card>
</template>

<script>
import { defineComponent } from "vue-demi";

import ComparativeMain from './ComparativeMain.vue';
import { scattorData, ALGORITHM_OPTION } from '@/api/overview';

export default defineComponent({
  name: 'WhatIf',
  components: {
    ComparativeMain,
  },
  setup () {
    // 这个请求体需要抽到vuex中
    const req_body = {
      slabthickness: [],
      tgtdischargetemp: [],
      tgtplatethickness: [],
      tgtwidth: [],
      tgtplatelength2: [],
      tgttmplatetemp: [],
      cooling_start_temp: [],
      cooling_stop_temp: [],
      cooling_rate1: [],
      productcategory: [],
      steelspec: [],
      status_cooling: 0
    };

    // let p = scattorData(ALGORITHM_OPTION.T_SNE, '2021-02-10%2000:00:00', '2021-02-13%2000:00:00', req_body);

    // p.then((req) => {
    //   console.log(req);
    // }).catch((e) => {
    //   console.log(e);
    // })

  }
});
</script>

<style>
@import url('@/assets/style/MyCard.scss');
.overview {
  height: 480px;
}
</style>