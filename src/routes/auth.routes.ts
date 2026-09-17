import { Router } from 'express';
import { login, register } from '../controllers/AuthController';

const router = Router();

// POST /auth/login
router.post('/login', login);

// POST /auth/register
router.post('/register', register);

export default router;
