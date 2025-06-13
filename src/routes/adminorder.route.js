import express from 'express';
import {
  getAllOrdersAdmin,
  updateOrderStatus,
  
} from '../controllers/adminorder.controller.js';
import auth from '../middlewares/auth.js';

const router = express.Router();
// only by admin
router.get("/order",auth,getAllOrdersAdmin);
router.put('/status/:orderId',auth, updateOrderStatus);

export default router;