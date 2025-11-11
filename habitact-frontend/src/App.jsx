import React, { useEffect, useState } from "react";
import LandingPage from "./components/LandingPage/LandingPage";
import ControlPage from "./components/ControlPage/ControlPage";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
const App = () => {
  const [connected, setConnected] = useState(true);


  const ip = localStorage.getItem("ip");
  const port = localStorage.getItem("port");

  // const updateConnectionDetails=()

  useEffect(() => {
    console.log(ip,port);
    if (ip && port) {
      const fetchStatus = async () => {
        try {
          // const response = await axios.get(ip);
          const response = await axios.get(`http://${ip}:${port}/`)
          console.log(response);
          if (response.statusText == "OK"){
            setConnected(true)
            console.log("connected")
          }
          else
            setConnected(false)
        } catch (error) {
          setConnected("not connected")
        }
      }

      fetchStatus();

    }
    else
      setConnected(false)
  }, [])

  return (
    <BrowserRouter>
      <div className="bg-gray-100">
        <Routes>
          <Route
            path="/"
            element={
              connected ? (
                <Navigate to="/control" replace />
              ) : (
                <LandingPage setConnected={setConnected} />
              )
            }
          />
          <Route
            path="/control"
            element={
              connected ? (
                <ControlPage ip={ip} port={port} setConnected={setConnected} connected={connected}/>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/changeIP"
            element={<LandingPage setConnected={setConnected} />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
