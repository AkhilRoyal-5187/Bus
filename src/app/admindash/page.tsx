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
  const [file, setFile] = useState<File | null>(null);
  const [jsonData, setJsonData] = useState("");

  // ✅ Fixed useEffect with async function inside
  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/users");
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    }

    fetchUsers();
  }, []);

  function mapExcelKeysToModel(row: any): User {
    return {
      name: row["Name"] || "",
      age: row["Age"] ? Number(row["Age"]) : null,
      gender: row["Gender"] || "",
      aadhar: row["Aadhar"] || "",
      course: row["Course"] || "",
      mobileNo: row["Mobile No"] || "",
      college: row["College"] || "",
      depo: row["Depo"] || "",
    };
  }

  function previewData() {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      try {
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        const mapped = json.map(mapExcelKeysToModel);

        const withIds = mapped.map((user, idx) => ({
          id: user.id ?? `temp-id-${idx}`,
          ...user,
        }));

        const safeJson = JSON.stringify(withIds, null, 2);
        setJsonData(safeJson);
      } catch (err) {
        console.error("Error parsing Excel:", err);
        alert("Failed to parse Excel. Please check the file format.");
      }
    };
    reader.readAsBinaryString(file);
  }

  const loadData = async () => {
    try {
      if (!jsonData) {
        alert("No data to upload");
        return;
      }

      const uploadedUsers = JSON.parse(jsonData);

      console.log("Uploading users:", uploadedUsers);

      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(uploadedUsers),
      });

      console.log("Response status:", res.status);
      const responseBody = await res.text();
      console.log("Response body:", responseBody);

      if (!res.ok) {
        throw new Error("Failed to upload users");
      }

      const data = JSON.parse(responseBody);
      console.log("Success:", data);

      setUsers(uploadedUsers);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload users. Check console for details.");
    }
  };

  return (
    <div>
      <div className="flex justify-center gap-8">
        <div>
          <label
            htmlFor="file_input"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Upload file
          </label>
          <input
            id="file_input"
            type="file"
            accept=".xlsx, .xls"
            onChange={(e) =>
              setFile(e.target.files ? e.target.files[0] : null)
            }
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
          />
          <p
            id="file_input_help"
            className="mt-1 text-sm text-gray-500 dark:text-gray-300"
          >
            Please upload the data in excel format with all fields (id, name,
            age, gender, aadhar, course, mobileNo, college, depo)
          </p>

          <div className="flex justify-center mt-8 gap-5 font-extrabold text-xl ">
            <button onClick={previewData}>Preview data</button>
            <button onClick={loadData}>Load data</button>
            <button
              onClick={() => {
                setUsers([]);
                setJsonData("");
                setFile(null);
              }}
            >
              Delete data
            </button>
          </div>

          <div className="mt-10">
            <pre>{jsonData}</pre>

            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 rounded-2xl">
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
                    users.map((user) => (
                      <tr key={user.id}>
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
    </div>
  );
}
