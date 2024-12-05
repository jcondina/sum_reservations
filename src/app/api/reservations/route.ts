import { NextResponse } from "next/server";
import { createReservation, getAllReservations } from "@/lib/services/reservationService";

export async function POST(request: Request) {
	try {
		const data = await request.json();

		// Validate request data
		if (!data.date || !data.startTime || !data.endTime || !data.name || !data.email || !data.phone || !data.guests) {
			return NextResponse.json({ error: "All fields are required" }, { status: 400 });
		}

		const reservation = await createReservation({
			date: data.date,
			startTime: data.startTime,
			endTime: data.endTime,
			name: data.name,
			email: data.email,
			phone: data.phone,
			guests: parseInt(data.guests),
		});

		return NextResponse.json(reservation);
	} catch (error) {
		console.error("Error creating reservation:", error instanceof Error ? error.message : String(error));
		return NextResponse.json({ error: "Failed to create reservation" }, { status: 500 });
	}
}

export async function GET() {
	try {
		const reservations = await getAllReservations();
		return NextResponse.json(reservations);
	} catch (error) {
		console.error("Error fetching reservations:", error instanceof Error ? error.message : String(error));
		return NextResponse.json({ error: "Failed to fetch reservations" }, { status: 500 });
	}
}
