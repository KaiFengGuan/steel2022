export default class EventBus {
  constructor() {
    this._map = new Map();
  }
  
  on(type, handler) {
    this._map.set(type, (this._map.get(type) || []).concat(handler));
  }
  
  emit(type, data) {
    this._map.get(type) && this._map.get(type).forEach(handler => handler(data));
  }
  
  off(type, handler) {
    if (this._map.get(type)) {
      if (!handler) {
        this._map.delete(type);
      } else {
        let index = this._map.get(type).indexOf(handler);
        index !== -1 && this._map.get(type).splice(index, 1);
      }
    }
  }
}