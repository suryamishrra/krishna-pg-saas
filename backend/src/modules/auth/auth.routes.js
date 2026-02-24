const express = require('express');
const controller = require('./auth.controller');
const { registerSchema, loginSchema, refreshSchema } = require('./auth.schemas');
const validateRequest = require('../../middleware/validateRequest');
const authSaasMiddleware = require('../../middleware/authSaasMiddleware');

const router = express.Router();

router.post('/register', validateRequest(registerSchema), controller.register);
router.post('/login', validateRequest(loginSchema), controller.login);
router.post('/refresh', authSaasMiddleware, validateRequest(refreshSchema), controller.refresh);
router.get('/me', authSaasMiddleware, controller.me);

module.exports = router;
