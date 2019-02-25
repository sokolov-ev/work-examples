const express = require('express');
const router = express.Router();

const Create = require('./create');

router.post('/create', Create);

module.exports = router;
