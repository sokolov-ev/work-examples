const express = require('express');
const router = express.Router();

const Notifications = require('./notifications.controller');

router.get('/:accountId', Notifications.getNotification);
router.post('/', Notifications.create);

module.exports = router;
