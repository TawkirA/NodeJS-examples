const express = require('express');
const healthCheckCtrl = require('../controllers/healthCheck-controller');

const router = express.Router();

router.get('/', healthCheckCtrl.getHealthCheck)

module.exports = router;
