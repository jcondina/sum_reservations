import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
	const token = (await cookies()).get("admin_token");

	if (!token) {
		return NextResponse.error();
	}

	// Verify token here if needed
	return NextResponse.json({ authenticated: true });
}
