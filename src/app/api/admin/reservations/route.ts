import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { isAdmin, getAdminReservations, updateReservation } from "@/lib/services/reservationService";

export async function GET() {
	try {
		const session = await getServerSession();

		if (!session?.user?.email) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const adminStatus = await isAdmin(session.user.email);
		if (!adminStatus) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const reservations = await getAdminReservations();
		return NextResponse.json(reservations);
	} catch (error) {
		if (error instanceof Error) {
			console.error("Error fetching admin reservations:", error.message);
		} else {
			console.error("Error fetching admin reservations:", error);
		}
		return NextResponse.json({ error: "Failed to fetch reservations" }, { status: 500 });
	}
}

export async function PATCH(request: Request) {
	try {
		const session = await getServerSession();

		if (!session?.user?.email) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const adminStatus = await isAdmin(session.user.email);
		if (!adminStatus) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const data = await request.json();
		const { id, ...updateData } = data;

		if (!id) {
			return NextResponse.json({ error: "Reservation ID is required" }, { status: 400 });
		}

		const reservation = await updateReservation(parseInt(id), updateData);
		if (!reservation) {
			return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
		}

		return NextResponse.json(reservation);
	} catch (error) {
		if (error instanceof Error) {
			console.error("Error updating reservation:", error.message);
		} else {
			console.error("Error updating reservation:", error);
		}
		return NextResponse.json({ error: "Failed to update reservation" }, { status: 500 });
	}
}
