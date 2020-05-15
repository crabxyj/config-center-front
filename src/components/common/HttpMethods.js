import axios from 'axios'
import qs from 'qs'

const TIME_OUTM_MS = 60 * 1000

function get (url, port, data, response, exception) {
  axios({
    method: 'get',
    url: url + port,
    timeout: TIME_OUTM_MS,
    params: data,
    headers: {
      'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
    }
  }).then(result => {
    if (typeof response === 'function') {
      response(result.data)
    }
  }).catch(error => {
    if (typeof exception === 'function') {
      exception(error)
    } else {
      console.log(error)
    }
  })
}

function post (url, port, data, response, exception) {
  axios({
    method: 'post',
    url: url + port,
    timeout: TIME_OUTM_MS,
    data: qs.stringify(data),
    headers: {
      'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
    }
  }).then(result => {
    if (typeof response === 'function') {
      response(result.data)
    }
  }).catch(error => {
    if (typeof exception === 'function') {
      exception(error)
    } else {
      console.log(error)
    }
  })
}

export default {
  get, post
}
