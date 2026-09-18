import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { AppointmentController } from '../controllers/AppointmentController';

const router = Router();
const ctrl = new AppointmentController();

router.use(authMiddleware);

router.post('/', (req, res) => ctrl.create(req, res));
router.get('/', (req, res) => ctrl.getAll(req, res));
router.get('/:id', (req, res) => ctrl.getById(req, res));
router.put('/:id', (req, res) => ctrl.update(req, res));
router.delete('/:id', (req, res) => ctrl.delete(req, res));

export default router;
