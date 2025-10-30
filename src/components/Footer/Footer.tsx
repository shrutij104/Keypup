"use client"

import React from "react"
import Link from "next/link"

function Footer() {
	return (
		<footer className="flex flex-col items-center justify-center bg-neutral-100 text-neutral-400 dark:bg-stone-800 transition-all duration-1000 py-4 px-6 w-full">
			<div className="flex flex-col md:flex-row items-center justify-between w-full max-w-7xl gap-4 md:gap-0">
				<Link href="/">
					<div className="font-normal text-xl text-stone-400 hover:text-stone-500 dark:text-neutral-600 hover:dark:text-neutral-500 transition-all duration-200">
						Keypup
					</div>
				</Link>

				{/* Links and Contact */}
				<div className="flex flex-wrap items-center justify-center md:justify-end text-sm gap-4 md:gap-6">
					<Link
						href="/about"
						className="font-light text-stone-400 hover:text-stone-500 dark:text-neutral-600 hover:dark:text-neutral-500 transition-all duration-200"
					>
						About Us
					</Link>
					<a
						href="mailto:keypup.service@gmail.com"
						className="font-light text-stone-400 hover:text-stone-500 dark:text-neutral-600 hover:dark:text-neutral-500 transition-all duration-200 text-center"
					>
						Contact - keypup.service@gmail.com
					</a>
				</div>
			</div>

			{/* Divider */}
			<hr className="w-full max-w-7xl border-stone-400 dark:border-neutral-700 my-3" />

			{/* Copyright */}
			<div className="font-light text-xs text-stone-400 dark:text-neutral-600 text-center">
				&copy; 2024 Keypup <span>™</span>. All Rights Reserved.
			</div>
		</footer>
	)
}

export default Footer
