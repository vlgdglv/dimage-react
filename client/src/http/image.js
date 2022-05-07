import axios from 'axios'
// export const getThumbnail = (p, info) => post('/thumbnail', p, info)

export function getThumbnail(data) {
  let url = '/thumbnailTest'
  return new Promise((resolve, reject) => {
    let formData = data
    axios.post(url, formData, {
      responseType: "blob",
    })
    .then((res) => {
      resolve(res.data)
    })
    .catch((err) => {
      reject(err.data)
    })
  })
}