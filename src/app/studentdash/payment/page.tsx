"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { motion } from "framer-motion";

export default function PaymentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const simulatePayment = async () => {
    setLoading(true);
    const res = await fetch("/api/generate-qr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "student_123" }),
    });

    const data = await res.json();

    localStorage.setItem("pass_token", data.token);

    router.push(`/studentdash/qr?token=${encodeURIComponent(data.token)}`);
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center h-screen bg-gray-950 text-white px-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <motion.h1
        className="text-3xl mb-4 font-semibold"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        Recharge Bus Pass
      </motion.h1>

      <motion.p
        className="mb-6 text-lg text-gray-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        Amount: ₹500
      </motion.p>

      <motion.button
        onClick={simulatePayment}
        disabled={loading}
        className="bg-blue-600 px-8 py-3 rounded-lg text-lg font-medium shadow-lg hover:bg-blue-500 disabled:opacity-50 flex items-center justify-center gap-3"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {loading ? (
          <motion.div
            className="w-6 h-6 border-4 border-t-transparent border-white rounded-full animate-spin"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, ease: "linear", duration: 1 }}
          />
        ) : (
          "Simulate Payment Success"
        )}
      </motion.button>
    </motion.div>
  );
}
