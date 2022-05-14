import { post, get } from "./http.js";

export const newPurchase = (p) => post('/newpurchase', p)

export const getTxByOwner = (p) => get('/ownertx', p)

export const getTxByPurchaser = (p) => get('purchasertx', p)

export const updateTx = (p) => post('/updatetx', p)

export const getLatestTx = (p) => get('/latestx',p)

export const getPrevOwner = (p) => get('/prevowner', p)

export const getTxByID = (p) => get('/txbyid', p)
