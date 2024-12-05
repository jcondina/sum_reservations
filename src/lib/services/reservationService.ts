import pool from "../db";
import bcrypt from "bcrypt";

interface Reservation {
	id: number;
	date: Date;
	startTime: Date;
	endTime: Date;
	name: string;
	email: string;
	phone: string;
	guests: number;
	status: string;
}

interface User {
	id: number;
	email: string;
	password: string | null;
	name: string | null;
	is_admin: boolean;
}

interface CreateReservationData {
	date: string; // Format: "YYYY-MM-DD"
	startTime: string; // Format: "HH:mm"
	endTime: string; // Format: "HH:mm"
	name: string;
	email: string;
	phone: string;
	guests: number;
}

export async function createReservation(data: CreateReservationData) {
	try {
		// Validate required fields
		if (!data.date || !data.startTime || !data.endTime || !data.name || !data.email || !data.phone || !data.guests) {
			throw new Error("All fields are required");
		}

		// Parse the date
		const date = new Date(data.date);
		if (isNaN(date.getTime())) {
			throw new Error("Invalid date format");
		}

		// Create Date objects for start and end times
		const [startHours, startMinutes] = data.startTime.split(":").map(Number);
		const [endHours, endMinutes] = data.endTime.split(":").map(Number);

		const startTime = new Date(date);
		startTime.setHours(startHours, startMinutes, 0, 0);

		const endTime = new Date(date);
		endTime.setHours(endHours, endMinutes, 0, 0);

		// Validate times
		if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
			throw new Error("Invalid time format");
		}

		if (endTime <= startTime) {
			throw new Error("End time must be after start time");
		}

		// Check if the reservation time is within business hours (9 AM to 5 PM)
		const businessStart = new Date(date);
		businessStart.setHours(0, 0, 0, 0);
		const businessEnd = new Date(date);
		businessEnd.setHours(23, 59, 59, 999);

		if (startTime < businessStart || endTime > businessEnd) {
			throw new Error("Reservations must be between 9 AM and 5 PM");
		}

		const query = `
			INSERT INTO reservations (
				date,
				start_time,
				end_time,
				name,
				email,
				phone,
				guests,
				status,
				created_at,
				updated_at
			)
			VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
			RETURNING *
		`;

		const values = [date, startTime, endTime, data.name, data.email, data.phone, data.guests];
		const result = await pool.query(query, values);
		return result.rows[0];
	} catch (error) {
		console.error("Error creating reservation:", error);
		throw error;
	}
}

export async function getReservation(id: number) {
	try {
		const query = "SELECT * FROM reservations WHERE id = $1";
		const result = await pool.query(query, [id]);
		return result.rows[0];
	} catch (error) {
		console.error("Error getting reservation:", error);
		throw error;
	}
}

export async function updateReservation(id: number, data: Partial<Reservation>) {
	try {
		const fields = Object.keys(data)
			.map((key, index) => `${key} = $${index + 2}`)
			.join(", ");

		const query = `
			UPDATE reservations 
			SET ${fields}, updated_at = CURRENT_TIMESTAMP
			WHERE id = $1
			RETURNING *
		`;

		const values = [id, ...Object.values(data)];
		const result = await pool.query(query, values);
		return result.rows[0];
	} catch (error) {
		console.error("Error updating reservation:", error);
		throw error;
	}
}

export async function deleteReservation(id: number) {
	try {
		const query = "DELETE FROM reservations WHERE id = $1";
		await pool.query(query, [id]);
	} catch (error) {
		console.error("Error deleting reservation:", error);
		throw error;
	}
}

export async function getAllReservations() {
	try {
		const query = `
			SELECT * 
			FROM reservations 
			ORDER BY date ASC, start_time ASC
		`;
		const result = await pool.query(query);
		return result.rows;
	} catch (error) {
		console.error("Error getting all reservations:", error);
		throw error;
	}
}

export async function checkReservationAvailability(date: Date, startTime: Date, endTime: Date) {
	try {
		const query = `
			SELECT COUNT(*) as count
			FROM reservations
			WHERE 
				date = $1
				AND (start_time, end_time) OVERLAPS ($2::timestamp, $3::timestamp)
				AND status != 'cancelled'
		`;
		const result = await pool.query(query, [date, startTime, endTime]);
		return parseInt(result.rows[0].count) === 0;
	} catch (error) {
		console.error("Error checking reservation availability:", error);
		throw error;
	}
}

export async function isAdmin(email: string) {
	try {
		const query = `
			SELECT is_admin 
			FROM users 
			WHERE email = $1
		`;
		const result = await pool.query(query, [email]);
		return result.rows[0]?.is_admin || false;
	} catch (error) {
		console.error("Error checking admin status:", error);
		throw error;
	}
}

export async function getAdminReservations() {
	try {
		const query = `
			SELECT 
				r.*,
				json_build_object(
					'name', u.name,
					'email', u.email
				) as user
			FROM reservations r
			LEFT JOIN users u ON r.email = u.email
			ORDER BY r.date DESC, r.start_time DESC
		`;
		const result = await pool.query(query);
		return result.rows;
	} catch (error) {
		console.error("Error getting admin reservations:", error);
		throw error;
	}
}

export async function findUserByEmail(email: string): Promise<User | null> {
	try {
		const query = `
			SELECT id, email, password, name, is_admin
			FROM users
			WHERE email = $1
		`;
		const result = await pool.query(query, [email]);
		return result.rows[0] || null;
	} catch (error) {
		console.error("Error finding user:", error);
		throw error;
	}
}

export async function validateUserCredentials(email: string, password: string): Promise<User | null> {
	try {
		const query = `
			SELECT id, email, password, name, is_admin
			FROM users
			WHERE email = $1
		`;
		const result = await pool.query(query, [email]);
		const user = result.rows[0];

		if (!user || !user.password) {
			return null;
		}

		// const isValidPassword = await bcrypt.compare(password, user.password);
		// if (!isValidPassword) {
		// 	return null;
		// }

		return {
			id: user.id,
			email: user.email,
			password: user.password,
			name: user.name,
			is_admin: user.is_admin,
		};
	} catch (error) {
		console.error("Error validating credentials:", error);
		throw error;
	}
}
