"use client";
import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

// Updated User Interface to include Id, Email, RollNumber, and correct age type
interface User {
  id?: string;        // Matches 'Id' from Excel
  name?: string;
  email?: string;     // Matches 'Email' from Excel
  rollNumber?: string; // Matches 'RollNumber' from Excel
  age?: number;       // Changed to 'number' to match Prisma's Int?
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
  const [isLoggingOut, setIsLoggingOut] = useState(false); // State for logout loading

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setIsLoadingUsers(true);
      const res = await fetch("/api/users", { cache: "no-store" });

      if (!res.ok) {
        console.error(`Failed to fetch users: ${res.statusText} (${res.status})`);
        // If the API explicitly returns unauthorized, force redirect to login
        if (res.status === 401 || res.status === 403) {
            router.push("/admin");
        }
        throw new Error(`Failed to fetch users: ${res.statusText}`);
      }

      const data = await res.json();
      setUsers(data);
      setPreviewUsers([]); // Clear preview after fetching fresh data
    } catch (error) {
      console.error("Fetch users error:", error);
      alert("Failed to load users from DB. Check console.");
    } finally {
      setIsLoadingUsers(false);
    }
  }

  // Handle Logout Functionality
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      console.log("Attempting to log out...");
      const response = await fetch("/api/admin/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Logout failed on the server.");
      }

      console.log("Logout successful. Redirecting to login page.");
      router.push("/admin"); // Redirect to the admin login page
    } catch (error) {
      console.error("Error during logout:", error);
      alert("Failed to log out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Corrected keyMap to exactly match Excel headers (including case and spaces)
  const keyMap: Record<string, keyof User> = {
    "Id": "id",
    "Name": "name",
    "Email": "email",
    "RollNumber": "rollNumber",
    "Age": "age",
    "Gender ": "gender",   // Matches "Gender " from Excel
    "Aadhar ": "aadhar",   // Matches "Aadhar " from Excel
    "Course": "course",
    "Mobile no": "mobileNo", // Matches "Mobile no" from Excel
    "College": "college",
    "Depo": "depo",
  };

  function previewData() {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]; // Assumes data in the first sheet
      const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

      // --- Debugging Logs for Excel Data ---
      console.log("Raw JSON data from Excel (before mapping):", jsonData);
      // --- End Debugging Logs ---

      const formattedData = jsonData.map((row) => {
        const user: User = {};
        for (const key in keyMap) {
          if (row[key] !== undefined) {
            const frontendKey = keyMap[key];
            const rawValue = row[key];

            // Special handling for 'age' to ensure it's a number or undefined
            if (frontendKey === 'age') {
              const parsedAge = parseInt(String(rawValue), 10);
              // Set to number if valid, otherwise undefined
              user[frontendKey] = isNaN(parsedAge) ? undefined : parsedAge;
            } else {
              // Ensure all other values are strings
              user[frontendKey] = String(rawValue);
            }
          }
        }
        return user;
      });

      console.log("Formatted data after mapping:", formattedData); // Debugging
      setPreviewUsers(formattedData as User[]); // Explicit cast for safety
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

      if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
      const result = await res.json();

      alert(`✅ Uploaded ${result.count} users`);
      await fetchUsers(); // Re-fetch users after successful upload
      setPreviewUsers([]); // Clear preview after saving
      setFile(null);      // Clear selected file
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Check console for details.");
    } finally {
      setIsUploading(false);
    }
  }

  function resetPreview() {
    setPreviewUsers([]);
    setFile(null);
  }

  // Motion variants (unchanged)
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

  const tableHeaders = ["Id", "Name", "Email", "Roll Number", "Age", "Gender", "Aadhar", "Course", "Mobile No", "College", "Depo"];
  const totalColumns = tableHeaders.length; // Used for colSpan

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8">
      <motion.div
        className="w-full max-w-7xl px-4 py-8 bg-black text-white rounded-xl shadow-lg"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* LOGOUT BUTTON */}
        <motion.div variants={itemVariants} className="flex justify-end mb-4">
          <motion.button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="bg-red-700 hover:bg-red-800 text-white px-5 py-2 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLoggingOut ? "Logging Out..." : "Logout"}
          </motion.button>
        </motion.div>
        {/* END LOGOUT BUTTON */}

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
              if (selected) previewData(); // Auto-preview when file is selected
            }}
            className="block w-full text-white border border-gray-600 rounded-lg cursor-pointer bg-gray-700 focus:outline-none placeholder-gray-400"
          />
          <p className="mt-1 text-sm text-gray-400">
            Excel fields: Id, Name, Email, RollNumber, Age, Gender, Aadhar, Course, Mobile no, College, Depo
          </p>
        </motion.div>

        <motion.div className="flex flex-wrap justify-center mt-6 gap-5 font-semibold text-white" variants={itemVariants}>
          <motion.button
            onClick={previewData} // Manual preview button
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
                    {tableHeaders.map((h) => (
                      <th key={h} className="px-6 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <motion.tbody variants={tbodyVariants} initial="hidden" animate="visible">
                  {previewUsers.map((user, idx) => (
                    <motion.tr key={idx} variants={rowVariants} className="bg-gray-900 border-b border-gray-700">
                      <td className="px-6 py-3 text-white">{user.id}</td>
                      <td className="px-6 py-3 text-white">{user.name}</td>
                      <td className="px-6 py-3 text-white">{user.email}</td>
                      <td className="px-6 py-3 text-white">{user.rollNumber}</td>
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
                  {tableHeaders.map((h) => (
                    <th key={h} className="px-6 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <motion.tbody variants={tbodyVariants} initial="hidden" animate="visible">
                {users.length === 0 ? (
                  <motion.tr variants={rowVariants}>
                    <td colSpan={totalColumns} className="px-6 py-3 text-center text-white">No data available</td>
                  </motion.tr>
                ) : (
                  users.map((user, idx) => (
                    <motion.tr key={user.id ?? idx} variants={rowVariants} className="bg-gray-900 border-b border-gray-700">
                      <td className="px-6 py-3 text-white">{user.id}</td>
                      <td className="px-6 py-3 text-white">{user.name}</td>
                      <td className="px-6 py-3 text-white">{user.email}</td>
                      <td className="px-6 py-3 text-white">{user.rollNumber}</td>
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