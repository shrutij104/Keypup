import { findUser } from "@/actions/findUser"
import { auth } from "@/auth"
import Room from "@/components/Room/Room"
import { redirect } from "next/navigation"
import React from "react"

const Page = async () => {
	const session = await auth()
	if (!session?.user) redirect("/login")

	const email = session.user.email ?? ""
	const { name } = await findUser(email as string)

	return <Room name={name} email={email} />
}

export default Page
