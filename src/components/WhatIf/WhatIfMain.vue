<template>
  <div id="WhatIfMain"></div>
</template>

<script>
import { defineComponent, reactive, watch } from "vue-demi";

export default defineComponent({
  name: 'WhatIfMain',
  props: [
    'plateStati',
    'gantData',
  ],
  setup (props) {

    // 绘制生产趋势统计数据
    const plateStati = reactive(props.plateStati);
    watch(plateStati, () => {
      console.log('绘制生产趋势统计数据')
    });

    // 绘制甘特图
    const gantData = reactive(props.gantData);
    watch(gantData, () => {
      console.log('绘制甘特图');
    });


  },
});
</script>