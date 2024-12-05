import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/AdminDashboard";
import { isAdmin } from "@/lib/services/reservationService";

export default async function AdminDashboardPage() {
	const session = await getServerSession();

	if (!session) {
		redirect("/");
	}

	const adminStatus = await isAdmin(session.user.email);
	if (!adminStatus) {
		redirect("/dashboard");
	}

	return <AdminDashboard />;
}
