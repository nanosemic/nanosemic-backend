import Order from "../models/order.model.js";
import { Cart } from "../models/cart.model.js";
import Product from "../models/product.model.js";
import Address from "../models/address.model.js";
// Place a new order
export const placeorder = async (req, res) => {
  try {
    const userId = req.user;

    // Get the latest address from Address collection
    const addressDoc = await Address.findOne({ user: userId });
    const address = addressDoc?.addresses?.at(-1);

    if (!address) {
      return res.status(400).json({ message: "No address found for the user." });
    }

    // Extract only required fields
    const selectedAddress = {
      street: address?.street,
      city: address?.city,
      state: address?.state,
      zipCode: address?.zipCode,
      country: address?.country
    };

    // Validate required address fields
    if (!selectedAddress.street || !selectedAddress.city || !selectedAddress.state) {
      return res.status(400).json({ message: "Incomplete address." });
    }

    const { paymentMethod = 'Cash on Delivery' } = req.body;

    // Fetch user's cart and populate product references
    const cart = await Cart.findOne({ user: userId }).populate('products.product');

    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty.' });
    }

    // Format cart products
    const formattedProducts = cart.products.map(item => ({
      product: item.product._id,
      quantity: item.quantity
    }));

    // Create new order
    const newOrder = new Order({
      user: userId,
      products: formattedProducts,
      totalPrice: cart.totalPrice,
      address: selectedAddress,
      paymentMethod,
      status: 'Pending',
      statusMessage: 'Order placed successfully.'
    });

    // Save the order with validation
    try {
      await newOrder.save();
      console.log("Order saved successfully:", newOrder._id);
    } catch (saveErr) {
      console.error("Error saving order:", saveErr);
      return res.status(500).json({ message: "Failed to save order", error: saveErr.message });
    }

    // Clear the cart after successful order
    // cart.products = [];
    // cart.totalPrice = 0;
    // await cart.save();

    return res.status(201).json({ message: 'Order placed successfully.', order: newOrder });
  } catch (err) {
    console.error('Error placing order:', err);
    return res.status(500).json({ message: 'Internal server error while placing order.' });
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
