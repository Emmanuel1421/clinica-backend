import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  createProduct,
  listProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/ProductController';

const router = Router();

router.use(authMiddleware);

router.post('/', createProduct);
router.get('/', listProducts);
router.get('/:id', getProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
