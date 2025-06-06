"use client";

import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code"; 

export default function QRPage() {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get("token");

    if (!tokenFromUrl) return;

    setToken(tokenFromUrl);

    try {
      const base64Url = tokenFromUrl.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const decoded = JSON.parse(jsonPayload);

      const now = Date.now();
      const remaining = decoded.expiresAt - now;
      const days = Math.floor(remaining / (1000 * 60 * 60 * 24));

      setDaysLeft(days >= 0 ? days : 0);
      setUserId(decoded.userId);
    } catch (err) {
      console.error("Invalid token", err);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
      {daysLeft !== null && token ? (
        <>
          <p className="text-2xl mb-4">
            Pass valid for {daysLeft} more day{daysLeft !== 1 ? "s" : ""}
          </p>
          <p className="mb-8 text-gray-400">Issued to: {userId}</p>

          {/* QR code using react-qr-code */}
          <div className="bg-white p-4 rounded">
            <QRCode value={`http://localhost:3000/studentdash/qr?token=${encodeURIComponent(token)}`} size={200} />
          </div>
        </>
      ) : (
        <p>Loading QR details...</p>
      )}
    </div>
  );
}
