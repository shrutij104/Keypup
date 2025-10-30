import React from "react"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { LoginForm } from "@/components/client/loginForm"

const Page = async () => {
	const session = await auth()
	if (session?.user) redirect("/")

	return <LoginForm />
}

export default Page
