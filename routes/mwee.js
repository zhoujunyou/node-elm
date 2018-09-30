'use strict';

import express from 'express'
import Mwee from '../controller/mwee/mwee'
const  router = express.Router();

router.get('/findAccount',Mwee.findAccount);
router.get('/editNoticeDevice',Mwee.editNoticeDevice);
router.get('/findShopLogs',Mwee.findShopLogs);
router.get('/checkLogin',Mwee.checkLogin);
router.get('/findAccountLogs',Mwee.findAccountLogs);
export default router