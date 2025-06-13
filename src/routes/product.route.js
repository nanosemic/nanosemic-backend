import express from 'express'
import Product from '../models/product.model.js';
import upload from '../middlewares/multer.js'; 
import { createProduct, getProduct, getProducts,uploadImage } from '../controllers/product.controller.js';


const router = express.Router();


//router.post("/upload", upload.single("image"),uploadImage);
router.post("/upload", upload.array("image", 10), uploadImage);
// router.delete('/delete/:id',deleteListing);
// router.post('/update/:id',updateListing);
router.get('/get/:id',getProduct);
router.get('/get',getProducts);
router.post('/create',createProduct);

export default  router;