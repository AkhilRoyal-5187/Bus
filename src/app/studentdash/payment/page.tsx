"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";

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

    // Save token to localStorage
    localStorage.setItem("pass_token", data.token);

    // Navigate to QR page with token
    router.push(`/studentdash/qr?token=${encodeURIComponent(data.token)}`);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-950 text-white">
      <h1 className="text-3xl mb-4">Recharge Bus Pass</h1>
      <p className="mb-6">Amount: ₹500</p>

      <button
        onClick={simulatePayment}
        disabled={loading}
        className="bg-blue-600 px-6 py-3 rounded text-lg hover:bg-blue-500 disabled:opacity-50"
      >
        {loading ? "Processing..." : "Simulate Payment Success"}
      </button>
    </div>
  );
}
