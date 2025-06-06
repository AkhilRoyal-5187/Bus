"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function StudentDash() {
    const router = useRouter();
    const [daysLeft, setDaysLeft] = useState<number | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("pass_token"); // save it here after payment

        if (token) {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                    atob(base64)
                        .split('')
                        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                        .join('')
                );
                const decoded = JSON.parse(jsonPayload);
                const now = Date.now();
                const remaining = decoded.expiresAt - now;
                const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
                setDaysLeft(days >= 0 ? days : 0);
            } catch (err) {
                console.error("Invalid token");
            }
        }
    }, []);

    const handleGenerateQR = async () => {
        const res = await fetch("/api/generate-qr", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: "student_123" }),
        });

        const data = await res.json();

        localStorage.setItem("pass_token", data.token); // Save the token
        router.push(`/studentdash/qr?token=${encodeURIComponent(data.token)}`);
    };

    return (
        <div className="flex flex-col items-center h-screen bg-black text-white">
            <div className="mt-8">
                <p className="text-3xl">
                    {daysLeft !== null
                        ? `Pass valid for ${daysLeft} more day${daysLeft !== 1 ? 's' : ''}`
                        : "No active pass"}
                </p>
            </div>

            <div className="mt-10">
                <button onClick={handleGenerateQR} className="bg-blue-600 px-4 py-2 rounded shadow hover:bg-blue-500">
                    <div className="qr-container bg-white text-black flex justify-center items-center text-3xl p-8 rounded-lg">
                        Generate QR code
                    </div>
                </button>
            </div>

            <div className="flex gap-4">
                <div className="flex justify-center items-center flex-col mt-16 bg-blue-600 p-4 rounded-2xl">
                    <p>Recharge the current bus pass</p>
                    <button
                        onClick={() => router.push("/studentdash/payment")}
                        className="bg-gray-900 px-4 py-2 rounded shadow mt-6 hover:bg-gray-800"
                    >
                        Recharge
                    </button>
                </div>
            </div>
        </div>
    );
}
