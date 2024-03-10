const express = require('express');
const appController = require('../controllers/AppController');
const usersController = require('../controllers/UsersController');

const router = express.Router();

router.get('/status', appController.getStatus);
router.get('/stats', appController.getStats);
router.post('/users', usersController.postNew);

module.exports = router;
