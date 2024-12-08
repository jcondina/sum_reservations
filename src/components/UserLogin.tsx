"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UserLogin() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		try {
			const result = await signIn("credentials", {
				email,
				password,
				redirect: false,
			});

			if (result?.error) {
				setError("Invalid credentials");
				return;
			}

			// Refresh the page to trigger the server-side session check
			router.refresh();
		} catch (error) {
			console.error(error);
			setError("An error occurred during login");
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<div>
				<label htmlFor="email">Email</label>
				<input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
			</div>
			<div>
				<label htmlFor="password">Password</label>
				<input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
			</div>
			{error && <div className="error">{error}</div>}
			<button type="submit">Login</button>
		</form>
	);
}
