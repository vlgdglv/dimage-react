import axios from 'axios'
import { get, post } from './http'
// export const getThumbnail = (p, info) => post('/thumbnail', p, info)

export const getImages = (p) => get('/getimages',p);

export const getImageByID = (p) => get('/getimagebyid',p)

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