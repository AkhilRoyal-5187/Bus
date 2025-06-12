"use client";
import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface User {
  id?: string;
  name?: string;
  age?: string;
  gender?: string;
  aadhar?: string;
  course?: string;
  mobileNo?: string;
  college?: string;
  depo?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewUsers, setPreviewUsers] = useState<User[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setIsLoadingUsers(true);
      const res = await fetch("/api/users", { cache: "no-store" });

      if (!res.ok) {
        throw new Error(`Failed to fetch users: ${res.statusText}`);
      }

      const data = await res.json();
      setUsers(data);
      setPreviewUsers([]);
    } catch (error) {
      console.error("Fetch users error:", error);
      alert("Failed to load users from DB. Check console.");
    } finally {
      setIsLoadingUsers(false);
    }
  }

  const keyMap: Record<string, keyof User> = {
    name: "name",
    age: "age",
    gender: "gender",
    aadhar: "aadhar",
    course: "course",
    "mobile no": "mobileNo",
    college: "college",
    depo: "depo",
  };

  function previewData() {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

      const formattedData = jsonData.map((row) => {
        const user: User = {};
        for (const key in keyMap) {
          user[keyMap[key]] = row[key] || "";
        }
        return user;
      });

      setPreviewUsers(formattedData);
    };
    reader.readAsArrayBuffer(file);
  }

  async function saveToDB() {
    if (previewUsers.length === 0) return;

    try {
      setIsUploading(true);
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(previewUsers),
      });

      if (!res.ok) throw new Error("Upload failed");
      const result = await res.json();

      alert(`✅ Uploaded ${result.count} users`);
      await fetchUsers();
      setPreviewUsers([]);
      setFile(null);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  function resetPreview() {
    setPreviewUsers([]);
    setFile(null);
  }

  // Motion variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut", when: "beforeChildren", staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const tbodyVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
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
          <label htmlFor="file_input" className="block mb-2 text-sm font-medium text-white">
            Upload Excel File
          </label>
          <input
            id="file_input"
            type="file"
            accept=".xlsx, .xls"
            onChange={(e) => {
              const selected = e.target.files?.[0] || null;
              setFile(selected);
              if (selected) previewData();
            }}
            className="block w-full text-white border border-gray-600 rounded-lg cursor-pointer bg-gray-700 focus:outline-none placeholder-gray-400"
          />
          <p className="mt-1 text-sm text-gray-400">
            Excel fields: name, age, gender, aadhar, course, mobile no, college, depo
          </p>
        </motion.div>

        <motion.div className="flex flex-wrap justify-center mt-6 gap-5 font-semibold text-white" variants={itemVariants}>
          <motion.button
            onClick={previewData}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Preview Data
          </motion.button>
          <motion.button
            onClick={saveToDB}
            disabled={isUploading}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isUploading ? "Uploading..." : "Save to DB"}
          </motion.button>
          <motion.button
            onClick={resetPreview}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Delete Preview
          </motion.button>
          <motion.button
            onClick={fetchUsers}
            disabled={isLoadingUsers}
            className={`px-4 py-2 rounded-xl ${
              isLoadingUsers ? "bg-gray-500 cursor-not-allowed" : "bg-gray-700 hover:bg-gray-800"
            }`}
            whileHover={isLoadingUsers ? {} : { scale: 1.05 }}
            whileTap={isLoadingUsers ? {} : { scale: 0.95 }}
          >
            {isLoadingUsers ? "Loading..." : "Load Current Data"}
          </motion.button>
        </motion.div>

        {/* Preview Table */}
        {previewUsers.length > 0 && (
          <motion.div className="mt-10" variants={itemVariants}>
            <h3 className="font-bold text-lg mb-2 text-white">
              Preview Data ({previewUsers.length})
            </h3>
            <div className="overflow-x-auto border border-gray-700 rounded-md">
              <table className="w-full text-sm text-left text-gray-300">
                <thead className="text-xs text-gray-200 uppercase bg-gray-800">
                  <tr>
                    {["Name", "Age", "Gender", "Aadhar", "Course", "Mobile No", "College", "Depo"].map((h) => (
                      <th key={h} className="px-6 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <motion.tbody variants={tbodyVariants} initial="hidden" animate="visible">
                  {previewUsers.map((user, idx) => (
                    <motion.tr key={idx} variants={rowVariants} className="bg-gray-900 border-b border-gray-700">
                      <td className="px-6 py-3 text-white">{user.name}</td>
                      <td className="px-6 py-3 text-white">{user.age}</td>
                      <td className="px-6 py-3 text-white">{user.gender}</td>
                      <td className="px-6 py-3 text-white">{user.aadhar}</td>
                      <td className="px-6 py-3 text-white">{user.course}</td>
                      <td className="px-6 py-3 text-white">{user.mobileNo}</td>
                      <td className="px-6 py-3 text-white">{user.college}</td>
                      <td className="px-6 py-3 text-white">{user.depo}</td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Users from DB Table */}
        <motion.div className="mt-10" variants={itemVariants}>
          <h3 className="font-bold text-lg mb-2 text-white">
            All Users in Database ({users.length})
          </h3>
          <div className="overflow-x-auto border border-gray-700 rounded-md">
            <table className="w-full text-sm text-left text-gray-300">
              <thead className="text-xs text-gray-200 uppercase bg-gray-800">
                <tr>
                  {["Id", "Name", "Age", "Gender", "Aadhar", "Course", "Mobile No", "College", "Depo"].map((h) => (
                    <th key={h} className="px-6 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <motion.tbody variants={tbodyVariants} initial="hidden" animate="visible">
                {users.length === 0 ? (
                  <motion.tr variants={rowVariants}>
                    <td colSpan={9} className="px-6 py-3 text-center text-white">No data available</td>
                  </motion.tr>
                ) : (
                  users.map((user, idx) => (
                    <motion.tr key={user.id ?? idx} variants={rowVariants} className="bg-gray-900 border-b border-gray-700">
                      <td className="px-6 py-3 text-white">{user.id}</td>
                      <td className="px-6 py-3 text-white">{user.name}</td>
                      <td className="px-6 py-3 text-white">{user.age}</td>
                      <td className="px-6 py-3 text-white">{user.gender}</td>
                      <td className="px-6 py-3 text-white">{user.aadhar}</td>
                      <td className="px-6 py-3 text-white">{user.course}</td>
                      <td className="px-6 py-3 text-white">{user.mobileNo}</td>
                      <td className="px-6 py-3 text-white">{user.college}</td>
                      <td className="px-6 py-3 text-white">{user.depo}</td>
                    </motion.tr>
                  ))
                )}
              </motion.tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
