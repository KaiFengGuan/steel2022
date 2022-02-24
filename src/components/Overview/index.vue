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

import OverviewMain from './OverviewMain.vue';
import { scattorData, ALGORITHM_OPTION } from '@/api/overview';

export default defineComponent({
  name: 'WhatIf',
  components: {
    OverviewMain,
  },
  setup () {
    // 这个请求体需要抽到vuex中
    const req_body = {
      slabthickness: JSON.stringify([]),
      tgtdischargetemp: JSON.stringify([]),
      tgtplatethickness: JSON.stringify([]),
      tgtwidth: JSON.stringify([]),
      tgtplatelength2: JSON.stringify([]),
      tgttmplatetemp: JSON.stringify([]),
      cooling_start_temp: JSON.stringify([]),
      cooling_stop_temp: JSON.stringify([]),
      cooling_rate1: JSON.stringify([]),
      productcategory: JSON.stringify([]),
      steelspec: JSON.stringify([]),
      status_cooling: JSON.stringify(0)
    };
    // console.log(req_body);
    // console.log(JSON.stringify(req_body));

    let p = scattorData(ALGORITHM_OPTION.T_SNE, '2021-02-10%2000:00:00', '2021-02-13%2000:00:00', req_body);

    p.then((req) => {
      console.log(req);
    }).catch((e) => {
      console.log(e);
    })

  }
});
</script>

<style>
@import url('@/assets/style/MyCard.scss');
.overview {
  height: 480px;
}
</style>