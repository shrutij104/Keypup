"use client"

import React from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import Logo from "../../public/logo_purple.svg"

function loading() {
	return (
		<div className="flex flex-col justify-center items-center h-[70vh]">
			<motion.div
				initial={{ rotate: "0deg" }}
				animate={{ rotate: "360deg" }}
				transition={{ duration: 2, repeat: Infinity }}
			>
				<Image src={Logo} alt="Logo" width={75} height={75} />
			</motion.div>
		</div>
	)
}

export default loading
