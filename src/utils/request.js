import axios from 'axios'
import { ElMessage } from 'element-plus'

// const baseURL = process.env.VUE_APP_BASE_API;
export const baseURL = '/newbaogangapi';
export const nodeURL = '/nodeServer';

// create an axios instance
const service = axios.create({
  // baseURL: baseURL, // url = base url + request url
  timeout: 500 * 1000
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent
    
    // post请求体字段的值需要序列化一下
    if (config.method === 'post') {
      let req_data = config.data;
      for (let key in req_data) {
        req_data[key] = JSON.stringify(req_data[key]);
      }
      config.data = req_data;
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const status = response.status;

    if (status !== 200) {
      ElMessage({
        message: response.statusText + ': 似乎有一点问题',
        type: 'warning',
      });
    }
    return response;
  },
  error => {
    console.log('err' + error); // for debug
    ElMessage.error('后台报错啦!! 快点去瞅瞅吧!!!');
    return Promise.reject(error);
  }
)

export default service
