import { errorHandler } from "../utils/error.js";
import Product from "../models/product.model.js";
import Admin from "../models/admin.model.js";
import cloudinary from "../../config/cloudinary.js";
import fs from "fs/promises";
import express from "express";

// Create Product (Admin Only)
export const createProduct = async (req, res, next) => {
  try {
    const user = await Admin.findById(req.user); // ✅ fetch from DB
    if (!user || !user.isadmin) {
      return next(errorHandler(403, "Only admins can create products"));
    }

    const product = await Product.create(req.body);
    return res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// Get Single Product
export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return next(errorHandler(404, "Product not found"));
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

// Get All Products (Optional: Admin Only or Public)
export const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    return res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

// Upload Image (Admin Only)
export const uploadImage = async (req, res, next) => {
  try {
    const user = await Admin.findById(req.user);
    if (!user || !user.isadmin) {
      return next(errorHandler(403, "Only admins can upload images"));
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const urls = req.files.map(file => file.path);
    return res.status(200).json({ imageUrls: urls });

  } catch (error) {
    console.error("Upload Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
