import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { validateUserCredentials } from "@/lib/services/reservationService";
import { SQLAdapter } from "@/lib/auth/sqlAdapter";

const handler = NextAuth({
	adapter: SQLAdapter(),
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					return null;
				}

				const user = await validateUserCredentials(credentials.email, credentials.password);

				if (!user) {
					console.log("User not found");
					return null;
				}

				return {
					id: user.id.toString(),
					email: user.email,
					name: user.name,
					image: null,
					isAdmin: user.is_admin,
				};
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				token.email = user.email;
				token.name = user.name;
				token.image = user.image;
				token.isAdmin = user.isAdmin;
			}
			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id;
				session.user.email = token.email;
				session.user.name = token.name;
				session.user.image = token.image;
				session.user.isAdmin = token.isAdmin;
			}
			return session;
		},
	},
	session: {
		strategy: "jwt",
		maxAge: 24 * 60 * 60, // 24 hours
	},
	pages: {
		signIn: "/login",
	},
});

export { handler as GET, handler as POST };
