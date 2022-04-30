import { post, get } from "./http.js";

export const releaseImage = (p) => post('/newImage', p)

export const uploadImage = (p) => post('/uploadImage', p)

export const getImageBySHA = (p) => get('/getImagebysha',p)