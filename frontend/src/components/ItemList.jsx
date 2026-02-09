import { useState, useEffect } from "react";
import axios from "axios";
import { ShoppingCart, ChevronRight, CreditCard, History } from "lucide-react";
import toast from "react-hot-toast";

export default function ItemList({ token }) {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("items");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
    fetchCart();
    fetchOrders();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get("/api/items", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(response.data);
    } catch (error) {
      toast.error("Failed to load items");
    }
  };

  const fetchCart = async () => {
    try {
      const response = await axios.get("/api/carts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(response.data);
    } catch (error) {
      console.error("Failed to fetch cart");
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data);
    } catch (error) {
      console.error("Failed to fetch orders");
    }
  };

  const addToCart = async (itemId) => {
    try {
      const response = await axios.post(
        "/api/carts",
        { itemId },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setCart(response.data);
      toast.success("Item added to cart!");
    } catch (error) {
      toast.error("Failed to add item to cart");
    }
  };

  const checkout = async () => {
    try {
      const response = await axios.post(
        "/api/orders",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setCart({ items: [], total: 0 });
      setOrders([response.data, ...orders]);
      toast.success(
        `Order placed successfully! Total: $${response.data.total.toFixed(2)}`,
      );
    } catch (error) {
      toast.error("Failed to place order");
    }
  };

  const renderItems = () => (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Available Items</h2>
      <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <div
            key={item._id}
            className="group bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
          >
            <div className="h-48 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
              <ShoppingCart className="h-16 w-16 text-white opacity-75" />
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {item.name}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {item.description}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-indigo-600">
                  ${item.price.toFixed(2)}
                </span>
                <button
                  onClick={() => addToCart(item._id)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center"
                >
                  Add to Cart
                  <ShoppingCart className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCart = () => (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h2>
      {cart.items.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Your cart is empty
          </h3>
          <p className="mt-2 text-gray-500">Add items to get started.</p>
        </div>
      ) : (
        <>
          <div className="bg-white shadow-lg rounded-xl overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold">Cart Total</span>
                <span className="text-2xl font-bold text-indigo-600">
                  ${cart.total.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {cart.items.map((cartItem) => (
                <div
                  key={cartItem._id}
                  className="p-6 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {cartItem.itemId?.name}
                    </h4>
                    <p className="text-gray-600">
                      ${cartItem.itemId?.price.toFixed(2)} x {cartItem.quantity}
                    </p>
                  </div>
                  <span className="font-bold text-gray-900">
                    ${(cartItem.itemId?.price * cartItem.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="p-6 bg-gray-50">
              <button
                onClick={checkout}
                disabled={cart.items.length === 0}
                className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CreditCard className="mr-2 h-5 w-5" />
                Checkout (${cart.total.toFixed(2)})
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderOrders = () => (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Order History</h2>
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <History className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No orders yet
          </h3>
          <p className="mt-2 text-gray-500">
            Complete your first purchase to see orders here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white shadow-lg rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Order #{order._id.slice(-6)}
                  </h3>
                  <p className="text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-2xl font-bold text-indigo-600">
                  ${order.total.toFixed(2)}
                </span>
              </div>
              <div className="grid gap-4">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2"
                  >
                    <div>
                      <span className="font-semibold">{item.itemId?.name}</span>
                      <span className="ml-2 text-gray-500">
                        x{item.quantity}
                      </span>
                    </div>
                    <span>${item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="pb-24">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 py-6">
            <button
              onClick={() => setActiveTab("items")}
              className={`py-2 px-4 font-medium rounded-md transition-colors ${
                activeTab === "items"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Items
            </button>
            <button
              onClick={() => setActiveTab("cart")}
              className={`py-2 px-4 font-medium rounded-md transition-colors flex items-center ${
                activeTab === "cart"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Cart
              {cart.items.length > 0 && (
                <span className="ml-2 bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-1 rounded-full">
                  {cart.items.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`py-2 px-4 font-medium rounded-md transition-colors ${
                activeTab === "orders"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Orders
            </button>
          </div>
        </div>
      </div>

      {activeTab === "items" && renderItems()}
      {activeTab === "cart" && renderCart()}
      {activeTab === "orders" && renderOrders()}
    </div>
  );
}
