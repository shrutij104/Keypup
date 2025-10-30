"use server"
import { auth } from "@/auth"


export const getUser = async () => {
	try {
		const session = await auth()
		if (session?.user) return session.user

		return null
	} catch (error) {
		throw new Error(`User Error`)
	}
}
