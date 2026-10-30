import { Router } from 'express';
import * as authController from './auth.controller.js';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-pin', authController.verifyPin);

export default router;

