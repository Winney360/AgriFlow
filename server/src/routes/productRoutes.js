import express from 'express';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getActiveProducts,
  getProductDetails,
  setProductSold,
  getSellerHistory,
  getSellerProducts,
  deleteHistoryProduct,
} from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getActiveProducts);
router.get('/mine/active', protect, getSellerProducts);
router.get('/mine/history', protect, getSellerHistory);
router.get('/:id', getProductDetails);

router.post('/', protect, upload.single('image'), createProduct);
router.put('/:id', protect, upload.single('image'), updateProduct);
router.patch('/:id/sold', protect, setProductSold);
router.delete('/:id/history', protect, deleteHistoryProduct);
router.delete('/:id', protect, deleteProduct);

export default router;
