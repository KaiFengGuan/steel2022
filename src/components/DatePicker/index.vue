<template>
  <el-row>
    <el-col :span="12" class="date-picker-title">
      <span>Month Picker</span>
    </el-col>
    <el-col :span="12">
			<el-date-picker
        class="my-date-picker"
        v-model="monthPickDate"
        type="month"
        placeholder="Pick a month"
        format="YYYY-MM"
      >
      </el-date-picker>
		</el-col>
	</el-row>
  
</template>

<script>
import { computed, defineComponent, onMounted, watch } from "@vue/runtime-core";
import { useStore } from "vuex";

import { convertTime } from '@/utils';
import { SET_MONTH_PICKER } from '@/store/actionTypes';

export default defineComponent({
  name: 'DatePicker',
  setup (props) {
    const store = useStore();
    const monthPickDate = computed({
      get: () => store.state.monthPickDate[0],
      set: val => store.dispatch(SET_MONTH_PICKER, convertTime(val))  // 派发修改state
    });

    // 开发时用, 初始默认选择的时间
    onMounted(() => {
      monthPickDate.value = '2021-06-01 00:00:00';
    });

    // watch(monthPickDate, (newVal, oldVal) => {
    //   console.log('选择的时间: ', newVal);
    // });

    return {
      monthPickDate,
    }
  }
});
</script>

<style lang="scss">
.date-picker-title {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
}
.my-date-picker {
  width: 80% !important;
  margin: 10px 10px;
  .el-input__inner {
    margin-right: 0px;
    padding-right: 10px;
  }
}
</style>