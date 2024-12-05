"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import moment from "moment";

interface Reservation {
	id: number;
	date: string;
	startTime: string;
	endTime: string;
	name: string;
	email: string;
	phone: string;
	guests: number;
	status: string;
	user: {
		email: string;
	};
}

export default function AdminDashboard() {
	const [searchTerm, setSearchTerm] = useState("");

	const { data: reservations = [], isLoading } = useQuery<Reservation[]>({
		queryKey: ["adminReservations"],
		queryFn: async () => {
			const response = await fetch("/api/admin/reservations");
			return response.json();
		},
	});

	if (isLoading) {
		return <div>Loading...</div>;
	}

	const filteredReservations = reservations.filter(
		(res) =>
			res.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			res.user.email.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const handleDelete = async (id: number) => {
		await fetch(`/api/reservations/${id}`, {
			method: "DELETE",
		});
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Reservations</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="mb-4">
					<Input
						placeholder="Search reservations..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>

				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Start Time</TableHead>
							<TableHead>End Time</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredReservations.map((reservation) => (
							<TableRow key={reservation.id}>
								<TableCell>{reservation.name}</TableCell>
								<TableCell>{reservation.user.email}</TableCell>
								<TableCell>{moment(reservation.startTime).format("MMMM Do YYYY, h:mm a")}</TableCell>
								<TableCell>{moment(reservation.endTime).format("MMMM Do YYYY, h:mm a")}</TableCell>
								<TableCell>{reservation.status}</TableCell>
								<TableCell>
									<AlertDialog>
										<AlertDialogTrigger asChild>
											<Button variant="destructive" size="sm">
												Delete
											</Button>
										</AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>Are you sure?</AlertDialogTitle>
												<AlertDialogDescription>
													This action cannot be undone. This will permanently delete the reservation.
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel>Cancel</AlertDialogCancel>
												<AlertDialogAction onClick={() => handleDelete(reservation.id)}>Delete</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
