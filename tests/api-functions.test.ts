import { describe, test, expect, beforeEach } from "vitest"
import { generateStructureId, getStructureInfo, resetState } from "../src/index"

describe("API Functions", () => {
	describe("getStructureInfo", () => {
		test("should return correct id and level count for simple object", () => {
			const obj = { count: 0, name: "test" }
			const info = getStructureInfo(obj)

			// ID should match what generateStructureId returns
			expect(info.id).toBe(generateStructureId(obj))

			// Simple object should have at least 1 level
			expect(info.levels).toBeGreaterThan(0)
		})

		test("should return correct level count for nested objects", () => {
			const shallow = { a: 1, b: 2 }
			const medium = { a: 1, b: { c: 2, d: 3 } }
			const deep = {
				level1: {
					level2: {
						level3: {
							level4: {
								level5: { value: "deep" },
							},
						},
					},
				},
			}

			const shallowInfo = getStructureInfo(shallow)
			const mediumInfo = getStructureInfo(medium)
			const deepInfo = getStructureInfo(deep)

			// Deeper objects should have more levels
			expect(deepInfo.levels).toBeGreaterThan(mediumInfo.levels)
			expect(mediumInfo.levels).toBeGreaterThan(shallowInfo.levels)

			// Verify level count matches ID format (L0:xxx-L1:xxx-...)
			expect(shallowInfo.levels).toBe(shallowInfo.id.split("-").length)
			expect(mediumInfo.levels).toBe(mediumInfo.id.split("-").length)
			expect(deepInfo.levels).toBe(deepInfo.id.split("-").length)
		})

		test("should handle arrays properly", () => {
			const withArray = { items: [1, 2, 3] }
			const withNestedArray = {
				items: [
					[1, 2],
					[3, 4],
				],
			}

			const arrayInfo = getStructureInfo(withArray)
			const nestedArrayInfo = getStructureInfo(withNestedArray)

			// Both should have valid IDs and level counts
			expect(arrayInfo.id).toBeTruthy()
			expect(arrayInfo.levels).toBeGreaterThan(1)

			expect(nestedArrayInfo.id).toBeTruthy()
			expect(nestedArrayInfo.levels).toBeGreaterThan(arrayInfo.levels)
		})

		test("should handle circular references", () => {
			const circular: Record<string, unknown> = { name: "circular" }
			circular.self = circular

			const info = getStructureInfo(circular)

			// Should produce a valid result without errors
			expect(info.id).toBeTruthy()
			expect(info.levels).toBeGreaterThan(0)
		})
	})

	describe("resetState", () => {
		// Save original IDs before reset to compare
		let originalId1: string
		let originalId2: string

		beforeEach(() => {
			const obj1 = { a: 1, b: "test" }
			const obj2 = { complex: { nested: { value: 42 } } }

			// Generate IDs before reset
			originalId1 = generateStructureId(obj1)
			originalId2 = generateStructureId(obj2)

			// Reset the state
			resetState()
		})

		test("should change generated IDs after reset", () => {
			const obj1 = { a: 1, b: "test" }
			const obj2 = { complex: { nested: { value: 42 } } }

			// Generate new IDs after reset
			const newId1 = generateStructureId(obj1)
			const newId2 = generateStructureId(obj2)

			// IDs should be different after reset
			expect(newId1).not.toBe(originalId1)
			expect(newId2).not.toBe(originalId2)
		})

		test("should maintain consistency after reset", () => {
			const obj1 = { a: 1, b: "test" }
			const obj2 = { a: 2, b: "different" }

			// Generate IDs after reset
			const id1 = generateStructureId(obj1)
			const id2 = generateStructureId(obj2)

			// Structurally identical objects should still get the same ID
			expect(id1).toBe(id2)
		})

		test("should reset to a predictable state", () => {
			// After reset, first generated ID should be consistent
			// because it starts from the same initial state
			const simpleObj = { simple: true }
			const firstId = generateStructureId(simpleObj)

			// Reset again
			resetState()

			// Generate ID for the same object again
			const idAfterSecondReset = generateStructureId(simpleObj)

			// Should be the same as before because we've reset to the same initial state
			expect(idAfterSecondReset).toBe(firstId)
		})

		test("should reset global key mapping", () => {
			// Generate an ID to populate the key map
			generateStructureId({ a: 1, b: 2 })

			// Reset state
			resetState()

			// Generate IDs for objects with different structures
			const id1 = generateStructureId({ first: true })
			const id2 = generateStructureId({ second: true })

			// These should be different because they have different structures
			expect(id1).not.toBe(id2)

			// But now let's generate an ID for an object with the same structure as the first
			const id3 = generateStructureId({ first: false })

			// Should be the same as the first ID because they have the same structure
			expect(id1).toBe(id3)
		})
	})
})
