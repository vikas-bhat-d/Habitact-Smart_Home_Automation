import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ControlPage = ({ ip, port, onUpdateConnection }) => {
  const [switches, setSwitches] = useState(() => {
    const saved = localStorage.getItem("switches");
    return saved ? JSON.parse(saved) : [];
  });
  const [gpioPin, setGpioPin] = useState("");
  const [label, setLabel] = useState("");
  const [deviceStatus, setDeviceStatus] = useState("offline");
  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [testSwitch, setTestSwitch] = useState(false);

  const navigate = useNavigate();
  // const baseUrl = `${ip}`;
  const baseUrl = `http://${ip}:${port}`;

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await axios.get(baseUrl);
        const { status } = response.data;

        setDeviceStatus("online");
        setTemperature(status.temperature);
        setHumidity(status.humidity);
      } catch (error) {
        console.error("Error fetching status:", error);
        setDeviceStatus("offline");
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 20000);
    return () => clearInterval(interval);
  }, [baseUrl]);

  const handleAddSwitch = () => {
    if (!gpioPin || !label) return;
    if (switches.some((sw) => sw.gpioPin === gpioPin)) {
      alert("This GPIO pin is already assigned!");
      return;
    }
    const newSwitch = { gpioPin, label, state: false };
    const updatedSwitches = [...switches, newSwitch];

    setSwitches(updatedSwitches);
    localStorage.setItem("switches", JSON.stringify(updatedSwitches));
    setGpioPin("");
    setLabel("");
  };

  const handleToggleSwitch = async (gpioPin) => {
    try {
      console.log("Handling update for GPIO Pin:", gpioPin);

      const updatedSwitches = await Promise.all(
        switches.map(async (sw) => {
          if (sw.gpioPin === gpioPin) {
            axios.post(`${baseUrl}/control`, {
              gpio: sw.gpioPin,
              state: !sw.state // Toggle the state before sending
            }).then((response)=>console.log(response.data));
            console.log(`Toggling ${sw.state ? "off" : "on"} ${sw.label}`);
            return { ...sw, state: !sw.state }; // Update state locally
          }
          return sw; // No change for other switches
        })
      );

      setSwitches(updatedSwitches); // Update the state with the new switches
    } catch (error) {
      console.error("Error toggling switch:", error);
    }
  };

  const handleRemoveSwitch = (gpioPin) => {
    const updatedSwitches = switches.filter((sw) => sw.gpioPin !== gpioPin);
    setSwitches(updatedSwitches);
    localStorage.setItem("switches", JSON.stringify(updatedSwitches));
  };

  const handleUpdateConnection = () => {
    navigate("/changeIP");
  };

  const handleTestConnection = async () => {
    setTestSwitch((prev) => !prev);

    try {
      await axios.post(`${baseUrl}/test`, {
        state: !testSwitch,
      });
    } catch (error) {
      console.error("Error testing connection:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-200 to-teal-200 flex flex-col items-center p-6">
      {/* Header */}
      <div className="w-full max-w-4xl p-4 bg-white shadow-lg rounded-lg mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Habitect Control Panel</h1>
          <div
            className={`px-4 py-1 text-sm rounded-full ${
              deviceStatus === "online"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            Device: {deviceStatus}
          </div>
        </div>
        <div className="flex justify-between items-center mt-5">
          <button
            onClick={handleUpdateConnection}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-teal-700"
          >
            Change IP/Port
          </button>

          <button
            onClick={handleTestConnection}
            className={`px-2 py-2 text-white rounded-lg w-36 shadow-md ${
              testSwitch
                ? "bg-green-500 hover:bg-green-600"
                : "bg-gray-500 hover:bg-gray-600"
            }`}
          >
            TEST LED
          </button>
        </div>
      </div>

      {/* Add Switch Section */}
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Add a New Switch</h2>
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="GPIO Pin"
            value={gpioPin}
            onChange={(e) => setGpioPin(e.target.value)}
            className="w-1/3 px-4 py-2 border rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500"
          />
          <input
            type="text"
            placeholder="Label (e.g., Fan-1)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-2/3 px-4 py-2 border rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500"
          />
          <button
            onClick={handleAddSwitch}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-teal-700"
          >
            Add
          </button>
        </div>

        {/* Switches List */}
        <div className="flex flex-col gap-4">
          {switches.map((sw) => (
            <div
              key={sw.gpioPin}
              className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg shadow-sm border"
            >
              <span className="text-gray-800 font-medium">
                {sw.label} (GPIO {sw.gpioPin})
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleSwitch(sw.gpioPin)}
                  className={`px-6 py-2 text-white rounded-lg shadow-md ${
                    sw.state
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-gray-500 hover:bg-gray-600"
                  }`}
                >
                  {sw.state ? "ON" : "OFF"}
                </button>
                <button
                  onClick={() => handleRemoveSwitch(sw.gpioPin)}
                  className="px-3 py-1.5 text-white rounded-lg shadow-md bg-red-600 hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          {switches.length === 0 && (
            <p className="text-gray-500 text-center">No switches added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ControlPage;


