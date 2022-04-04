<template>
  <div id="app-router">
    <router-view />
  </div>
</template>

<script>
import { defineComponent } from "@vue/runtime-core";

export default defineComponent({
  name: 'App'
});
</script>

<style>
/*控制整个滚动条*/
::-webkit-scrollbar {
  background-color: transparent;
  width: 0.4rem;
  height: 0.4rem;
  background-clip: padding-box;
}
/*滚动条中间滑动部分*/
::-webkit-scrollbar-thumb {
  background-color: lightgray;
  border-radius: 0.5rem;
}

#app-router {
  user-select: none;
}
</style>