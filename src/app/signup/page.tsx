"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const router = useRouter();
  const [role, setRole] = useState<"student" | "admin" | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobileNo: "",
    age: "",
    gender: "",
    aadhar: "",
    course: "",
    college: "",
    depo: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          mobileNo: formData.mobileNo,
          role: role
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
      }

      // Store the token in a cookie
      document.cookie = `token=${data.token}; path=/`;

      // Redirect based on role
      if (role === "admin") {
        router.push("/admindash");
      } else {
        router.push("/studentdash");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
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
          <motion.form onSubmit={handleSubmit} variants={itemVariants} className="flex flex-col gap-6">
            {error && (
              <motion.div
                variants={itemVariants}
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                role="alert"
              >
                <span className="block sm:inline">{error}</span>
              </motion.div>
            )}
            
            <motion.input
              variants={itemVariants}
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Full Name"
              required
              className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <motion.input
              variants={itemVariants}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email"
              required
              className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <motion.input
              variants={itemVariants}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password"
              required
              className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <motion.input
              variants={itemVariants}
              type="tel"
              name="mobileNo"
              value={formData.mobileNo}
              onChange={handleInputChange}
              placeholder="Mobile Number"
              className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            {role === "student" && (
              <>
                <motion.input
                  variants={itemVariants}
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder="Age"
                  className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <motion.input
                  variants={itemVariants}
                  type="text"
                  name="aadhar"
                  value={formData.aadhar}
                  onChange={handleInputChange}
                  placeholder="Aadhar Number"
                  className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <motion.input
                  variants={itemVariants}
                  type="text"
                  name="course"
                  value={formData.course}
                  onChange={handleInputChange}
                  placeholder="Course"
                  className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <motion.input
                  variants={itemVariants}
                  type="text"
                  name="college"
                  value={formData.college}
                  onChange={handleInputChange}
                  placeholder="College"
                  className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <motion.input
                  variants={itemVariants}
                  type="text"
                  name="depo"
                  value={formData.depo}
                  onChange={handleInputChange}
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
                disabled={isLoading}
                className="flex-1 bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-500 transition disabled:opacity-50"
              >
                {isLoading ? "Signing up..." : "Sign Up"}
              </motion.button>
            </div>
          </motion.form>
        )}
      </motion.div>
    </div>
  );
} 