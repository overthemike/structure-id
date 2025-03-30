import { describe, test, expect, beforeEach } from "vitest"
import {
	generateStructureId,
	resetState,
	setStructureIdConfig,
	getStructureIdConfig,
} from "../src/index"

describe("Collision Handling", () => {
	beforeEach(() => {
		// Reset state before each test
		resetState()
		// Reset configuration to default
		setStructureIdConfig({ newIdOnCollision: false })
	})

	test("should generate same ID for identical structures when collision handling is disabled", () => {
		const obj1 = { name: "John", age: 30 }
		const obj2 = { name: "Jane", age: 25 }

		const config = {
			newIdOnCollision: false,
		}

		const id1 = generateStructureId(obj1, config)
		const id2 = generateStructureId(obj2, config) // Same structure

		expect(id1).toBe(id2)
	})

	test("should generate different IDs for identical structures when collision handling is enabled", () => {
		const obj1 = { name: "John", age: 30 }
		const obj2 = { name: "Jane", age: 25 }

		const config = {
			newIdOnCollision: true,
		}

		const id1 = generateStructureId(obj1, config)
		const id2 = generateStructureId(obj2, config) // Same structure

		expect(id1).not.toBe(id2)

		// Verify that only the L0 part is different
		const l0Value1 = id1.split("-")[0].split(":")[1]
		const l0Value2 = id2.split("-")[0].split(":")[1]

		// First occurrence should be 0, second should be 1
		expect(l0Value1).toBe("0")
		expect(l0Value2).toBe("1")

		// All other parts should be the same
		const id1Parts = id1.split("-")
		const id2Parts = id2.split("-")

		expect(id1Parts.length).toBe(id2Parts.length)

		for (let i = 1; i < id1Parts.length; i++) {
			expect(id1Parts[i]).toBe(id2Parts[i])
		}
	})

	test("should support multiple collisions with incrementing L0 values", () => {
		const config = {
			newIdOnCollision: true,
		}

		// Generate multiple objects with the same structure
		const obj1 = { value: 1 }
		const obj2 = { value: 2 }
		const obj3 = { value: 3 }
		const obj4 = { value: 4 }
		const obj5 = { value: 5 }

		const id1 = generateStructureId(obj1, config)
		const id2 = generateStructureId(obj2, config)
		const id3 = generateStructureId(obj3, config)
		const id4 = generateStructureId(obj4, config)
		const id5 = generateStructureId(obj5, config)

		// All IDs should be different
		const uniqueIds = new Set([id1, id2, id3, id4, id5])
		expect(uniqueIds.size).toBe(5)

		// Extract the L0 values
		const l0Values = [id1, id2, id3, id4, id5].map((id) => {
			const l0Part = id.split("-")[0]
			const hash = l0Part.split(":")[1]
			return Number(hash)
		})

		// The L0 values should be sequential starting from 0
		expect(l0Values[0]).toBe(0)
		expect(l0Values[1]).toBe(1)
		expect(l0Values[2]).toBe(2)
		expect(l0Values[3]).toBe(3)
		expect(l0Values[4]).toBe(4)

		// Verify that the rest of the ID structure is the same
		const baseIdParts = id1.split("-").slice(1).join("-")
		for (let i = 1; i < 5; i++) {
			const idParts = [id2, id3, id4, id5][i - 1].split("-").slice(1).join("-")
			expect(idParts).toBe(baseIdParts)
		}
	})

	test("should generate consistent IDs with collision handling for complex objects", () => {
		const config = {
			newIdOnCollision: true,
		}

		// Complex object with nested structure
		const complex1 = {
			user: {
				name: "User 1",
				settings: {
					theme: "dark",
					notifications: true,
				},
			},
			items: [1, 2, 3],
		}

		const complex2 = {
			user: {
				name: "User 2",
				settings: {
					theme: "light",
					notifications: false,
				},
			},
			items: [4, 5, 6],
		}

		const id1 = generateStructureId(complex1, config)
		const id2 = generateStructureId(complex2, config)

		expect(id1).not.toBe(id2)

		// Extract the L0 values
		const l0Value1 = id1.split("-")[0].split(":")[1]
		const l0Value2 = id2.split("-")[0].split(":")[1]

		// First occurrence should be 0, second should be 1
		expect(l0Value1).toBe("0")
		expect(l0Value2).toBe("1")

		// Verify that the rest of the ID structure is the same
		const id1Parts = id1.split("-")
		const id2Parts = id2.split("-")

		expect(id1Parts.length).toBe(id2Parts.length)

		for (let i = 1; i < id1Parts.length; i++) {
			expect(id1Parts[i]).toBe(id2Parts[i])
		}
	})

	test("should reset collision tracking when resetState is called", () => {
		const config = {
			newIdOnCollision: true,
		}

		// First sequence - generate two objects with same structure
		const objA1 = { test: true }
		const objA2 = { test: false }

		const idA1 = generateStructureId(objA1, config)
		const idA2 = generateStructureId(objA2, config)

		// Verify first sequence has L0 values 0 and 1
		expect(idA1.split("-")[0].split(":")[1]).toBe("0")
		expect(idA2.split("-")[0].split(":")[1]).toBe("1")

		// Reset the state
		resetState()

		// Second sequence - generate two MORE objects with same structure
		const objB1 = { test: "first" }
		const objB2 = { test: "second" }

		const idB1 = generateStructureId(objB1, config)
		const idB2 = generateStructureId(objB2, config)

		// After reset, counter should start from 0 again
		expect(idB1.split("-")[0].split(":")[1]).toBe("0")
		expect(idB2.split("-")[0].split(":")[1]).toBe("1")
	})

	describe("Global Configuration", () => {
		beforeEach(() => {
			// Reset state before each test
			resetState()
			// Reset configuration to default
			setStructureIdConfig({ newIdOnCollision: false })
		})

		test("should use global configuration when no config is passed", () => {
			// Setup global config
			setStructureIdConfig({
				newIdOnCollision: true,
			})

			// Generate IDs for structurally identical objects
			const obj1 = { test: true }
			const obj2 = { test: false }

			const id1 = generateStructureId(obj1) // No config passed
			const id2 = generateStructureId(obj2) // No config passed

			// Should use global config with collision handling
			expect(id1).not.toBe(id2)

			// Verify L0 values
			const l0Value1 = id1.split("-")[0].split(":")[1]
			const l0Value2 = id2.split("-")[0].split(":")[1]
			expect(l0Value1).toBe("0")
			expect(l0Value2).toBe("1")
		})

		test("should use passed config instead of global config when provided", () => {
			// Setup global config with collision handling disabled
			setStructureIdConfig({
				newIdOnCollision: false,
			})

			// Generate IDs for structurally identical objects
			const obj1 = { test: true }
			const obj2 = { test: false }

			// First with global config (collision handling disabled)
			const id1 = generateStructureId(obj1)
			const id2 = generateStructureId(obj2)

			// IDs should be the same
			expect(id1).toBe(id2)

			// Now override with local config (collision handling enabled)
			const id3 = generateStructureId(obj1, { newIdOnCollision: true })
			const id4 = generateStructureId(obj2, { newIdOnCollision: true })

			// These IDs should be different
			expect(id3).not.toBe(id4)
		})

		test("should allow retrieving the current global config", () => {
			// Default config after reset
			const defaultConfig = getStructureIdConfig()
			expect(defaultConfig.newIdOnCollision).toBe(false)

			// Set a new global config
			setStructureIdConfig({
				newIdOnCollision: true,
			})

			// Get the updated config
			const updatedConfig = getStructureIdConfig()
			expect(updatedConfig.newIdOnCollision).toBe(true)
		})

		test("should NOT reset the global config when resetState is called", () => {
			// Set a global config
			setStructureIdConfig({
				newIdOnCollision: true,
			})

			// Verify config is set
			expect(getStructureIdConfig().newIdOnCollision).toBe(true)

			// Reset state
			resetState()

			// Verify config is NOT reset (still true)
			expect(getStructureIdConfig().newIdOnCollision).toBe(true)
		})

		test("should be able to reset configuration by calling setStructureIdConfig", () => {
			// Set a global config
			setStructureIdConfig({
				newIdOnCollision: true,
			})

			// Verify config is set
			expect(getStructureIdConfig().newIdOnCollision).toBe(true)

			// Reset config by calling setStructureIdConfig
			setStructureIdConfig({ newIdOnCollision: false })

			// Verify config is reset to default
			expect(getStructureIdConfig().newIdOnCollision).toBe(false)
		})

		test("should isolate the returned config object", () => {
			// Set initial config
			setStructureIdConfig({
				newIdOnCollision: false,
			})

			// Get config and modify the returned object
			const config = getStructureIdConfig()
			config.newIdOnCollision = true

			// Global config should remain unchanged
			expect(getStructureIdConfig().newIdOnCollision).toBe(false)
		})
	})
})
