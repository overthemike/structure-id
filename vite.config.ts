import { defineConfig } from "vite"

export default defineConfig({
	test: {
		benchmark: {
			include: ["./bench/**"], // Adjust if needed
			reporters: ["verbose"],
		},
	},
})
