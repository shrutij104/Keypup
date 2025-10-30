import { findUser } from "@/actions/findUser"
import { auth } from "@/auth"
import ClientPage from "@/components/ClientPage/ClientPage"
import React from "react"
import { redirect } from "next/navigation"

export default async function Page({ params }: { params: { id: string } }) {
	const session = await auth()
	if (!session?.user) redirect("/login")

	const email = session.user.email ?? ""
	const { name } = await findUser(email as string)
	const id = params.id

	return <ClientPage id={id} name={name} email={email} />
}
