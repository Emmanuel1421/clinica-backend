import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  createPatient,
  listPatients,
  getPatient,
  updatePatient,
  deletePatient,
} from '../controllers/PatientController';

const router = Router();

router.use(authMiddleware);

router.post('/', createPatient);
router.get('/', listPatients);
router.get('/:id', getPatient);
router.put('/:id', updatePatient);
router.delete('/:id', deletePatient);

export default router;
