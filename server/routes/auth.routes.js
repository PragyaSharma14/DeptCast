import express from 'express';
import { register, login, acceptInvite } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/accept-invite', acceptInvite);

export default router;
