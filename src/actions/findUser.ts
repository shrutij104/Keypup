export const runtime = "nodejs"

import { connectToDatabase } from "@/lib/utils"
import { User } from "@/models/userModel"

export const findUser = async (email: string) => {
	try {
		await connectToDatabase()
		const user = await User.findOne({ email })
		
		return user
	} catch (e) {
		console.log(e)
		return null
	}
}
