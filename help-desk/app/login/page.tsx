// src/pages/Login.jsx
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
// 1. Import the images
import logo from "../assets/kenya-logo.png"; // The Coat of Arms
import bgImage from "../assets/treasury-building.jpg"; // The Building Background

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (email && password) {
      navigate("/dashboard");
    } else {
      alert("Please fill in all fields");
    }
  };

  return (
    // 2. Apply background image and overlay
    <div 
      className="min-h-screen flex items-center justify-center relative bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Dark Overlay to make text readable */}
      <div className="absolute inset-0 bg-black/60 z-0"></div>

      {/* Login Card */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl z-10 overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Branding & Logo */}
        <div className="md:w-5/12 bg-treasury-brown text-white p-8 flex flex-col justify-center items-center text-center">
          <img 
            src={logo} 
            alt="Republic of Kenya Coat of Arms" 
            className="h-24 w-auto object-contain mb-6" 
          />
          <h1 className="text-3xl font-bold mb-2">The National Treasury</h1>
          <p className="text-treasury-gold font-medium text-sm uppercase tracking-wide mb-4">
            ICT Helpdesk Portal
          </p>
          <p className="text-sm text-gray-200">
            Securely manage your IT requests and assets.
          </p>
        </div>

        {/* Right Side: Login Form */}
        <div className="md:w-7/12 p-8 md:p-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-treasury-dark">Welcome Back</h2>
            <p className="text-gray-500 text-sm">Sign in to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@treasury.go.ke"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-treasury-gold focus:border-treasury-gold outline-none transition-all"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-treasury-gold focus:border-treasury-gold outline-none transition-all"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-treasury-brown text-white py-3 rounded-lg font-semibold hover:bg-treasury-dark transition-colors shadow-lg"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/forgot-password"
              className="text-sm text-treasury-brown hover:underline font-medium"
            >
              Forgot Password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}