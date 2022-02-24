<template>
  <el-row>
    <el-col :span="12" class="date-picker-title">
      <span>Month Picker</span>
    </el-col>
    <el-col :span="12">
			<el-date-picker
        class="my-date-picker"
        v-model="selectDate"
        type="month"
        placeholder="Pick a month"
        format="YYYY-MM"
      >
      </el-date-picker>
		</el-col>
	</el-row>
  
</template>

<script>
import { defineComponent, ref, watchEffect } from "@vue/runtime-core";

import { convertTime } from '@/utils';

export default defineComponent({
  name: 'DatePicker',
  setup () {
    const selectDate = ref('');

    watchEffect(() => {
      console.log('date: ', selectDate.value === '' ? '' : convertTime(selectDate.value));
    })

    return {
      selectDate,
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