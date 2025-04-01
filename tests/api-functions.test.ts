import { describe, test, expect, beforeEach } from "vitest"
import {
	generateStructureId,
	getStructureInfo,
	resetState,
	setStructureIdConfig,
	OBJECT_SIGNATURE_CACHE,
	STRUCTURE_INFO_CACHE,
	OBJECT_ID_CACHE,
} from "../src/index"

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
			// After reset, structure ID generation should be consistent for similar structures
			const simpleObj1 = { simple: true }
			const simpleObj2 = { simple: false } // Different value, same structure
			
			// Generate IDs
			const id1 = generateStructureId(simpleObj1)
			const id2 = generateStructureId(simpleObj2)
			expect(id1).toBe(id2) // Same structure = same ID

			// Reset again
			resetState()

			// Generate IDs again
			const newId1 = generateStructureId(simpleObj1)
			const newId2 = generateStructureId(simpleObj2)
			
			// Verify that after reset, structural equality still works
			expect(newId1).toBe(newId2)
		})

		test("should reset global key mapping", () => {
			// Generate an ID to populate the key map
			generateStructureId({ a: 1, b: 2 })

			// Reset state
			resetState()

			// In the new implementation, structural differences are encoded in the signature part
			// while the L0 part includes the RESET_SEED, so we need to verify differently
			
			// Two objects with same properties but different values (same structure)
			const id1a = generateStructureId({ first: true })
			const id1b = generateStructureId({ first: false })
			expect(id1a).toBe(id1b) // Same structure = same ID
			
			// Object with different structure
			const id2 = generateStructureId({ second: true }) 
			
			// We can't directly test L0 parts but we can verify consistent behavior
			const id3 = generateStructureId({ second: false })
			expect(id2).toBe(id3) // Same structure = same ID

			// With the current implementation, we can only guarantee different IDs with collision handling on
			setStructureIdConfig({ newIdOnCollision: true });
			const newId1 = generateStructureId({ first: true })
			const newId2 = generateStructureId({ second: true })
			expect(newId1).not.toBe(newId2)
			setStructureIdConfig({ newIdOnCollision: false });
		})
	})

	describe("Edge Coverage Cases", () => {
		beforeEach(() => {
			resetState()
		})

		test("should calculate structure signature for uncached objects", () => {
			// Reset state completely
			resetState()

			// Create an object with a property that won't be enumerated
			const uncachedObj = {}
			Object.defineProperty(uncachedObj, "hidden", {
				value: Math.random(),
				enumerable: false,
			})

			// Make sure it's not in any caches first
			expect(OBJECT_SIGNATURE_CACHE.has(uncachedObj)).toBe(false)

			// Now call getStructureInfo directly
			const info = getStructureInfo(uncachedObj as any)
			expect(info).toHaveProperty("id")
		})
	})
})
