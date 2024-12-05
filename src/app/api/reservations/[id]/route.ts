import { NextResponse } from "next/server";
import { getReservation, updateReservation, deleteReservation } from "@/lib/services/reservationService";

export async function GET(request: Request, { params }: { params: { id: string } }) {
	try {
		const reservation = await getReservation(parseInt(params.id));
		if (!reservation) {
			return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
		}
		return NextResponse.json(reservation);
	} catch (error: any) {
		console.error("Error fetching reservation:", error.message);
		return NextResponse.json({ error: "Failed to fetch reservation" }, { status: 500 });
	}
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
	try {
		const data = await request.json();
		const reservation = await updateReservation(parseInt(params.id), data);
		if (!reservation) {
			return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
		}
		return NextResponse.json(reservation);
	} catch (error: any) {
		console.error("Error updating reservation:", error.message);
		return NextResponse.json({ error: "Failed to update reservation" }, { status: 500 });
	}
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
	try {
		await deleteReservation(parseInt(params.id));
		return NextResponse.json({ message: "Reservation deleted successfully" });
	} catch (error: any) {
		console.error("Error deleting reservation:", error.message);
		return NextResponse.json({ error: "Failed to delete reservation" }, { status: 500 });
	}
}
