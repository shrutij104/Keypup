import React from "react"

function page() {
	return (
		<div>
			<h1 className="text-stone-500 dark:text-neutral-500 text-3xl text-center font-bold mt-16">
				Co-creators of Keypup
			</h1>
			<h2 className="text-stone-400 dark:text-neutral-600 text-2xl text-center  mt-12">
				Sarthak Joshi -{" "}
				<a
					className="hover:underline"
					href="https://github.com/Joshi-Sarthak"
					target="_blank"
				>
					Github
				</a>
			</h2>
			<h2 className="text-stone-400 dark:text-neutral-600 text-2xl text-center  mt-8">
				Atharva Bhore -{" "}
				<a
					className="hover:underline"
					href="https://github.com/AtharvaBhore"
					target="_blank"
				>
					Github
				</a>
			</h2>
		</div>
	)
}

export default page
