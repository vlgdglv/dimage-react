import { post, get } from "./http.js";

export const newPurchase = (p) => post('/newpurchase', p)

export const getTxByOwner = (p) => get('/getownertx', p)

export const getTxByPurchaser = (p) => get('getpurchasertx', p)

