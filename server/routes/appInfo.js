const express = require('express');
const appInfoCtrl = require('../controllers/appInfo-controller');

const router = express.Router();

router.get('/', appInfoCtrl.getAppInfo)

module.exports = router;
