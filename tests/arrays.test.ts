import { describe, test, expect } from "vitest"
import { generateStructureId } from "../src/index"

describe("Arrays", () => {
	test("should generate the same ID for arrays with the same structure", () => {
		const obj1 = { items: [1, 2, 3] }
		const obj2 = { items: [4, 5, 6] }

		const id1 = generateStructureId(obj1)
		const id2 = generateStructureId(obj2)

		expect(id1).toBe(id2)
	})

	test("should generate different IDs for arrays with different lengths", () => {
		const obj1 = { items: [1, 2, 3] }
		const obj2 = { items: [1, 2, 3, 4] }

		const id1 = generateStructureId(obj1)
		const id2 = generateStructureId(obj2)

		expect(id1).not.toBe(id2)
	})

	test("should generate different IDs for arrays with different element types", () => {
		const obj1 = { items: [1, 2, 3] }
		const obj2 = { items: [1, "2", 3] } // second element is a string

		const id1 = generateStructureId(obj1)
		const id2 = generateStructureId(obj2)

		expect(id1).not.toBe(id2)
	})

	test("should handle arrays of objects correctly", () => {
		const obj1 = {
			users: [
				{ name: "John", age: 30 },
				{ name: "Jane", age: 25 },
			],
		}

		const obj2 = {
			users: [
				{ name: "Alice", age: 35 },
				{ name: "Bob", age: 40 },
			],
		}

		const id1 = generateStructureId(obj1)
		const id2 = generateStructureId(obj2)

		expect(id1).toBe(id2)

		// Different structure in array elements
		const obj3 = {
			users: [
				{ name: "John", role: "admin" }, // different property
				{ name: "Jane", age: 25 },
			],
		}

		const id3 = generateStructureId(obj3)
		expect(id1).not.toBe(id3)
	})

	test("should handle mixed arrays", () => {
		const obj1 = { mixed: [1, "string", true, { a: 1 }] }
		const obj2 = { mixed: [2, "text", false, { a: 42 }] }

		const id1 = generateStructureId(obj1)
		const id2 = generateStructureId(obj2)

		expect(id1).toBe(id2)
	})
})
