import axios from 'axios'
import { get } from './http'

export const getImages = (p) => get('/getimages',p);

export const getImageByID = (p) => get('/getimagebyid',p)

export const getImageByAuthor = (p) => get('/getimagebyauthor', p)

export const getImageByOwner = (p) => get('/getimagebyowner', p)

export const getImageFromIPFS = (url) => get(url)

export function getThumbnail(data) {
  let url = '/thumbnail'
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

export function getThumbnailByID(data) {
  let url = '/thumbnailbyid'
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