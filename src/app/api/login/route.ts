import { NextResponse } from "next/server";
import { validateUserCredentials } from "@/lib/services/reservationService";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
	try {
		const { email, password } = await request.json();

		const user = await validateUserCredentials({ email, password });
		if (!user) {
			return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
		}

		const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "24h" });

		return NextResponse.json({ token });
	} catch (error) {
		if (error instanceof Error) {
			console.error("Error during login:", error.message);
		} else {
			console.error("Error during login:", error);
		}
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
