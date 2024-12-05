import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { isAdmin } from "@/lib/services/reservationService";
import { Button } from "@/components/ui/button";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
	const session = await getServerSession();

	if (!session) {
		redirect("/");
	} else {
		const adminStatus = await isAdmin(session.user.email);
		if (!adminStatus) {
			redirect("/");
		}
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<nav className="border-b bg-white">
				<div className="container mx-auto px-4 py-3 flex justify-between items-center">
					<Link href="/admin/dashboard" className="text-xl font-bold">
						Admin Dashboard
					</Link>
					<div className="flex items-center gap-4">
						<span className="text-sm text-gray-600">{session.user.email}</span>
						<SignOutButton />
					</div>
				</div>
			</nav>
			<main className="container mx-auto px-4 py-8">{children}</main>
		</div>
	);
}
