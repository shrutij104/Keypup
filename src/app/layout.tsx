import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"
import Navbar from "@/components/Navbar/Navbar"
import Footer from "@/components/Footer/Footer"
import { Providers } from "./providers"

const ubuntu = localFont({
	src: [
		{
			path: "../../public/fonts/Ubuntu-Regular.ttf",
			weight: "400",
			style: "normal",
		},
		{
			path: "../../public/fonts/Ubuntu-Italic.ttf",
			weight: "400",
			style: "italic",
		},
		{
			path: "../../public/fonts/Ubuntu-Bold.ttf",
			weight: "700",
			style: "normal",
		},
		{
			path: "../../public/fonts/Ubuntu-Medium.ttf",
			weight: "500",
			style: "normal",
		},
		{
			path: "../../public/fonts/Ubuntu-Light.ttf",
			weight: "300",
			style: "normal",
		},
	],
})

export const metadata: Metadata = {
	title: "KeypUp",
	description: "Multiplayer typing website",
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${ubuntu.className} bg-neutral-100 dark:bg-stone-800 flex flex-col min-h-screen`}
			>
				<Providers>
					<div className="flex flex-col min-h-screen">
						<Navbar />
						<main className="flex-grow">{children}</main>
						<Footer />
					</div>
				</Providers>
			</body>
		</html>
	)
}
