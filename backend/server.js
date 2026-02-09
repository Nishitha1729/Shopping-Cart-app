const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

console.log("🚀 Starting NO-DB Backend (Single Device Auth Works!)");

// In-memory storage (persists during session)
const users = new Map(); // username -> {password}
const sessions = new Map(); // username -> token (single device)
const carts = new Map(); // username -> {items: [], total: 0}
const orders = new Map(); // username -> [orderHistory]

// Mock items (always available)
const items = [
  {
    _id: "1",
    name: "Gaming Laptop",
    price: 1299.99,
    description: "RTX 4060, 16GB RAM",
  },
  {
    _id: "2",
    name: "iPhone 16 Pro",
    price: 1199.0,
    description: "Latest flagship phone",
  },
  {
    _id: "3",
    name: "AirPods Pro 2",
    price: 249.0,
    description: "Noise cancelling earbuds",
  },
  {
    _id: "4",
    name: "Logitech Mouse",
    price: 49.99,
    description: "Wireless gaming mouse",
  },
  { _id: "5", name: "SSD 1TB", price: 89.99, description: "NVMe Gen4 storage" },
];

// Health check
app.get("/health", (req, res) =>
  res.json({
    status: "OK",
    mode: "NO-DB",
    users: users.size,
    activeSessions: sessions.size,
  }),
);

// CREATE USER
app.post("/api/users", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Username & password required" });
  if (users.has(username))
    return res.status(400).json({ error: "Username exists" });

  users.set(username, { password });
  carts.set(username, { items: [], total: 0 });
  orders.set(username, []);

  console.log(`👤 New user: ${username}`);
  res.json({ message: "User created successfully!" });
});

// LOGIN (SINGLE DEVICE)
app.post("/api/users/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.get(username);
  if (!user || user.password !== password) {
    return res.status(400).json({ error: "Invalid username/password" });
  }

  // SINGLE DEVICE CHECK
  if (sessions.has(username)) {
    console.log(`🚫 Device blocked: ${username} already logged in`);
    return res
      .status(403)
      .json({ error: "You cannot login on another device." });
  }

  const token = jwt.sign(
    { username },
    process.env.JWT_SECRET || "supersecretkey123",
  );
  sessions.set(username, token);

  console.log(`✅ Login: ${username}`);
  res.json({ token });
});

// LOGOUT
app.post("/api/users/logout", (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (token) {
    for (let [username, sessionToken] of sessions.entries()) {
      if (sessionToken === token) {
        sessions.delete(username);
        console.log(`👋 Logout: ${username}`);
        break;
      }
    }
  }

  res.json({ message: "Logged out successfully" });
});

// AUTH MIDDLEWARE
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "supersecretkey123",
    );
    const username = decoded.username;

    // Validate single session
    if (!sessions.has(username) || sessions.get(username) !== token) {
      return res.status(401).json({ error: "Invalid session" });
    }

    req.user = { username };
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// GET ITEMS
app.get("/api/items", (req, res) => res.json(items));

// GET CART
app.get("/api/carts", auth, (req, res) => {
  const cart = carts.get(req.user.username) || { items: [], total: 0 };
  res.json(cart);
});

// ADD TO CART
app.post("/api/carts", auth, (req, res) => {
  const { itemId } = req.body;
  const item = items.find((i) => i._id === itemId);
  if (!item) return res.status(404).json({ error: "Item not found" });

  let cart = carts.get(req.user.username) || { items: [], total: 0 };
  const existingItem = cart.items.find((item) => item.itemId === itemId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.items.push({ itemId, quantity: 1, ...item });
  }

  cart.total = cart.items.reduce(
    (sum, cartItem) => sum + cartItem.price * cartItem.quantity,
    0,
  );
  carts.set(req.user.username, cart);

  console.log(
    `🛒 Cart updated: ${req.user.username} ($${cart.total.toFixed(2)})`,
  );
  res.json(cart);
});

// PLACE ORDER
app.post("/api/orders", auth, (req, res) => {
  const cart = carts.get(req.user.username);
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ error: "Cart empty" });
  }

  const order = {
    id: Date.now(),
    items: cart.items.map((item) => ({ ...item })),
    total: cart.total,
    timestamp: new Date().toISOString(),
  };

  let userOrders = orders.get(req.user.username) || [];
  userOrders.unshift(order);
  orders.set(req.user.username, userOrders);

  // Clear cart
  carts.set(req.user.username, { items: [], total: 0 });

  console.log(
    `✅ Order placed: ${req.user.username} ($${order.total.toFixed(2)})`,
  );
  res.json(order);
});

// GET ORDERS
app.get("/api/orders", auth, (req, res) => {
  const userOrders = orders.get(req.user.username) || [];
  res.json(userOrders);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🎉 Backend LIVE: http://localhost:${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
  console.log(`✅ NO MongoDB needed! Single-device auth ✅`);
  console.log(`👤 Test users: test/123 | admin/pass`);
});
