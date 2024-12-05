import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import UserLogin from "@/components/UserLogin";
import "./globals.css";
import { isAdmin } from "@/lib/services/reservationService";

export default async function Home() {
	const session = await getServerSession();

	if (!session) {
		return <UserLogin />;
	}
	const adminStatus = await isAdmin(session.user.email);
	// User is logged in
	if (adminStatus) {
		redirect("/admin/dashboard");
	} else {
		redirect("/dashboard");
	}
}
