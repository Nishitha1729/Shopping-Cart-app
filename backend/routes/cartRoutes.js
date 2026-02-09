const express = require("express");
const Cart = require("../models/Cart");
const Item = require("../models/Item");
const auth = require("../middleware/auth");
const router = express.Router();

// Get user's cart
router.get("/", auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id }).populate(
      "items.itemId",
    );
    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [], total: 0 });
      await cart.save();
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add item to cart
router.post("/", auth, async (req, res) => {
  try {
    const { itemId } = req.body;
    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [], total: 0 });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.itemId.toString() === itemId,
    );
    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += 1;
    } else {
      cart.items.push({ itemId, quantity: 1 });
    }

    cart.total = cart.items.reduce((sum, cartItem) => {
      const item = cartItem.itemId._doc || item;
      return sum + item.price * cartItem.quantity;
    }, 0);

    await cart.save();
    const populatedCart = await Cart.findById(cart._id).populate(
      "items.itemId",
    );
    res.json(populatedCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
