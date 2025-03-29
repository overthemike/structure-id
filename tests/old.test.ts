import { describe, test, expect } from "vitest"
import { generateStructureId } from "../src/index"

describe("Basic Structure IDs", () => {
	test("should generate the same ID for objects with identical structure", () => {
		const obj1 = { count: 0, name: "test" }
		const obj2 = { count: 42, name: "different" }

		const id1 = generateStructureId(obj1)
		const id2 = generateStructureId(obj2)

		expect(id1).toBe(id2)
	})

	test("should generate different IDs for objects with different structures", () => {
		const obj1 = { count: 0, name: "test" }
		const obj2 = { count: 0, title: "test" } // different property name

		const id1 = generateStructureId(obj1)
		const id2 = generateStructureId(obj2)

		expect(id1).not.toBe(id2)
	})

	test("should generate the same IDs for objects with the same properties but in a different order", () => {
		const obj1 = { count: 0, name: "test" }
		const obj2 = { name: "test", count: 0 }

		const id1 = generateStructureId(obj1)
		const id2 = generateStructureId(obj2)

		expect(id1).toBe(id2)
	})

	test("should generate different IDs for objects with different property types", () => {
		const obj1 = { count: 0, name: "test" }
		const obj2 = { count: "0", name: "test" } // count is string instead of number

		const id1 = generateStructureId(obj1)
		const id2 = generateStructureId(obj2)

		expect(id1).not.toBe(id2)
	})

	test("should maintain consistent IDs across multiple calls", () => {
		const obj = { count: 0, name: "test" }

		const id1 = generateStructureId(obj)
		const id2 = generateStructureId(obj)
		const id3 = generateStructureId(obj)

		expect(id1).toBe(id2)
		expect(id2).toBe(id3)
	})
})
