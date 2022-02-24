<template>
  <div class="app-wrapper">
    <app-main />
    <!-- 后续添加nav, sidebar, ...等 -->
  </div>
</template>

<script>
import { defineComponent } from "@vue/runtime-core";

import AppMain from './AppMain.vue';

export default defineComponent({
  name: 'Layout',
  components: {
    AppMain,
  },
});
</script>