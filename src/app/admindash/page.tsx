"use client";
import React, { useState, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// User Interface
interface User {
  id?: string;
  name?: string;
  email?: string;
  rollNumber?: string;
  age?: number;
  gender?: string;
  aadhar?: string;
  course?: string;
  mobileNo?: string;
  college?: string;
  depo?: string;
}

// --- NEW --- Defines the structure for the blank "add user" form
const initialNewUserState: Partial<User> = {
  name: "",
  email: "",
  rollNumber: "",
  age: undefined,
  gender: "",
  aadhar: "",
  course: "",
  mobileNo: "",
  college: "",
  depo: "",
};

export default function AdminDashboard() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewUsers, setPreviewUsers] = useState<User[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedUser, setEditedUser] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const [isAddingNewUser, setIsAddingNewUser] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>(initialNewUserState);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoadingUsers(true);
      const res = await fetch("/api/users", { cache: "no-store" });

      if (!res.ok) {
        console.error(`Failed to fetch users: ${res.statusText} (${res.status})`);
        if (res.status === 401 || res.status === 403) {
            router.push("/admin");
        }
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
  }, [router]);

  // Create a debounced version of fetchUsers
  const debouncedFetchUsers = useCallback(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers();
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [fetchUsers]);

  useEffect(() => {
    debouncedFetchUsers();
  }, [debouncedFetchUsers]);

  // --- ALL HANDLER FUNCTIONS ---

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin");
    } catch (error) {
      console.error("Error during logout:", error);
      alert("Failed to log out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const keyMap: Record<string, keyof User> = { "Id": "id", "Name": "name", "Email": "email", "RollNumber": "rollNumber", "Age": "age", "Gender ": "gender", "Aadhar ": "aadhar", "Course": "course", "Mobile no": "mobileNo", "College": "college", "Depo": "depo"};

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
          if (row[key] !== undefined) {
            const frontendKey = keyMap[key];
            const rawValue = row[key];
            if (frontendKey === 'age') {
              const parsedAge = parseInt(String(rawValue), 10);
              user[frontendKey] = isNaN(parsedAge) ? undefined : parsedAge;
            } else { user[frontendKey] = String(rawValue); }
          }
        }
        return user;
      });
      setPreviewUsers(formattedData as User[]);
    };
    reader.readAsArrayBuffer(file);
  }

  async function saveToDB() {
    if (previewUsers.length === 0) return;
    try {
      setIsUploading(true);
      const res = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(previewUsers) });
      if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
      const result = await res.json();
      alert(`✅ Uploaded ${result.count} users`);
      await fetchUsers();
      setPreviewUsers([]);
      setFile(null);
    } catch (error) { console.error("Upload error:", error); alert("Upload failed. Check console for details.");
    } finally { setIsUploading(false); }
  }

  function resetPreview() {
    setPreviewUsers([]);
    setFile(null);
  }

  function handleEditClick(user: User) {
    setEditingId(user.id || null);
    setEditedUser({ ...user });
  }

  function handleInputChange(field: keyof User, value: string | number) {
    if (!editedUser) return;
    setEditedUser(prev => ({...prev!, [field]: field === 'age' ? (value === '' ? undefined : Number(value)) : value}));
  }

  async function handleUpdateUser(userId: string) {
    if (!editedUser) return;
    try {
      setIsSaving(true);
      const res = await fetch(`/api/users/${userId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editedUser) });
      if (!res.ok) throw new Error(`Update failed: ${res.statusText}`);
      setUsers(users.map(user => (user.id === userId ? editedUser : user)));
      setEditingId(null);
      setEditedUser(null);
      alert('User updated successfully!');
    } catch (error) { console.error('Update error:', error); alert('Failed to update user. Check console for details.');
    } finally { setIsSaving(false); }
  }

  async function handleDeleteUser(userId: string) {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      setIsDeleting(userId);
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Delete failed: ${res.statusText}`);
      setUsers(users.filter(user => user.id !== userId));
      alert('User deleted successfully!');
    } catch (error) { console.error('Delete error:', error); alert('Failed to delete user. Check console for details.');
    } finally { setIsDeleting(null); }
  }

  function handleNewUserInputChange(field: keyof User, value: string | number) {
    setNewUser(prev => ({ ...prev, [field]: field === 'age' ? (value === '' ? undefined : Number(value)) : value }));
  }

  async function handleSaveNewUser() {
    if (!newUser.name || !newUser.email) {
      alert("Name and Email are required fields.");
      return;
    }
    try {
      setIsSaving(true);
      const res = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newUser) });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to create user: ${res.statusText}`);
      }
      const createdUser = await res.json();
      setUsers(prevUsers => [createdUser, ...prevUsers]);
      alert('✅ New user added successfully!');
      setIsAddingNewUser(false);
      setNewUser(initialNewUserState);
    } catch (error) { console.error("Create user error:", error); alert(`Failed to add new user. ${(error as Error).message}`);
    } finally { setIsSaving(false); }
  }

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut" as const
      }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  const tbodyVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const tableHeaders = ["Id", "Name", "Email", "Roll Number", "Age", "Gender", "Aadhar", "Course", "Mobile No", "College", "Depo", "Actions"];
  const previewTableHeaders = tableHeaders.slice(0, -1);
  const totalColumns = tableHeaders.length;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8">
      <motion.div className="w-full max-w-7xl px-4 py-8 bg-black text-white rounded-xl shadow-lg" variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={itemVariants} className="flex justify-end mb-4">
          <motion.button onClick={handleLogout} disabled={isLoggingOut} className="bg-red-700 hover:bg-red-800 text-white px-5 py-2 rounded-xl font-semibold transition disabled:opacity-50" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            {isLoggingOut ? "Logging Out..." : "Logout"}
          </motion.button>
        </motion.div>

        <motion.div variants={itemVariants}>
          <label htmlFor="file_input" className="block mb-2 text-sm font-medium text-white">Upload Excel File</label>
          <input id="file_input" type="file" accept=".xlsx, .xls" onChange={(e) => { const selected = e.target.files?.[0] || null; setFile(selected); if (selected) previewData(); }} className="block w-full text-white border border-gray-600 rounded-lg cursor-pointer bg-gray-700 focus:outline-none" />
          <p className="mt-1 text-sm text-gray-400">Excel fields: Id, Name, Email, RollNumber, Age, Gender, Aadhar, Course, Mobile no, College, Depo</p>
        </motion.div>

        <motion.div className="flex flex-wrap justify-center mt-6 gap-5 font-semibold text-white" variants={itemVariants}>
          <motion.button onClick={() => setIsAddingNewUser(!isAddingNewUser)} className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            {isAddingNewUser ? "Cancel" : "Add New User"}
          </motion.button>
          <motion.button onClick={previewData} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Preview Data</motion.button>
          <motion.button onClick={saveToDB} disabled={isUploading} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl disabled:opacity-50" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>{isUploading ? "Uploading..." : "Save to DB"}</motion.button>
          <motion.button onClick={resetPreview} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Delete Preview</motion.button>
          <motion.button onClick={fetchUsers} disabled={isLoadingUsers} className={`px-4 py-2 rounded-xl ${isLoadingUsers ? "bg-gray-500 cursor-not-allowed" : "bg-gray-700 hover:bg-gray-800"}`} whileHover={isLoadingUsers ? {} : { scale: 1.05 }} whileTap={isLoadingUsers ? {} : { scale: 0.95 }}>{isLoadingUsers ? "Loading..." : "Load Current Data"}</motion.button>
        </motion.div>

        {isAddingNewUser && (
          <motion.div className="mt-10 p-6 border border-gray-700 rounded-lg" variants={itemVariants}>
            <h3 className="font-bold text-lg mb-4 text-white">Create a New User</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(Object.keys(initialNewUserState) as Array<keyof User>).map(field => (
                <div key={field}>
                  <label htmlFor={`new-${field}`} className="block mb-1 text-sm font-medium text-gray-400 capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
                  <input id={`new-${field}`} type={field === 'age' ? 'number' : field === 'email' ? 'email' : 'text'} value={newUser[field] || ''} onChange={(e) => handleNewUserInputChange(field, e.target.value)} className="bg-gray-800 text-white px-3 py-2 rounded-md w-full border border-gray-600 focus:ring-2 focus:ring-indigo-500" />
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <button onClick={() => setIsAddingNewUser(false)} className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-xl font-semibold">Cancel</button>
              <button onClick={handleSaveNewUser} disabled={isSaving} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl font-semibold disabled:opacity-50">{isSaving ? 'Saving...' : 'Save User'}</button>
            </div>
          </motion.div>
        )}

        {previewUsers.length > 0 && (
          <motion.div className="mt-10" variants={itemVariants}>
            <h3 className="font-bold text-lg mb-2 text-white">Preview Data ({previewUsers.length})</h3>
            <div className="overflow-x-auto border border-gray-700 rounded-md">
              <table className="w-full text-sm text-left text-gray-300">
                <thead className="text-xs text-gray-200 uppercase bg-gray-800">
                  <tr>{previewTableHeaders.map((h) => (<th key={h} className="px-6 py-3">{h}</th>))}</tr>
                </thead>
                <motion.tbody variants={tbodyVariants} initial="hidden" animate="visible">
                  {previewUsers.map((user, idx) => (
                    <motion.tr key={idx} variants={rowVariants} className="bg-gray-900 border-b border-gray-700">
                      <td className="px-6 py-3 text-white">{user.id}</td><td className="px-6 py-3 text-white">{user.name}</td><td className="px-6 py-3 text-white">{user.email}</td><td className="px-6 py-3 text-white">{user.rollNumber}</td><td className="px-6 py-3 text-white">{user.age}</td><td className="px-6 py-3 text-white">{user.gender}</td><td className="px-6 py-3 text-white">{user.aadhar}</td><td className="px-6 py-3 text-white">{user.course}</td><td className="px-6 py-3 text-white">{user.mobileNo}</td><td className="px-6 py-3 text-white">{user.college}</td><td className="px-6 py-3 text-white">{user.depo}</td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          </motion.div>
        )}

        <motion.div className="mt-10" variants={itemVariants}>
          <h3 className="font-bold text-lg mb-2 text-white">All Users in Database ({users.length})</h3>
          <div className="overflow-x-auto border border-gray-700 rounded-md">
            <table className="w-full text-sm text-left text-gray-300">
              <thead className="text-xs text-gray-200 uppercase bg-gray-800">
                <tr>{tableHeaders.map((h) => (<th key={h} className="px-6 py-3">{h}</th>))}</tr>
              </thead>
              <motion.tbody variants={tbodyVariants} initial="hidden" animate="visible">
                {isLoadingUsers ? (<motion.tr><td colSpan={totalColumns} className="text-center py-4">Loading...</td></motion.tr>) : users.length === 0 ? (
                  <motion.tr variants={rowVariants}><td colSpan={totalColumns} className="px-6 py-3 text-center text-white">No data available</td></motion.tr>
                ) : (
                  users.map((user) => (
                    <motion.tr key={user.id} variants={rowVariants} className="bg-gray-900 border-b border-gray-700">
                      <td className="px-6 py-3 text-white">{user.id}</td>
                      <td className="px-6 py-3 text-white">{editingId === user.id ? <input type="text" value={editedUser?.name || ''} onChange={(e) => handleInputChange('name', e.target.value)} className="bg-gray-800 text-white px-2 py-1 rounded w-full"/> : user.name}</td>
                      <td className="px-6 py-3 text-white">{editingId === user.id ? <input type="email" value={editedUser?.email || ''} onChange={(e) => handleInputChange('email', e.target.value)} className="bg-gray-800 text-white px-2 py-1 rounded w-full"/> : user.email}</td>
                      <td className="px-6 py-3 text-white">{editingId === user.id ? <input type="text" value={editedUser?.rollNumber || ''} onChange={(e) => handleInputChange('rollNumber', e.target.value)} className="bg-gray-800 text-white px-2 py-1 rounded w-full"/> : user.rollNumber}</td>
                      <td className="px-6 py-3 text-white">{editingId === user.id ? <input type="number" value={editedUser?.age || ''} onChange={(e) => handleInputChange('age', e.target.value)} className="bg-gray-800 text-white px-2 py-1 rounded w-full"/> : user.age}</td>
                      <td className="px-6 py-3 text-white">{editingId === user.id ? <input type="text" value={editedUser?.gender || ''} onChange={(e) => handleInputChange('gender', e.target.value)} className="bg-gray-800 text-white px-2 py-1 rounded w-full"/> : user.gender}</td>
                      <td className="px-6 py-3 text-white">{editingId === user.id ? <input type="text" value={editedUser?.aadhar || ''} onChange={(e) => handleInputChange('aadhar', e.target.value)} className="bg-gray-800 text-white px-2 py-1 rounded w-full"/> : user.aadhar}</td>
                      <td className="px-6 py-3 text-white">{editingId === user.id ? <input type="text" value={editedUser?.course || ''} onChange={(e) => handleInputChange('course', e.target.value)} className="bg-gray-800 text-white px-2 py-1 rounded w-full"/> : user.course}</td>
                      <td className="px-6 py-3 text-white">{editingId === user.id ? <input type="text" value={editedUser?.mobileNo || ''} onChange={(e) => handleInputChange('mobileNo', e.target.value)} className="bg-gray-800 text-white px-2 py-1 rounded w-full"/> : user.mobileNo}</td>
                      <td className="px-6 py-3 text-white">{editingId === user.id ? <input type="text" value={editedUser?.college || ''} onChange={(e) => handleInputChange('college', e.target.value)} className="bg-gray-800 text-white px-2 py-1 rounded w-full"/> : user.college}</td>
                      <td className="px-6 py-3 text-white">{editingId === user.id ? <input type="text" value={editedUser?.depo || ''} onChange={(e) => handleInputChange('depo', e.target.value)} className="bg-gray-800 text-white px-2 py-1 rounded w-full"/> : user.depo}</td>
                      <td className="px-6 py-3 text-white">
                        {editingId === user.id ? (
                          <div className="flex gap-2">
                            <button onClick={() => handleUpdateUser(user.id!)} disabled={isSaving} className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm disabled:opacity-50">{isSaving ? '...' : 'Save'}</button>
                            <button onClick={() => setEditingId(null)} className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-sm">Cancel</button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button onClick={() => handleEditClick(user)} className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm">Edit</button>
                            <button onClick={() => handleDeleteUser(user.id!)} disabled={isDeleting === user.id} className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm disabled:opacity-50">{isDeleting === user.id ? '...' : 'Delete'}</button>
                          </div>
                        )}
                      </td>
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