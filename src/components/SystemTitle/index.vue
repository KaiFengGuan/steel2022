<template>
  <div class="title-background">
    <span class="title-text">What-If Analysis</span>
  </div>
</template>

<script>
import { defineComponent } from "vue-demi";

export default defineComponent({
  name: 'Title',
});
</script>

<style lang="scss" scoped>
.title-background {
  height: 60px;
	background-color: #f3f3f3;
	border: solid 0.25px #e0e0e0;
	box-shadow: 0 0 20px rgba(0, 0, 0, 0.1) !important;
	display: flex;
  justify-content: center;
  align-items: center;
}
.title-text {
  font-size: 19px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-weight: bolder;
	align-content: center;
}
</style>