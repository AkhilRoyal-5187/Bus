"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function StudentDash() {
    const router = useRouter();
    const [daysLeft, setDaysLeft] = useState<number | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("pass_token");

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
            } catch (_err) {
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

        localStorage.setItem("pass_token", data.token);
        router.push(`/studentdash/qr?token=${encodeURIComponent(data.token)}`);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3, // Increased stagger for more distinct entry
                duration: 0.6,
                ease: "easeOut",
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 40 }, // Increased y for more noticeable slide
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
    };

    const buttonHoverTap = {
        whileHover: { scale: 1.05 },
        whileTap: { scale: 0.95 }
    };

    return (
        <motion.div
            className="flex flex-col items-center min-h-screen bg-black text-white pt-24 pb-8 px-4" // Increased top padding, added bottom padding
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Pass Validity Display */}
            <motion.div variants={itemVariants} className="mb-16 text-center"> {/* Increased margin-bottom */}
                <p className="text-6xl sm:text-7xl font-extrabold tracking-tight text-emerald-400 leading-none"> {/* Larger, bolder, vibrant green */}
                    {daysLeft !== null
                        ? daysLeft
                        : "—"} {/* Use an em-dash for no value */}
                </p>
                <p className="mt-4 text-2xl sm:text-3xl text-gray-300 font-semibold">
                    {daysLeft !== null
                        ? `day${daysLeft !== 1 ? 's' : ''} left`
                        : "No active pass"}
                </p>
                {daysLeft === 0 && daysLeft !== null && ( // Show message only if daysLeft is explicitly 0
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="text-lg text-red-500 mt-4 font-medium" // Clear red for expired
                    >
                        Your pass has expired! Please recharge.
                    </motion.p>
                )}
            </motion.div>

            {/* Generate QR Code Button */}
            <motion.div variants={itemVariants} className="mb-16 w-full max-w-sm"> {/* Centered and width controlled */}
                <motion.button
                    onClick={handleGenerateQR}
                    className="w-full h-32 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 shadow-xl flex items-center justify-center text-white text-3xl font-bold transition-all duration-300 hover:from-blue-700 hover:to-indigo-800"
                    {...buttonHoverTap} // Apply hover/tap effects
                >
                    Generate QR Code
                </motion.button>
            </motion.div>

            {/* Recharge Section */}
            <motion.div variants={itemVariants} className="w-full max-w-sm"> {/* Centered and width controlled */}
                <div className="flex flex-col items-center bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700"> {/* Darker card background, clear border */}
                    <p className="text-xl mb-6 text-gray-200 text-center font-medium">Extend your bus pass validity</p>
                    <motion.button
                        onClick={() => router.push("/studentdash/payment")}
                        className="bg-green-600 px-8 py-4 rounded-xl shadow-md text-white text-xl font-semibold transition-colors duration-300 hover:bg-green-500"
                        {...buttonHoverTap} // Apply hover/tap effects
                    >
                        Recharge Now
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
}