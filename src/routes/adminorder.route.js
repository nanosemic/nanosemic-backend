import express from 'express';
import {
  getAllOrdersAdmin,
  updateOrderStatus,
  
} from '../controllers/adminorder.controller.js';
import  verifyAccessToken  from '../middlewares/auth.js';
const router = express.Router();
// only by admin
router.get("/order",verifyAccessToken,getAllOrdersAdmin);
router.put('/status/:orderId',verifyAccessToken,updateOrderStatus);

export default router;