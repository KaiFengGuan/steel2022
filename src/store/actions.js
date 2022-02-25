import { SET_MONTH_PICKER } from "./actionTypes";

export default {
  [SET_MONTH_PICKER]({ commit }, newDate) {
    commit(SET_MONTH_PICKER, newDate);
  },
}