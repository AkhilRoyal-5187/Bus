"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

interface User {
  id: string;
  name: string | null;
  age: number | null;
  gender: string | null;
  aadhar: string | null;
  course: string | null;
  mobileNo: string | null;
  college: string | null;
  depo: string | null;
  email: string;
  rollNumber: string | null;
}

export default function AdminDash() {
  const [file, setFile] = useState<File | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFile(file);
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          // Preview the data
          setPreviewData(jsonData);

          // Process and upload the data
          const response = await fetch("/api/users/bulk", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(jsonData),
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || "Failed to upload data");
          }

          setSuccess("Data uploaded successfully!");
          fetchUsers(); // Refresh the user list
        } catch (error) {
          setError(error instanceof Error ? error.message : "Failed to process file");
        }
      };

      reader.onerror = () => {
        setError("Failed to read file");
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      setError("Failed to process file");
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8">
      <motion.div
        className="w-full max-w-7xl px-4 py-8 bg-black text-white rounded-xl shadow-lg"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <label
            htmlFor="file_input"
            className="block mb-2 text-sm font-medium text-white"
          >
            Upload Excel File
          </label>
          <input
            id="file_input"
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            className="block w-full text-white border border-gray-600 rounded-lg cursor-pointer bg-gray-700 focus:outline-none placeholder-gray-400"
          />
          <p className="mt-1 text-sm text-gray-400">
            Excel fields: name, age, gender, aadhar, course, mobile no, college,
            depo, email, rollNumber
          </p>
        </motion.div>

        {error && (
          <motion.div
            variants={itemVariants}
            className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </motion.div>
        )}

        {success && (
          <motion.div
            variants={itemVariants}
            className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{success}</span>
          </motion.div>
        )}

        {loading && (
          <motion.div
            variants={itemVariants}
            className="mt-4 text-center text-gray-400"
          >
            Processing...
          </motion.div>
        )}

        {previewData.length > 0 && (
          <motion.div variants={itemVariants} className="mt-8">
            <h3 className="font-bold text-lg mb-2 text-white">
              Preview Data ({previewData.length} rows)
            </h3>
            <div className="overflow-x-auto border border-gray-700 rounded-md">
              <table className="w-full text-sm text-left text-gray-300">
                <thead className="text-xs text-gray-200 uppercase bg-gray-800">
                  <tr>
                    {Object.keys(previewData[0]).map((header) => (
                      <th key={header} className="px-6 py-3">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.slice(0, 5).map((row, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-700 hover:bg-gray-800"
                    >
                      {Object.values(row).map((value: any, i) => (
                        <td key={i} className="px-6 py-4">
                          {value?.toString() || ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="mt-8">
          <h3 className="font-bold text-lg mb-2 text-white">
            All Users in Database ({users.length})
          </h3>
          <div className="overflow-x-auto border border-gray-700 rounded-md">
            <table className="w-full text-sm text-left text-gray-300">
              <thead className="text-xs text-gray-200 uppercase bg-gray-800">
                <tr>
                  {[
                    "Id",
                    "Name",
                    "Email",
                    "Roll Number",
                    "Age",
                    "Gender",
                    "Aadhar",
                    "Course",
                    "Mobile No",
                    "College",
                    "Depo",
                  ].map((header) => (
                    <th key={header} className="px-6 py-3">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-700 hover:bg-gray-800"
                  >
                    <td className="px-6 py-4">{user.id}</td>
                    <td className="px-6 py-4">{user.name}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">{user.rollNumber}</td>
                    <td className="px-6 py-4">{user.age}</td>
                    <td className="px-6 py-4">{user.gender}</td>
                    <td className="px-6 py-4">{user.aadhar}</td>
                    <td className="px-6 py-4">{user.course}</td>
                    <td className="px-6 py-4">{user.mobileNo}</td>
                    <td className="px-6 py-4">{user.college}</td>
                    <td className="px-6 py-4">{user.depo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}