import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
	const body = await request.json();
	const { email, password } = body;

	// Replace with your actual authentication logic
	if (!email || !password) {
		return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
	}

	if (typeof email !== "string" || typeof password !== "string") {
		return NextResponse.json({ error: "Invalid input types" }, { status: 400 });
	}

	// Basic email format validation
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
	}

	if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
		// Set a secure HTTP-only cookie
		const cookieStore = await cookies();
		cookieStore.set("admin_token", "your-secure-token", {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			path: "/",
		});

		return NextResponse.json({ success: true });
	}

	return NextResponse.error();
}
