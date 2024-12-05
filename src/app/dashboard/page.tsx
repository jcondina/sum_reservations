import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Calendar from "@/components/Calendar";
import ReservationForm from "@/components/ReservationForm";

export default async function DashboardPage() {
	const session = await getServerSession();

	if (!session) {
		redirect("/");
	}

	// If user is admin, redirect to admin dashboard
	if (session.user.isAdmin) {
		redirect("/admin/dashboard");
	}

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4">Reservations Dashboard</h1>

			<div className="mb-8">
				<h2 className="text-xl font-bold mb-4">Calendar</h2>
				<Calendar />
			</div>

			<div className="mb-8">
				<h2 className="text-xl font-bold mb-4">Make a Reservation</h2>
				<ReservationForm />
			</div>
		</div>
	);
}
