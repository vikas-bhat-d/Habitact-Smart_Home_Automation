import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = ({setConnected}) => {
  const [ip, setIp] = useState(localStorage.getItem("ip")?localStorage.getItem("ip"):"");
  const [port, setPort] = useState(localStorage.getItem("port")?localStorage.getItem("port"):"");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleConnect = () => {
    if (!ip || !port) {
      setError("Please enter both IP and Port.");
      return;
    }
    localStorage.setItem("ip", ip);
    localStorage.setItem("port", port);
    setConnected(true)
    navigate("/control");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-green-400 text-white bg-gray-100 ">
      <div className="bg-white text-gray-800 shadow-lg rounded-lg p-8 md:p-12 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Welcome to HABITECT</h1>
        <p className="text-sm text-gray-600 text-center mb-8">
          Connect to your home automation device by entering the IP address and port.
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">IP Address</label>
          <input
            type="text"
            placeholder="e.g., 192.168.1.1"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Port Number</label>
          <input
            type="number"
            placeholder="e.g., 8080"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button
          onClick={handleConnect}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Connect
        </button>
      </div>

      <footer className="mt-8 text-gray-100 text-sm">
        Powered by <span className="font-semibold">Habitect</span>
      </footer>
    </div>
  );
};

export default LandingPage;
