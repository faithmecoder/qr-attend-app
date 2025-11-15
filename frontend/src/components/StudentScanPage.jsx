import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import api from "../services/api";
import useGeolocation from "../hooks/useGeolocation";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function StudentScanPage() {
  const html5QrCodeRef = useRef(null);
  const [scanStatus, setScanStatus] = useState("idle"); // idle | scanning | success | error
  const [message, setMessage] = useState("");
  const [loadingCamera, setLoadingCamera] = useState(true);

  const { user } = useAuth();
  const navigate = useNavigate();

  const { location, error: geoError } = useGeolocation();

  useEffect(() => {
    if (!user || user.role !== "student") {
      navigate("/login");
      return;
    }

    startScanner();

    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    if (!html5QrCodeRef.current) {
      html5QrCodeRef.current = new Html5Qrcode("qr-reader");
    }

    setScanStatus("scanning");
    setLoadingCamera(true);

    const qrConfig = {
      fps: 10,
      qrbox: { width: 250, height: 250 }
    };

    try {
      // Try rear camera first
      await html5QrCodeRef.current.start(
        { facingMode: { exact: "environment" } },
        qrConfig,
        onScanSuccess
      );
    } catch (err) {
      console.warn("Rear camera not available, falling back to front camera.");

      // Fall back to front camera
      try {
        await html5QrCodeRef.current.start(
          { facingMode: "user" },
          qrConfig,
          onScanSuccess
        );
      } catch (err2) {
        console.error("Camera start failed:", err2);
        setScanStatus("error");
        setMessage("Unable to access your camera. Please allow camera permissions.");
      }
    }

    setLoadingCamera(false);
  };

  const stopScanner = async () => {
    try {
      if (html5QrCodeRef.current?.isScanning) {
        await html5QrCodeRef.current.stop();
      }
    } catch (err) {
      console.warn("Scanner stop error:", err);
    }
  };

  const onScanSuccess = async (decodedText) => {
    stopScanner();
    setScanStatus("success");
    setMessage("QR detected. Submitting attendance...");

    if (!location) {
      setScanStatus("error");
      setMessage("Location required. Please enable location and try again.");
      return;
    }

    try {
      const { data } = await api.post("/api/attendance", {
        qrCodeValue: decodedText,
        latitude: location.latitude,
        longitude: location.longitude
      });

      setMessage(data.message || "Attendance marked successfully!");
    } catch (err) {
      setScanStatus("error");
      setMessage(err.response?.data?.message || "Error marking attendance.");
    }
  };

  const getStatusColor = () => {
    if (scanStatus === "success") return "bg-green-100 text-green-800";
    if (scanStatus === "error") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold text-center mb-4">Scan QR Code</h2>

      <p className="text-center text-gray-600 mb-6">
        Logged in as <span className="font-semibold">{user?.name}</span>
      </p>

      {/* Geolocation status */}
      {!location && !geoError && (
        <p className="text-blue-600 text-sm mb-4 text-center">
          Requesting location permission…
        </p>
      )}

      {geoError && (
        <p className="text-red-600 text-center mb-4">
          Location Error: {geoError}
        </p>
      )}

      {/* Scanner area */}
      <div id="qr-reader" className="w-full rounded-md overflow-hidden bg-gray-200" style={{ minHeight: "260px" }}>
        {loadingCamera && (
          <p className="text-center text-gray-600 py-10">Loading camera…</p>
        )}
      </div>

      {/* Status message */}
      {message && (
        <div className={`mt-4 p-3 text-center rounded ${getStatusColor()}`}>
          {message}
        </div>
      )}

      {/* Retry scan button */}
      {scanStatus !== "scanning" && (
        <button
          onClick={startScanner}
          className="mt-4 w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Scan Again
        </button>
      )}
    </div>
  );
}

export default StudentScanPage;
