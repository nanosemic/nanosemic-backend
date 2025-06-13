import Order from '../models/order.model.js';

// Get all orders for admin with user and product details populated
export const getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user','email username')       // populate user email and username
      .populate('products.product','title price'); // populate product title and price
   
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching all orders for admin:', error);
    res.status(500).json({ message: 'Server error while fetching orders.' });
  }
};

// Update order status by admin
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, statusMessage } = req.body;
    // Validate status
    const validStatuses = ['Pending', 'Processing', 'Out For Delivery', 'Delivered', 'Cancelled', 'Other'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status, statusMessage },
      { new: true }
    ).populate('user')
     .populate('products.product');

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    res.status(200).json({ message: 'Order status updated successfully.', order: updatedOrder });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error while updating order status.' });
  }
};
