import { describe, test, expect } from "vitest"
import { generateStructureId } from "../src/index"

describe("Circular References", () => {
	test("should handle simple circular references", () => {
		const obj1: any = { name: "circular" }
		obj1.self = obj1

		const obj2: any = { name: "also circular" }
		obj2.self = obj2

		const id1 = generateStructureId(obj1)
		const id2 = generateStructureId(obj2)

		expect(id1).toBe(id2)
		expect(id1.length).toBeGreaterThan(0)
	})

	test("should handle complex circular references", () => {
		const obj1: any = { name: "complex" }
		const child1: any = { parent: obj1 }
		obj1.child = child1

		const obj2: any = { name: "also complex" }
		const child2: any = { parent: obj2 }
		obj2.child = child2

		const id1 = generateStructureId(obj1)
		const id2 = generateStructureId(obj2)

		expect(id1).toBe(id2)
		expect(id1.length).toBeGreaterThan(0)
	})

	test("should handle multi-level circular references", () => {
		// Create a three-object cycle
		const obj1: any = { name: "node1" }
		const obj2: any = { name: "node2" }
		const obj3: any = { name: "node3" }

		obj1.next = obj2
		obj2.next = obj3
		obj3.next = obj1 // Completes the cycle

		const result = generateStructureId(obj1)

		// Should produce a valid ID without stack overflow
		expect(result.length).toBeGreaterThan(0)
	})
})
