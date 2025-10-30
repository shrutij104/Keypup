import { NextFetchEvent, NextRequest, NextResponse } from "next/server"

// If you don't originally have a middleware in your project, keep this:
export async function middleware(req: NextRequest, event: NextFetchEvent) {
	return NextResponse.next()
}

export const config = {
	unstable_allowDynamic: [
		"./node_modules/mongoose/dist/browser.umd.js",
		"./src/lib/utils.ts",
		"./src/auth.ts",
		"./src/middleware.ts",
	],
}
