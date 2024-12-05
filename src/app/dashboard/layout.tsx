import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
	const session = await getServerSession();

	console.log(session?.user);

	if (!session) {
		redirect("/");
	}

	return (
		<div>
			<nav className="bg-gray-800 text-white p-4">
				<div className="container mx-auto flex justify-between items-center">
					<Link href="/dashboard" className="text-xl font-bold">
						Dashboard
					</Link>
					<div className="flex items-center gap-4">
						<span>{session.user.email}</span>
						<SignOutButton />
					</div>
				</div>
			</nav>
			<main>{children}</main>
		</div>
	);
}
