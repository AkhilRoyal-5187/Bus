"use client";

import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { motion } from "framer-motion";

export default function QRPage() {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setTimeout(() => setLoading(false), 1000); // Simulate short delay for animation
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <motion.div
          className="w-16 h-16 border-4 border-t-transparent border-white rounded-full animate-spin"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
        />
      </div>
    );
  }

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {daysLeft !== null && token ? (
        <>
          <motion.p className="text-2xl mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            Pass valid for {daysLeft} more day{daysLeft !== 1 ? "s" : ""}
          </motion.p>
          <motion.p className="mb-8 text-gray-400" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            Issued to: {userId}
          </motion.p>
          <motion.div
            className="bg-white p-4 rounded shadow-xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <QRCode
              value={`http://localhost:3000/studentdash/qr?token=${encodeURIComponent(token)}`}
              size={200}
            />
          </motion.div>
        </>
      ) : (
        <p>Token invalid or not found.</p>
      )}
    </motion.div>
  );
}
