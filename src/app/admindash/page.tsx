"use client";

import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { motion } from "framer-motion";

interface User {
  id?: string;
  name?: string;
  age?: number | null;
  gender?: string;
  aadhar?: string;
  course?: string;
  mobileNo?: string;
  college?: string;
  depo?: string;
}

export default function AdminDash() {
  const [users, setUsers] = useState<User[]>([]);
  const [previewUsers, setPreviewUsers] = useState<User[]>([]);
  const [file, setFile] = useState<File | null>(null);
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
    "mobile no": "mobileNo",
    mobile: "mobileNo",
    course: "course",
    college: "college",
    depo: "depo",
  };

  function mapExcelKeysToModel(row: any): User {
    const normalized: Partial<User> = {};

    Object.keys(row).forEach((key) => {
      const lower = key.toLowerCase().trim();
      const mappedKey = keyMap[lower];
      if (mappedKey) {
        normalized[mappedKey] = row[key];
      }
    });

    return {
      name: normalized.name || "",
      age: normalized.age ? Number(normalized.age) : null,
      gender: normalized.gender || "",
      aadhar:
        normalized.aadhar !== undefined && normalized.aadhar !== null
          ? String(normalized.aadhar)
          : "",
      course: normalized.course || "",
      mobileNo: normalized.mobileNo ? String(normalized.mobileNo) : "",
      college: normalized.college || "",
      depo: normalized.depo || "",
    };
  }

  function previewData() {
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      alert("Please upload a valid Excel file (.xlsx or .xls)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      try {
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        const mapped = json.map(mapExcelKeysToModel);
        setPreviewUsers(mapped);
      } catch (err) {
        console.error("Error parsing Excel:", err);
        alert("Failed to parse Excel. Please check the file format.");
      }
    };
    reader.readAsBinaryString(file);
  }

  async function saveToDB() {
    if (previewUsers.length === 0) {
      alert("No data to upload");
      return;
    }

    try {
      setIsUploading(true);
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(previewUsers),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      const result = await res.json();
      alert(`✅ Uploaded ${result.count} users`);

      await fetchUsers();
      setPreviewUsers([]);
      setFile(null);
    } catch (error) {
      console.error("Upload error:", error);
      alert("❌ Upload failed. See console for details.");
    } finally {
      setIsUploading(false);
    }
  }

  function resetPreview() {
    setPreviewUsers([]);
    setFile(null);
  }

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.98 },
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

  const tableWrapperVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
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
    <div className="min-h-screen min-w-screen bg-black flex items-center justify-center px-4 py-8">
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
            onChange={(e) => {
              const selected = e.target.files?.[0] || null;
              setFile(selected);
              if (selected) setTimeout(() => previewData(), 300);
            }}
            className="block w-full text-white border border-gray-600 rounded-lg cursor-pointer bg-gray-700 focus:outline-none placeholder-gray-400"
          />
          <p className="mt-1 text-sm text-gray-400">
            Excel fields: name, age, gender, aadhar, course, mobile no, college,
            depo
          </p>
        </motion.div>

        <motion.div
          className="flex flex-wrap justify-center mt-6 gap-5 font-semibold text-white"
          variants={itemVariants}
        >
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
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl"
            disabled={isUploading}
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
              isLoadingUsers
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-gray-700 hover:bg-gray-800"
            }`}
            whileHover={isLoadingUsers ? {} : { scale: 1.05 }}
            whileTap={isLoadingUsers ? {} : { scale: 0.95 }}
          >
            {isLoadingUsers ? "Loading..." : "Load Current Data"}
          </motion.button>
        </motion.div>

        {previewUsers.length > 0 && (
          <motion.div className="mt-10" variants={tableWrapperVariants}>
            <h3 className="font-bold text-lg mb-2 text-white">
              Preview Data ({previewUsers.length})
            </h3>
            <div className="overflow-x-auto border border-gray-700 rounded-md">
              <table className="w-full text-sm text-left text-gray-300">
                <thead className="text-xs text-gray-200 uppercase bg-gray-800">
                  <tr>
                    {[
                      "Name",
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

        <motion.div className="mt-10" variants={tableWrapperVariants}>
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
              <motion.tbody variants={tbodyVariants} initial="hidden" animate="visible">
                {users.length === 0 ? (
                  <motion.tr variants={rowVariants}>
                    <td colSpan={9} className="px-6 py-3 text-center text-white">
                      No data available
                    </td>
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