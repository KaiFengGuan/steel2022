export function objClean (obj) {
  for (let item in obj) {
      if ((obj[item] === '') || (obj[item] === undefined) || (obj[item] === null)) {
          delete obj[item]
      }
  }
  return obj
}

// 对变量进行深度克隆
export function cloneObject (obj) {
  if (!obj || typeof obj !== 'object') {
      return obj
  }
  var newobj = obj.constructor === Array ? [] : {}
  if (window.JSON) {
      newobj = JSON.parse(JSON.stringify(obj))
  } else {
      for (var i in obj) {
          if (obj.hasOwnProperty(i)) {
              newobj[i] = typeof obj[i] === 'object' ? cloneObject(obj[i]) : obj[i]
          }
      }
  }
  return newobj
}

// 对数组进行去重操作，只考虑数组中元素为数字或字符串，返回一个去重后的数组
export function uniqArray (arr) {
  let res = []
  let obj = {}
  let j = 'number: '
  for (let i = 0; i < arr.length; i++) {
      if (typeof arr[i] === 'number') {
          j = 'number: ' + arr[i]
      } else {
          j = arr[i]
      }
      if (!obj[j]) {
          res.push(arr[i])
          obj[j] = 1
      }
  }
  return res
}

export function convertTime (value) {
  if  (value) {
      var time = new Date(value)
  } else {
      var time = new Date()
  }
  let y = time.getFullYear()
  let m = time.getMonth() + 1 > 9 ? (time.getMonth() + 1) : ('0' + (time.getMonth() + 1))
  let d = time.getDate() > 9 ? time.getDate() : ('0' + time.getDate())
  let h = time.getHours() > 9 ? time.getHours() : ('0' + time.getHours())
  let M = time.getMinutes() > 9 ? time.getMinutes() : ('0' + time.getMinutes())
  let s = time.getSeconds() > 9 ? time.getSeconds() : ('0' + time.getSeconds())
  return y + '-' + m + '-' + d + ' ' + h + ':' + M + ':' + s
}

export function convertFloat (f, n) {
  let p = Math.pow(10, n)
  return Math.round(f * p) / p
}

export * from './element';
export * from './setting';
export * from './renderClass';
