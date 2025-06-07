"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { motion } from "framer-motion";

export default function StudentLogin() {
    const router = useRouter();
    const redirect = (e: React.FormEvent) => {
        e.preventDefault();
        router.push("/studentdash");
    };

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.5,
                ease: "easeOut",
                when: "beforeChildren",
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    };

    return (
        <div className="min-h-screen min-w-screen bg-black flex items-center justify-center px-4">
            <motion.div
                className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 sm:p-10"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.h1 variants={itemVariants} className="text-3xl sm:text-4xl font-bold text-center mb-8 text-gray-900">Student Login</motion.h1>
                <motion.form onSubmit={redirect} className="flex flex-col gap-6">
                    <motion.input
                        variants={itemVariants}
                        type="text"
                        placeholder="Username"
                        className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <motion.input
                        variants={itemVariants}
                        type="password"
                        placeholder="Password"
                        className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <motion.button
                        variants={itemVariants}
                        type="submit"
                        className="bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-500 transition"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Login
                    </motion.button>
                </motion.form>
            </motion.div>
        </div>
    );
}