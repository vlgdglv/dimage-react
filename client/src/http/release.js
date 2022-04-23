import { post, get } from "./http.js";

export const releaseImage = (p) => post('/newImage', p)