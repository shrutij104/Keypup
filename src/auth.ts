export const runtime = "nodejs"
import NextAuth, { AuthError, CredentialsSignin } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { User } from "./models/userModel"
import { compare } from "bcryptjs"
import { connectToDatabase } from "./lib/utils"

export const { handlers, signIn, signOut, auth } = NextAuth({
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		}),
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: {
					label: "Email",
					type: "email",
				},
				password: {
					label: "Password",
					type: "password",
				},
			},
			authorize: async (credentials) => {
				const email = credentials.email as String | undefined
				const password = credentials.password as string | undefined

				if (!email || !password)
					throw new CredentialsSignin({
						cause: "Please provide both email and password",
					})

				await connectToDatabase()

				const user = await User.findOne({ email }).select("+password")

				if (!user) throw new CredentialsSignin({ cause: "Invalid Credentials" })

				if (!user.password)
					throw new CredentialsSignin({ cause: "Invalid Credentials" })

				const isMatch = await compare(password, user.password)

				if (!isMatch)
					throw new CredentialsSignin({ cause: "Invalid Credentials" })

				return { name: user.name, email: user.email, id: user._id }
			},
		}),
	],
	pages: {
		signIn: "/login",
	},
	callbacks: {
		signIn: async ({ user, account }) => {
			if (account?.provider === "google") {
				try {
					const { email, name, image, id } = user
					await connectToDatabase()

					const alreadyUser = await User.findOne({ email })

					if (!alreadyUser)
						await User.create({ email, name, image, googleId: id })

					return true
				} catch (error) {
					throw new AuthError("Error while creating user")
				}
			} else if (account?.provider === "credentials") return true
			return false
		},
	},
})
