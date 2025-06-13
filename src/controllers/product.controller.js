
import { errorHandler } from "../utils/error.js";
import Product from "../models/product.model.js";
import cloudinary from "../../config/cloudinary.js";
import fs from "fs/promises";

import express from "express";

export const createProduct = async(req,res,next)=>{
    try {
        console.log(req.body);
        const product = await Product.create(req.body);
        return res.status(201).json(product);
    } catch (error) {
        next(error);
    }
}




export const getProduct = async(req,res,next)=>{
    
    try {
    const product = await Product.findById(req.params.id);
    if(!product) return next(errorHandler(404,'product not found'));
    res.status(200).json(product);
    } catch (error) {
        next(error);
    }

}

export const getProducts = async(req,res,next)=>{

    try {
       
    const products = await Product.find();
    return res.status(200).json(products);



    } catch (error) {
        next(error);
    }
}

export const uploadImage = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const urls = req.files.map(file => file.path); // Cloudinary returns .path
    return res.status(200).json({ imageUrls: urls });

  } catch (error) {
    console.error("Upload Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}