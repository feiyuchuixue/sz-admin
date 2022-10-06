import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { setAccessToken, getAccessToken } from '@/utils/auth'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 60000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  request => {
    // do something before request is sent
    if (store.getters.accessToken) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      const accessToken = getAccessToken()
      // 设置请求头
      request.headers['Authorization'] = 'Bearer ' + accessToken
    }
    return request
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  response => {
    const res = response.data
    // 如果服务器的状态码不为200，说明请求异常，应给出错误提示。
    if (res.code !== 200) {
      Message({
        message: res.msg || 'Error check your token or method',
        type: 'error',
        duration: 2 * 1000
      })
      return Promise.reject(new Error(res.msg || 'Error'))
    } else {
      console.log(' response pre-toke: ' + response.headers['pre-access-token'])
      // 如果response header 有 'pre-access-token’，更新token
      if (response.headers['pre-access-token']) {
        setAccessToken(response.headers['pre-access-token'])
      }
      return res
    }
  },
  error => {
    if (error.response) {
      //  跳转到登录页
      if (error.response.status === 401 || error.response.status === 403) {
        console.log('to login ...')
        // 跳转登陆页
        MessageBox.alert('鉴权验证失败,需要重新登录', '鉴权失败', {
          confirmButtonText: '确认',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/logout').then(() => {
            location.reload()
          })
        })
      } else {
        Message({
          message: error.response.data.message,
          type: 'error',
          duration: 2 * 1000
        })
      }
    }

    return Promise.reject(error.response.data)
  }
)

export default service
