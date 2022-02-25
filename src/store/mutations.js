import { convertTime } from "@/utils";
import { SET_MONTH_PICKER } from "./actionTypes";

export default {
  [SET_MONTH_PICKER](state, startDate) {
    let endDate = new Date(startDate);
    if (endDate.getMonth() < 12) {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
      endDate.setMonth(1);
    }
    endDate.setDate(0);

    state.monthPickDate = [startDate, convertTime(endDate)];
  },
}