import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import productRouter from './routes/product.route.js';

import authRoutes from './routes/auth.route.js'
import adminRoutes from './routes/admin.route.js';
import cors from 'cors';

import orderRouter from './routes/order.route.js'
import cartRoutes from './routes/cart.routes.js';
import cookieParser from 'cookie-parser';
import  updateaddress  from './routes/address.route.js'
import orderRoutes from './routes/order.route.js';

import orderRouterAdmin from './routes/adminorder.route.js';



mongoose.connect("mongodb+srv://nanosemicweboperations:Nanosemic@cluster1.ibniwbk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1").then(() => {
  console.log('MongoDB connected')
}   ).catch(err => {    
  console.error('MongoDB connection error:', err)
});



const app = express();
const port = 3000;


app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://nanosemic.co.in"],
    credentials: true,
  })
); 
app.use(express.json())


app.use('/api/product',productRouter);


app.use('/api/admin', adminRoutes);
app.use("/api/auth", authRoutes);

app.use('/api/orders',orderRouter);
app.use('/api',updateaddress)
app.use('/api/cart', cartRoutes);

app.use('/api/orders', orderRoutes);
app.use("/api/admin", orderRouterAdmin);


app.use((err,req,res,next)=>{
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  // next(err)
  return res.status(statusCode).json(
    {
      success:false,
      statusCode,
      message
       
    }
  );
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
