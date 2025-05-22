"use client";

import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

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

  // Load users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setIsLoadingUsers(true);
      // Force no-cache to get fresh data always
      const res = await fetch("/api/users", { cache: "no-store" });

      if (!res.ok) {
        throw new Error(`Failed to fetch users: ${res.statusText}`);
      }
      const data = await res.json();
      console.log("Fetched users from DB:", data);
      setUsers(data);
      setPreviewUsers([]); // clear preview on load DB
    } catch (error) {
      console.error("Fetch users error:", error);
      alert("Failed to load users from DB. Check console.");
    } finally {
      setIsLoadingUsers(false);
    }
  }

  // Key mapping for Excel to User model
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

      await fetchUsers(); // Refresh DB data after upload
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

  return (
    <div className="flex justify-center gap-8">
      <div className="w-full max-w-7xl px-4">
        <label
          htmlFor="file_input"
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
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
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
        />
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
          Excel fields: name, age, gender, aadhar, course, mobile no, college,
          depo
        </p>

        <div className="flex justify-center mt-6 gap-5 font-semibold text-white">
          <button
            onClick={previewData}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl"
          >
            Preview Data
          </button>
          <button
            onClick={saveToDB}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl"
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Save to DB"}
          </button>
          <button
            onClick={resetPreview}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl"
          >
            Delete Preview
          </button>
          <button
            onClick={fetchUsers}
            disabled={isLoadingUsers}
            className={`px-4 py-2 rounded-xl ${
              isLoadingUsers
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-gray-700 hover:bg-gray-800"
            }`}
          >
            {isLoadingUsers ? "Loading..." : "Load Current Data"}
          </button>
        </div>

        {/* Preview Table */}
        {previewUsers.length > 0 && (
          <div className="mt-10">
            <h3 className="font-bold text-lg mb-2">
              Preview Data ({previewUsers.length})
            </h3>
            <div className="overflow-x-auto border border-gray-300 rounded-md">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
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
                <tbody>
                  {previewUsers.map((user, idx) => (
                    <tr key={idx} className="bg-white dark:bg-gray-800">
                      <td className="px-6 py-3">{user.name}</td>
                      <td className="px-6 py-3">{user.age}</td>
                      <td className="px-6 py-3">{user.gender}</td>
                      <td className="px-6 py-3">{user.aadhar}</td>
                      <td className="px-6 py-3">{user.course}</td>
                      <td className="px-6 py-3">{user.mobileNo}</td>
                      <td className="px-6 py-3">{user.college}</td>
                      <td className="px-6 py-3">{user.depo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DB Users Table */}
        <div className="mt-10">
          <h3 className="font-bold text-lg mb-2">
            All Users in Database ({users.length})
          </h3>
          <div className="overflow-x-auto border border-gray-300 rounded-md">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
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
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-3 text-center">
                  No data available
                </td>
              </tr>
            ) : (
              users.map((user, idx) => (
                <tr key={user.id ?? idx}>
                  <td className="px-6 py-3">{user.id}</td>
                  <td className="px-6 py-3">{user.name}</td>
                  <td className="px-6 py-3">{user.age}</td>
                  <td className="px-6 py-3">{user.gender}</td>
                  <td className="px-6 py-3">{user.aadhar}</td>
                  <td className="px-6 py-3">{user.course}</td>
                  <td className="px-6 py-3">{user.mobileNo}</td>
                  <td className="px-6 py-3">{user.college}</td>
                  <td className="px-6 py-3">{user.depo}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
  );
}
