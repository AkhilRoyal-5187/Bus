// app/api/users/route.ts

import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// --- Handler for CREATING a new user (POST request) ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Received data in POST:", body);

    // Destructure all expected fields from the body
    const {
      name,
      email,
      rollNumber,
      age,
      gender,
      aadhar,
      course,
      mobileNo,
      college,
      depo,
      // password is not expected from the 'add new user' form (it's optional in schema)
      // role defaults to "student" in schema, so no need to send it explicitly
    } = body;

    // --- Validate Required Fields based on schema.prisma ---
    // 'email' is the only non-optional String without a default
    if (!email) {
      console.log("Validation Error: Email is missing.");
      return NextResponse.json(
        { message: "Email is a required field." },
        { status: 400 } // Bad Request for missing required field
      );
    }

    // --- Prepare data object for Prisma's `create` method ---
    // Ensure that optional fields from the frontend (which might be empty strings)
    // are converted to `null` or `undefined` for Prisma, aligning with `String?` or `Int?` types.
    const dataToCreate: any = {
      email: email, // Required field, explicitly included

      // Handle optional String fields: if value is an empty string, set to null
      name: name === '' ? null : name,
      gender: gender === '' ? null : gender,
      aadhar: aadhar === '' ? null : aadhar,
      course: course === '' ? null : course,
      college: college === '' ? null : college,
      depo: depo === '' ? null : depo,
      mobileNo: mobileNo === '' ? null : mobileNo,
      rollNumber: rollNumber === '' ? null : rollNumber,

      // Handle optional Int field 'age':
      // 1. Check if 'age' is provided (not undefined, null, or empty string).
      // 2. If provided, parse it to an integer. If parsing results in NaN (not a number), set to null.
      // 3. If not provided (undefined, null, or empty string), set to null.
      age: (age !== undefined && age !== null && age !== '')
           ? (parseInt(String(age), 10) || null)
           : null,
    };

    console.log("Data to send to Prisma (dataToCreate):", dataToCreate);

    // Attempt to create the user in the database
    const newUser = await prisma.user.create({
      data: dataToCreate,
    });

    console.log("User created successfully:", newUser);
    return NextResponse.json(newUser, { status: 201 }); // 201 Created for successful resource creation

  } catch (error: any) {
    // --- Comprehensive Error Logging ---
    console.error("Caught error in POST handler:");
    console.error(error); // Log the full error object for detailed inspection

    if (error.code) {
      console.error("Prisma Error Code:", error.code);
    }
    if (error.message) {
      console.error("Prisma Error Message:", error.message);
    }
    if (error.meta) {
      console.error("Prisma Error Meta:", error.meta); // Useful for unique constraint violations
    }

    // --- Specific Error Handling for Prisma Errors ---

    // P2002: Unique constraint violation (e.g., duplicate email, aadhar, rollNumber, mobileNo)
    if (error.code === 'P2002') {
      const targetFields = error.meta?.target || 'unknown field(s)';
      const message = `A user with this ${Array.isArray(targetFields) ? targetFields.join(', ') : targetFields} already exists.`;
      return NextResponse.json(
        { message: message, error: error.message },
        { status: 409 } // 409 Conflict: Indicates a conflict with the current state of the resource
      );
    }

    // P2000: Value provided for a field is not of the correct type or is too long.
    // This could happen if 'age' failed parsing, but we already handled `parseInt` to `null`.
    // It's a generic client-side data error.
    if (error.code === 'P2000') {
        return NextResponse.json(
            { message: `Invalid value provided for a field: ${error.message}`, code: error.code },
            { status: 400 } // 400 Bad Request
        );
    }

    // P2001, P2025: Record not found (more common for PUT/DELETE, but included for completeness)
    if (error.code === 'P2001' || error.code === 'P2025') {
        return NextResponse.json(
            { message: `Record not found: ${error.message}`, code: error.code },
            { status: 404 } // 404 Not Found
        );
    }

    // Catch any other Prisma-specific errors (Pxxxx) and return a 400 or 500
    if (error.code && error.code.startsWith('P')) {
        return NextResponse.json(
            { message: `Database operation failed: ${error.message}`, code: error.code },
            { status: 500 } // Default to 500 for unhandled Prisma errors, or 400 if clearly client data related
        );
    }

    // --- Fallback for all other unexpected errors ---
    return NextResponse.json(
      { message: "An unexpected server error occurred.", error: error.message || "No specific error message provided." },
      { status: 500 } // 500 Internal Server Error
    );
  }
}

// --- Handler for GETting all users ---
export async function GET() {
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json(users, { status: 200 });
  } catch (error: any) { // Add ': any' to error
    console.error("Fetch Users Error:", error);
    return NextResponse.json(
      { message: "Error fetching users", error: error.message },
      { status: 500 }
    );
  }
}

// --- Handler for UPDATING a user (PUT request by ID) ---
// @ts-expect-error Next.js dynamic route handler context typing issue
export async function PUT(request, context) {
  try {
    const { id } = context.params;
    const body = await request.json();

    console.log("Received data in PUT for ID:", id, "Data:", body);

    // Prepare data for update: similar to POST, handle empty strings to null/undefined
    const dataToUpdate: any = {};
    for (const key in body) {
        if (body[key] === '') {
            dataToUpdate[key] = null; // Set empty strings to null for optional DB fields
        } else if (key === 'age' && (body[key] !== undefined && body[key] !== null)) {
            dataToUpdate[key] = parseInt(String(body[key]), 10) || null; // Parse age, handle NaN
        } else {
            dataToUpdate[key] = body[key];
        }
    }

    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: dataToUpdate, // Use the prepared data
    });

    console.log("User updated successfully:", updatedUser);
    return NextResponse.json(updatedUser, { status: 200 });

  } catch (error: any) { // Add ': any' to error
    console.error("Update User Error:", error);
    console.error("Prisma Error Code:", error.code);
    console.error("Prisma Error Message:", error.message);
    console.error("Prisma Error Meta:", error.meta);

    if (error.code === 'P2025') { // Record to update not found
        return NextResponse.json(
            { message: "User not found for update.", error: error.message },
            { status: 404 } // Not Found
        );
    }
    if (error.code === 'P2002') { // Unique constraint violation on update
        const targetFields = error.meta?.target || 'unknown field(s)';
        const message = `Cannot update: A user with this ${Array.isArray(targetFields) ? targetFields.join(', ') : targetFields} already exists.`;
        return NextResponse.json(
            { message: message, error: error.message },
            { status: 409 } // Conflict
        );
    }
    return NextResponse.json(
      { message: "Error updating user", error: error.message },
      { status: 500 }
    );
  }
}

// --- Handler for DELETING a user (DELETE request by ID) ---
// @ts-expect-error Next.js dynamic route handler context typing issue
export async function DELETE(request, context) {
  try {
    const { id } = context.params;

    console.log("Received DELETE request for ID:", id);

    await prisma.user.delete({
      where: { id: id },
    });

    console.log("User deleted successfully:", id);
    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );

  } catch (error: any) { // Add ': any' to error
    console.error("Delete User Error:", error);
    console.error("Prisma Error Code:", error.code);
    console.error("Prisma Error Message:", error.message);

    if (error.code === 'P2025') { // Record to delete not found
        return NextResponse.json(
            { message: "User not found for deletion.", error: error.message },
            { status: 404 } // Not Found
        );
    }
    return NextResponse.json(
      { message: "Error deleting user", error: error.message },
      { status: 500 }
    );
  }
}