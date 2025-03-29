import { describe, test, expect } from "vitest"
import { generateStructureId } from "../src/index"

describe("Nested Objects", () => {
	test("should generate the same ID for nested objects with identical structure", () => {
		const obj1 = {
			user: {
				name: "John",
				age: 30,
				preferences: {
					theme: "dark",
					notifications: true,
				},
			},
		}

		const obj2 = {
			user: {
				name: "Jane",
				age: 25,
				preferences: {
					theme: "light",
					notifications: false,
				},
			},
		}

		const id1 = generateStructureId(obj1)
		const id2 = generateStructureId(obj2)

		expect(id1).toBe(id2)
	})

	test("should generate different IDs for nested objects with different structures", () => {
		const obj1 = {
			user: {
				name: "John",
				age: 30,
				preferences: {
					theme: "dark",
					notifications: true,
				},
			},
		}

		const obj2 = {
			user: {
				name: "Jane",
				age: 25,
				preferences: {
					theme: "light",
					fontSize: 14, // different property
				},
			},
		}

		const id1 = generateStructureId(obj1)
		const id2 = generateStructureId(obj2)

		expect(id1).not.toBe(id2)
	})

	test("should handle deeply nested objects", () => {
		const obj1 = {
			level1: {
				level2: {
					level3: {
						level4: {
							level5: {
								value: "deep",
							},
						},
					},
				},
			},
		}

		const obj2 = {
			level1: {
				level2: {
					level3: {
						level4: {
							level5: {
								value: "also deep",
							},
						},
					},
				},
			},
		}

		const id1 = generateStructureId(obj1)
		const id2 = generateStructureId(obj2)

		expect(id1).toBe(id2)
		expect(id1.split("-").length).toBeGreaterThan(5) // Should have multiple level indicators
	})
})
