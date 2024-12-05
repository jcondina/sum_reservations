"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

interface FormData {
	date: string;
	startTime: string;
	endTime: string;
	name: string;
	email: string;
	phone: string;
	guests: number;
}

export default function ReservationForm() {
	const { data: session } = useSession();
	const [formData, setFormData] = useState<FormData>({
		date: "",
		startTime: "",
		endTime: "",
		name: "",
		email: session?.user?.email || "",
		phone: "",
		guests: 1,
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			const response = await fetch("/api/reservations", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to create reservation");
			}

			setFormData({
				date: "",
				startTime: "",
				endTime: "",
				name: "",
				email: session?.user?.email || "",
				phone: "",
				guests: 1,
			});

			alert("Reservation created successfully!");
		} catch (error) {
			console.error("Error creating reservation:", error);
			alert(error instanceof Error ? error.message : "Failed to create reservation");
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div>
				<label htmlFor="date" className="block text-sm font-medium">
					Date
				</label>
				<input
					type="date"
					id="date"
					value={formData.date}
					onChange={(e) => setFormData({ ...formData, date: e.target.value })}
					className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
					required
				/>
			</div>

			<div>
				<label htmlFor="startTime" className="block text-sm font-medium">
					Start Time
				</label>
				<input
					type="time"
					id="startTime"
					value={formData.startTime}
					onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
					className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
					required
				/>
			</div>

			<div>
				<label htmlFor="endTime" className="block text-sm font-medium">
					End Time
				</label>
				<input
					type="time"
					id="endTime"
					value={formData.endTime}
					onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
					className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
					required
				/>
			</div>

			<div>
				<label htmlFor="name" className="block text-sm font-medium">
					Name
				</label>
				<input
					type="text"
					id="name"
					value={formData.name}
					onChange={(e) => setFormData({ ...formData, name: e.target.value })}
					className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
					required
				/>
			</div>

			<div>
				<label htmlFor="email" className="block text-sm font-medium">
					Email
				</label>
				<input
					type="email"
					id="email"
					value={formData.email}
					onChange={(e) => setFormData({ ...formData, email: e.target.value })}
					className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
					required
				/>
			</div>

			<div>
				<label htmlFor="phone" className="block text-sm font-medium">
					Phone
				</label>
				<input
					type="tel"
					id="phone"
					value={formData.phone}
					onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
					className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
					required
				/>
			</div>

			<div>
				<label htmlFor="guests" className="block text-sm font-medium">
					Number of Guests
				</label>
				<input
					type="number"
					id="guests"
					min="1"
					value={formData.guests}
					onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
					className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
					required
				/>
			</div>

			<button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
				Create Reservation
			</button>
		</form>
	);
}
