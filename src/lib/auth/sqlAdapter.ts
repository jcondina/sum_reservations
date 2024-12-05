import { Adapter, AdapterUser } from "next-auth/adapters";
import pool from "../db";

export function SQLAdapter(): Adapter {
	return {
		async createUser(user) {
			const query = `
				INSERT INTO users (email, name, email_verified)
				VALUES ($1, $2, $3)
				RETURNING id, email, name, email_verified
			`;
			const result = await pool.query(query, [user.email, user.name, user.emailVerified]);
			return result.rows[0] as AdapterUser;
		},

		async getUser(id) {
			const query = "SELECT * FROM users WHERE id = $1";
			const result = await pool.query(query, [id]);
			return result.rows[0] || null;
		},

		async getUserByEmail(email) {
			const query = "SELECT * FROM users WHERE email = $1";
			const result = await pool.query(query, [email]);
			return result.rows[0] || null;
		},

		async getUserByAccount({ providerAccountId, provider }) {
			const query = `
				SELECT u.* 
				FROM users u
				JOIN accounts a ON u.id = a.user_id
				WHERE a.provider_id = $1 
				AND a.provider_account_id = $2
			`;
			const result = await pool.query(query, [provider, providerAccountId]);
			return result.rows[0] || null;
		},

		async updateUser(user) {
			const query = `
				UPDATE users 
				SET email = $1, name = $2, email_verified = $3
				WHERE id = $4
				RETURNING *
			`;
			const result = await pool.query(query, [user.email, user.name, user.emailVerified, user.id]);
			return result.rows[0];
		},

		async deleteUser(userId) {
			await pool.query("DELETE FROM users WHERE id = $1", [userId]);
		},

		async linkAccount(account) {
			const query = `
				INSERT INTO accounts (
					user_id,
					provider_id,
					provider_type,
					provider_account_id,
					access_token,
					refresh_token,
					expires_at
				)
				VALUES ($1, $2, $3, $4, $5, $6, $7)
				RETURNING *
			`;
			await pool.query(query, [
				account.userId,
				account.provider,
				account.type,
				account.providerAccountId,
				account.access_token,
				account.refresh_token,
				account.expires_at,
			]);
		},

		async unlinkAccount({ providerAccountId, provider }) {
			await pool.query("DELETE FROM accounts WHERE provider_id = $1 AND provider_account_id = $2", [
				provider,
				providerAccountId,
			]);
		},

		async createSession({ sessionToken, userId, expires }) {
			const query = `
				INSERT INTO sessions (user_id, expires, session_token)
				VALUES ($1, $2, $3)
				RETURNING *
			`;
			const result = await pool.query(query, [userId, expires, sessionToken]);
			return result.rows[0];
		},

		async getSessionAndUser(sessionToken) {
			const query = `
				SELECT s.*, u.* 
				FROM sessions s
				JOIN users u ON s.user_id = u.id
				WHERE s.session_token = $1
			`;
			const result = await pool.query(query, [sessionToken]);
			if (!result.rows[0]) return null;

			const { user_id, expires, session_token, ...user } = result.rows[0];
			return {
				session: { userId: user_id, expires, sessionToken: session_token },
				user,
			};
		},

		async updateSession({ sessionToken, expires }) {
			const query = `
				UPDATE sessions 
				SET expires = $2
				WHERE session_token = $1
				RETURNING *
			`;
			const result = await pool.query(query, [sessionToken, expires]);
			return result.rows[0];
		},

		async deleteSession(sessionToken) {
			await pool.query("DELETE FROM sessions WHERE session_token = $1", [sessionToken]);
		},
	};
}
