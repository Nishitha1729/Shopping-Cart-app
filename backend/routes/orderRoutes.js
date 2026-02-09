const express = require("express");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const auth = require("../middleware/auth");
const router = express.Router();

// Place order (convert cart to order)
router.post("/", auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id }).populate(
      "items.itemId",
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const orderItems = cart.items.map((cartItem) => ({
      itemId: cartItem.itemId._id,
      quantity: cartItem.quantity,
      price: cartItem.itemId.price,
    }));

    const order = new Order({
      userId: req.user._id,
      items: orderItems,
      total: cart.total,
    });

    await order.save();

    // Clear cart
    await Cart.findOneAndUpdate(
      { userId: req.user._id },
      { items: [], total: 0 },
    );

    const populatedOrder = await Order.findById(order._id).populate(
      "items.itemId",
    );
    res.json(populatedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's order history
router.get("/", auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate("items.itemId")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
