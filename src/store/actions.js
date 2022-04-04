import { 
  SET_MONTH_PICKER,
  SET_BRUSH_DATE,
  SET_TOOLTIP,
} from "./actionTypes";

export default {
  [SET_MONTH_PICKER]({ commit }, newDate) {
    commit(SET_MONTH_PICKER, newDate);
  },
  [SET_BRUSH_DATE]({ commit }, newDateArr) {
    commit(SET_BRUSH_DATE, newDateArr);
  },
}