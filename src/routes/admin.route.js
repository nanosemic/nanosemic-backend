// routes/adminRoutes.js
import express from 'express'
import adminController from '../controllers/admin.controller.js';
import verifyAccessToken from '../middlewares/auth.js';



const router = express.Router();
router.post('/signup',adminController.signup)
router.post('/login', adminController.login);
router.post('/google', adminController.google);
router.post("/verify-email", adminController.verifyEmail);
router.get('/profile',adminController.profile);
router.get('/orders',verifyAccessToken, adminController.getOrders);
router.put('/orders/:id', adminController.updateOrderStatus);
router.get('/stats', adminController.getOrderStats);
router.post('/logout', adminController.logOut);
router.post('/savecontact', adminController.saveContact);


export default router;