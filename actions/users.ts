"use server"
import { prisma } from "../lib/db";

export async function getUsers() {
    try {
        const user = await prisma.User.findMany({
            select: {
                id: true,
                name: true,
                age: true,
                gender: true,
                aadhar: true,
                course: true,
                mobileNo: true,
                college: true,
                depo: true,
            }})
        return user;

    } catch (error) {
        console.error("Error fetching users:", error);
        throw new Error("Failed to fetch users");
    }
}