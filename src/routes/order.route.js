import express from 'express';
import verifyAccessToken from '../middlewares/auth.js';
import {
  placeorder,
  getMyOrders,
  getOrderById,
 
} from '../controllers/order.controller.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.post('/place',verifyAccessToken,placeorder);
router.get('/my-orders',verifyAccessToken, getMyOrders);

/*router.post('/create', createOrder);
router.get('/get', getAllOrders);
router.get('/get/:id', getOrderById);
router.put('/update/:id', updateOrderStatus);
router.delete('/delete/:id', deleteOrder);
*/
export default router;
