import Order from "../models/order.model.js";
import { Cart } from "../models/cart.model.js";
import Product from "../models/product.model.js";
import Address from "../models/address.model.js";
// Place a new order
export const placeorder = async (req, res) => {
  try {
    const userId = req.user;
    const selectedAddress = req.body.selectedAddress;

    if (!selectedAddress || !selectedAddress.street || !selectedAddress.city || !selectedAddress.state) {
      return res.status(400).json({ message: "Incomplete or missing address from request." });
    }

    const { paymentMethod = 'Cash on Delivery' } = req.body;

    const cart = await Cart.findOne({ user: userId }).populate('products.product');

    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty.' });
    }

    const formattedProducts = [];
    const lowStockWarnings = [];

    // 🔁 Check and update stock
    for (const item of cart.products) {
      const dbProduct = await Product.findById(item.product._id);

      if (!dbProduct) {
        return res.status(404).json({ message: `Product not found: ${item.product.name}` });
      }

      if (dbProduct.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product: ${dbProduct.name}` });
      }

      dbProduct.stock -= item.quantity;
      await dbProduct.save(); // Save updated stock

      // Collect products with low stock
      if (dbProduct.stock <= 5) {
        lowStockWarnings.push({
          productId: dbProduct._id,
          name: dbProduct.name,
          stockLeft: dbProduct.stock,
        });
      }

      formattedProducts.push({
        product: dbProduct._id,
        quantity: item.quantity,
      });
    }

    const newOrder = new Order({
      user: userId,
      products: formattedProducts,
      totalPrice: cart.totalPrice,
      address: selectedAddress,
      paymentMethod,
      status: 'Pending',
      statusMessage: 'Order placed successfully.',
    });

    await newOrder.save();
    console.log("Order saved:", newOrder._id);

    // Clear cart after successful order
    await Cart.findOneAndDelete({ user: userId });

    res.status(201).json({
      message: 'Order placed successfully.',
      order: newOrder,
      lowStockWarnings, // ✅ Include low stock warnings in response
    });
  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).json({ message: 'Internal server error while placing order.' });
  }
};

// Get logged-in user's orders
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user;
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("products.product");
    res.status(201).json(orders);
  } catch (err) {
    console.error("Error fetching user orders:", err);
    res.status(500).json({ message: "Error fetching orders." });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user")
      .populate("products.product");
    if (!order) return res.status(404).json({ message: "Order not found." });

    res.status(200).json(order);
  } catch (err) {
    console.error("Error fetching order by ID:", err);
    res.status(500).json({ message: "Error retrieving order." });
  }
};
