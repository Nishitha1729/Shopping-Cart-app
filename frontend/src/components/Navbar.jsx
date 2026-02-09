import { useState } from "react";
import { ShoppingCart, User, LogOut, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function Navbar({ token, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(
        "/api/users/logout",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      onLogout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      onLogout();
      navigate("/");
    }
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <ShoppingCart className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                ShopCart
              </span>
            </Link>
          </div>

          {token ? (
            <>
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  to="/"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Items
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </button>
              </div>
              <div className="md:hidden flex items-center">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-white hover:bg-indigo-600"
                >
                  {mobileMenuOpen ? (
                    <X className="block h-6 w-6" />
                  ) : (
                    <Menu className="block h-6 w-6" />
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center">
              <Link
                to="/login"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
            </div>
          )}
        </div>

        {token && mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                to="/"
                className="text-gray-700 hover:text-white hover:bg-indigo-600 block px-3 py-2 rounded-md text-base font-medium"
              >
                Items
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center px-3 py-2 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-50 hover:text-indigo-900 hover:bg-indigo-100"
              >
                <LogOut className="mr-2 h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
