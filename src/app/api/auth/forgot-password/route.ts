export const runtime = "nodejs";
import {connectToDatabase} from "@/lib/utils"
import {User} from "@/models/userModel"
import {hash} from "bcryptjs"
import {NextRequest, NextResponse} from "next/server"

export async function POST(req: NextRequest) {
	const {email, password} = await req.json()

	try {
		await connectToDatabase()
		const hashedPassword = await hash(password, 10)

		const updateData: {password: string} = {
			password: hashedPassword,
		}
		

		const updatedUser = await User.findOneAndUpdate({email}, updateData, {
			new: true,
		})

		if (!updatedUser) {
			return NextResponse.json({error: "User not found"}, {status: 404})
		}

		await updatedUser.save()

		return NextResponse.json({success: true})
	} catch (error) {
		console.error("Error changing password:", error)
		return NextResponse.json({error: "Failed to change password"}, {status: 500})
	}
}
