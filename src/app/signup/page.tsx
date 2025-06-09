"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const router = useRouter();
  const [role, setRole] = useState<"student" | "admin" | null>(null);

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
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <motion.div
        className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 sm:p-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 variants={itemVariants} className="text-3xl sm:text-4xl font-bold text-center mb-8 text-gray-900">
          Sign Up
        </motion.h1>

        {!role ? (
          <motion.div variants={itemVariants} className="flex flex-col gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setRole("student")}
              className="bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-500 transition"
            >
              Sign Up as Student
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setRole("admin")}
              className="bg-green-600 text-white rounded-lg py-3 font-semibold hover:bg-green-500 transition"
            >
              Sign Up as Admin
            </motion.button>
          </motion.div>
        ) : (
          <motion.form variants={itemVariants} className="flex flex-col gap-6">
            <motion.input
              variants={itemVariants}
              type="text"
              placeholder="Full Name"
              className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <motion.input
              variants={itemVariants}
              type="email"
              placeholder="Email"
              className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <motion.input
              variants={itemVariants}
              type="password"
              placeholder="Password"
              className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <motion.input
              variants={itemVariants}
              type="tel"
              placeholder="Mobile Number"
              className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            {role === "student" && (
              <>
                <motion.input
                  variants={itemVariants}
                  type="number"
                  placeholder="Age"
                  className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <motion.input
                  variants={itemVariants}
                  type="text"
                  placeholder="Aadhar Number"
                  className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <motion.input
                  variants={itemVariants}
                  type="text"
                  placeholder="Course"
                  className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <motion.input
                  variants={itemVariants}
                  type="text"
                  placeholder="College"
                  className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <motion.input
                  variants={itemVariants}
                  type="text"
                  placeholder="Depo"
                  className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </>
            )}

            <div className="flex gap-4">
              <motion.button
                variants={itemVariants}
                type="button"
                onClick={() => setRole(null)}
                className="flex-1 bg-gray-500 text-white rounded-lg py-3 font-semibold hover:bg-gray-600 transition"
              >
                Back
              </motion.button>
              <motion.button
                variants={itemVariants}
                type="submit"
                className="flex-1 bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-500 transition"
              >
                Sign Up
              </motion.button>
            </div>
          </motion.form>
        )}
      </motion.div>
    </div>
  );
} 