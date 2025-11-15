import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useSearchParams } from "react-router-dom";
import useGeolocation from "../hooks/useGeolocation";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function StudentScanPage() {
  const [searchParams] = useSearchParams();
  const urlQrValue = searchParams.get("qrCodeValue"); // from QR URL
  const [qrValue, setQrValue] = useState(urlQrValue || "");

  const scannerRef = useRef(null);
  const [scanStarted, setScanStarted] = useState(false);

  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle");

  const { location, error: geoError, loading: geoLoading } = useGeolocation();
  const { user } = useAuth();

  // START QR SCANNER WHEN PAGE OPENS
  useEffect(() => {
    if (urlQrValue) return; // If QR code already supplied via URL, no need to scan

    if (!scanStarted) {
      startScanner();
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startScanner = async () => {
    try {
      const html5Qr = new Html5Qrcode("qr-reader");
      scannerRef.current = html5Qr;

      setScanStarted(true);

      await html5Qr.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: 250,
        },
        (decodedText) => {
          try {
            const url = new URL(decodedText);
            const v = url.searchParams.get("qrCodeValue");
            setQrValue(v || decodedText);
          } catch {
            setQrValue(decodedText);
          }
        },
        () => {}
      );
    } catch (err) {
      console.error("Scanner error:", err);
      setMessage("Camera access error. Allow camera permission.");
      setStatus("error");
    }
  };

  // AUTO SUBMIT ONCE QR + GPS AVAILABLE
  useEffect(() => {
    if (qrValue && location && status === "idle") {
      submitAttendance();
    }
  }, [qrValue, location]);

  const submitAttendance = async () => {
    if (!qrValue) {
      setStatus("error");
      setMessage("Invalid QR code.");
      return;
    }

    if (!location) {
      setStatus("error");
      setMessage("Waiting for GPS… please allow location.");
      return;
    }

    setStatus("loading");
    setMessage("Submitting attendance…");

    try {
      const { data } = await api.post("/api/student/attendance/mark", {
        qrCodeValue: qrValue,
        latitude: location.lat,
        longitude: location.lng,
      });

      setStatus("success");
      setMessage(data.message || "Attendance marked!");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage(err.response?.data?.message || "Failed to mark attendance.");
    }
  };

  const color = {
    success: "bg-green-100 text-green-800",
    error: "bg-red-100 text-red-800",
    loading: "bg-blue-100 text-blue-800",
    idle: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold text-center mb-6">Scan & Mark Attendance</h2>

      <p className="text-center text-gray-700 mb-4">
        Logged in as: <b>{user?.name}</b>
      </p>

      {/* QR SCANNING CAMERA */}
      {!urlQrValue && (
        <div id="qr-reader" style={{ width: "100%", height: "auto" }} className="mb-4 border rounded-lg" />
      )}

      {/* Status Alerts */}
      {message && (
        <div className={`p-3 rounded mb-4 text-center ${color[status]}`}>
          {message}
        </div>
      )}

      {/* GPS Status */}
      {!location && !geoError && (
        <p className="text-blue-600 text-center mb-3">Requesting GPS…</p>
      )}
      {geoError && (
        <p className="text-red-600 text-center mb-3">
          GPS blocked — enable location.
        </p>
      )}
      {location && (
        <p className="text-green-600 text-center mb-3">
          ✓ GPS: {location.lat}, {location.lng}
        </p>
      )}

      {/* Manual Submit Button */}
      {status !== "success" && (
        <button
          onClick={submitAttendance}
          disabled={!location || status === "loading"}
          className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
        >
          {status === "loading" ? "Submitting…" : "Mark Me Present"}
        </button>
      )}
    </div>
  );
}

export default StudentScanPage;
