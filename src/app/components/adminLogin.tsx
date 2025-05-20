"use client";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
    const router = useRouter();
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.push("/admindash");
    };
    return (
        <div className="flex flex-col items-center justify-center w-full h-full">
            <h1 className="text-4xl font-bold mb-6">Admin Login</h1>
            <form className="flex flex-col gap-6 w-1/3 p-6 border border-gray-300 rounded-lg shadow-lg" onSubmit={handleSubmit}>
                <input type="text" placeholder="Username" className="border border-gray-300 p-3 rounded text-lg"/>
                <input type="password" placeholder="Password" className="border border-gray-300 p-3 rounded text-lg"/>
                <button type="submit" className="bg-blue-500 text-white p-3 rounded text-lg">Login</button>
            </form>
        </div>
    )
}