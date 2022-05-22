import axios from 'axios'

axios.defaults.timeout = 50000
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'

axios.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    console.log(error)
    return Promise.reject(error)
  }
);

axios.interceptors.response.use(
  (response) => {
    if (response.status === 200) {
      return Promise.resolve(response)
    }
  },
  (error) => {
    if (error.response.status) {
      console.error(error)
    }
    return Promise.reject(error)
  }
);

export function get(url, params, info = '') {
  return new Promise((resolve, reject) => {
    axios.get(url + info, {
      params: params
    })
      .then((res) => {
        resolve(res.data)
      })
      .catch((err) => {
        reject(err.data)
      })
  })
}

export function post(url, data = {}, info) {
  return new Promise((resolve, reject) => {
    let formData = data
    if (info) {
      formData = new FormData()
      for (let i in data) {
        formData.append(i, data[i])
      }
    }
    axios.post(url, formData)
      .then((res) => {
        resolve(res.data)
      })
      .catch((err) => {
         reject(err.data)
      })
  })
}

