import React from "react"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { SignupForm } from "@/components/client/signupForm"

const Page = async () => {
	const session = await auth()
	if (session?.user) redirect("/")

	return <SignupForm />
}

export default Page
