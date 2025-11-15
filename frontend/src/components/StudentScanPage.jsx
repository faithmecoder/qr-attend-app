import React, { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import api from "../services/api";
import useGeolocation from "../hooks/useGeolocation";
import { useAuth } from "../context/AuthContext";

function StudentScanPage() {
  const scannerRef = useRef(null);
  const [qrCodeValue, setQrCodeValue] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const { location, loading: geoLoading, error: geoError } = useGeolocation();
  const { user } = useAuth();

  useEffect(() => {
    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: 250,
        },
        (decoded) => {
          setQrCodeValue(decoded);
          scanner.stop();
        }
      )
      .catch((err) => console.error(err));

    return () => {
      scanner.stop().catch(() => {});
    };
  }, []);

  const submitAttendance = async () => {
    if (!qrCodeValue) {
      setMessage("Scan a QR code first");
      return;
    }

    if (!location) {
      setMessage("Location is required");
      return;
    }

    try {
      setStatus("loading");

      const { data } = await api.post("/api/attendance", {
        qrCodeValue,
        latitude: location.latitude,
        longitude: location.longitude,
      });

      setMessage(data.message);
      setStatus("success");
    } catch (err) {
      setMessage(err.response?.data?.message || "Error submitting");
      setStatus("error");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 shadow rounded">
      <h2 className="text-2xl font-bold text-center mb-4">Scan QR Code</h2>
      <p className="text-gray-700 mb-4 text-center">
        Logged in as <strong>{user.name}</strong>
      </p>

      {geoLoading && <p className="text-blue-600">Getting your location...</p>}
      {geoError && <p className="text-red-600">{geoError}</p>}

      <div id="qr-reader" className="w-full mx-auto mb-4" style={{ height: "280px" }}></div>

      {message && (
        <div
          className={`p-3 text-center rounded mb-4 ${
            status === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message}
        </div>
      )}

      <button
        onClick={submitAttendance}
        disabled={status === "loading" || !qrCodeValue}
        className="w-full bg-indigo-600 text-white py-3 rounded-lg"
      >
        {status === "loading" ? "Submitting..." : "Submit Attendance"}
      </button>
    </div>
  );
}

export default StudentScanPage;
