import { describe, test, expect, beforeEach } from "vitest"
import {
	getCompactId,
	getCompactInfo,
	resetState,
	setStructureIdConfig,
	getStructureInfo,
	generateStructureId,
} from "../src"

describe("Compact ID Functions", () => {
	// Reset state before each test
	beforeEach(() => {
		resetState()
		// Reset the global config to default before each test
		setStructureIdConfig({ newIdOnCollision: false })
	})

	describe("getCompactId", () => {
		test("should return a hashed version of the structure ID", () => {
			const obj = { a: 1, b: "test" }
			const result = getCompactId(obj)

			// The output should be a non-empty string
			expect(typeof result).toBe("string")
			expect(result.length).toBeGreaterThan(0)
		})

		test("should return consistent IDs for identical objects", () => {
			const obj1 = { a: 1, b: "test" }
			const obj2 = { a: 1, b: "test" }

			const result1 = getCompactId(obj1)
			const result2 = getCompactId(obj2)

			expect(result1).toBe(result2)
		})

		test("should return different IDs for completely different objects", () => {
			// Create completely different object structures
			const obj1 = { deeply: { nested: { value: 1 } } }
			const obj2 = { array: [1, 2, 3, 4, 5] }

			const result1 = getCompactId(obj1)
			const result2 = getCompactId(obj2)

			// The compact IDs should be different
			expect(result1).not.toBe(result2)
		})

		test("should respect newIdOnCollision configuration", () => {
			const obj = { a: 1, b: "test" }

			// First call with default config
			resetState()
			setStructureIdConfig({ newIdOnCollision: true })

			// Generate two IDs with collision handling enabled
			const result1 = getCompactId(obj)
			const result2 = getCompactId(obj)

			// The IDs should be different when collision handling is enabled
			expect(result1).not.toBe(result2)
		})

		test("should handle primitive values", () => {
			// @ts-expect-error - Testing with primitive values
			const result1 = getCompactId(42)
			// @ts-expect-error - Testing with primitive values
			const result2 = getCompactId("test")
			// @ts-expect-error - Testing with primitive values
			const result3 = getCompactId(true)

			// Each primitive should produce a valid string ID
			expect(typeof result1).toBe("string")
			expect(typeof result2).toBe("string")
			expect(typeof result3).toBe("string")

			// Different primitive types should produce different hashes
			expect(result1).not.toBe(result2)
			expect(result2).not.toBe(result3)
			expect(result1).not.toBe(result3)
		})

		test("should handle arrays", () => {
			const arr = [1, 2, 3]
			// @ts-expect-error - Testing with array instead of object
			const result = getCompactId(arr)

			expect(typeof result).toBe("string")
			expect(result.length).toBeGreaterThan(0)
		})

		test("should handle nested objects and arrays", () => {
			const obj = {
				a: 1,
				b: {
					c: [1, 2, 3],
					d: { e: "test" },
				},
			}

			const result = getCompactId(obj)

			expect(typeof result).toBe("string")
			expect(result.length).toBeGreaterThan(0)
		})

		test("should pass custom config to underlying generateStructureId function", () => {
			resetState()
			const obj = { a: 1, b: "test" }

			// First call with collision handling disabled
			const result1 = getCompactId(obj, { newIdOnCollision: false })

			// Second call with collision handling enabled
			const result2 = getCompactId(obj, { newIdOnCollision: true })

			// Third call with collision handling enabled
			const result3 = getCompactId(obj, { newIdOnCollision: true })

			// First and second can be the same (first time seeing the structure)
			// but second and third should be different (collision handling)
			expect(result2).not.toBe(result3)
		})
	})

	describe("getCompactInfo", () => {
		test("should return a compact ID along with level and collision info", () => {
			const obj = { a: 1, b: "test" }
			const result = getCompactInfo(obj)

			expect(result).toHaveProperty("id")
			expect(result).toHaveProperty("levels")
			expect(result).toHaveProperty("collisionCount")
			expect(typeof result.id).toBe("string")
			expect(typeof result.levels).toBe("number")
			expect(typeof result.collisionCount).toBe("number")
		})

		test("should return consistent info for identical objects", () => {
			const obj1 = { a: 1, b: "test" }
			const obj2 = { a: 1, b: "test" }

			const result1 = getCompactInfo(obj1)
			const result2 = getCompactInfo(obj2)

			expect(result1.id).toBe(result2.id)
			expect(result1.levels).toBe(result2.levels)
			expect(result1.collisionCount).toBe(result2.collisionCount)
		})

		test("should return different info for completely different objects", () => {
			// Create completely different object structures
			const obj1 = { deeply: { nested: { value: 1 } } }
			const obj2 = { array: [1, 2, 3, 4, 5] }

			const result1 = getCompactInfo(obj1)
			const result2 = getCompactInfo(obj2)

			// The structure IDs should be different
			expect(result1.id).not.toBe(result2.id)
		})

		test("should handle primitive values", () => {
			// @ts-expect-error - Testing with primitive values
			const result1 = getCompactInfo(42)
			// @ts-expect-error - Testing with primitive values
			const result2 = getCompactInfo("test")
			// @ts-expect-error - Testing with primitive values
			const result3 = getCompactInfo(true)

			// Each should have proper structure
			expect(result1).toHaveProperty("id")
			expect(result1).toHaveProperty("levels")
			expect(result1).toHaveProperty("collisionCount")

			expect(result2).toHaveProperty("id")
			expect(result2).toHaveProperty("levels")
			expect(result2).toHaveProperty("collisionCount")

			expect(result3).toHaveProperty("id")
			expect(result3).toHaveProperty("levels")
			expect(result3).toHaveProperty("collisionCount")

			// Different primitive types should produce different hashes
			expect(result1.id).not.toBe(result2.id)
			expect(result1.id).not.toBe(result3.id)
			expect(result2.id).not.toBe(result3.id)
		})

		test("should handle circular references", () => {
			const obj: Record<string, unknown> = { a: 1 }
			obj.self = obj // Create circular reference

			const result = getCompactInfo(obj)

			expect(result).toHaveProperty("id")
			expect(result).toHaveProperty("levels")
			expect(result).toHaveProperty("collisionCount")
			expect(typeof result.id).toBe("string")
		})

		test("should maintain consistent IDs across multiple calls for the same object", () => {
			const obj = { a: 1, b: "test" }

			const result1 = getCompactInfo(obj)
			const result2 = getCompactInfo(obj)

			expect(result1.id).toBe(result2.id)
			expect(result1.levels).toBe(result2.levels)
			expect(result1.collisionCount).toBe(result2.collisionCount)
		})

		test("should directly manipulate STRUCTURE_HASH_COUNTER for collisions", () => {
			// This test directly uses generateStructureId to verify proper collision handling
			resetState()
			setStructureIdConfig({ newIdOnCollision: true })

			const obj = { a: 1, b: "test" }

			// First generate a structure ID to create an entry in the counter
			generateStructureId(obj)

			// Get info after first generation
			const info1 = getCompactInfo(obj)
			expect(info1.collisionCount).toBe(0)

			// Generate another structure ID to increment the counter
			generateStructureId(obj)

			// Get info after second generation
			const info2 = getCompactInfo(obj)
			expect(info2.collisionCount).toBe(1)

			// Verify the IDs are different
			expect(info1.id).not.toBe(info2.id)
		})

		test("should generate a new ID when not in cache", () => {
			// Start fresh
			resetState()

			// Create an object that won't be in any cache
			const obj = { uniqueValue: Math.random() }

			// Call getCompactInfo with collision handling disabled
			const info = getCompactInfo(obj)

			// Verify we got a valid result
			expect(info).toHaveProperty("id")
			expect(typeof info.id).toBe("string")
			expect(info.id.length).toBeGreaterThan(0)

			// Now call it again with the same object
			const info2 = getCompactInfo(obj)

			// Should be the same ID (now cached)
			expect(info2.id).toBe(info.id)

			// Create another unique object
			const obj2 = { uniqueValue: Math.random() }

			// This should hit the else branch again
			const info3 = getCompactInfo(obj2)

			// Different object should have different ID
			expect(info3.id).not.toBe(info.id)
		})
	})

	describe("Integration with configuration", () => {
		test("should manipulate collision counter with global config", () => {
			resetState()
			setStructureIdConfig({ newIdOnCollision: true })

			const obj = { a: 1, b: "test" }

			// Generate IDs with collision handling enabled
			const id1 = generateStructureId(obj)
			const id2 = generateStructureId(obj)

			// Verify these IDs are different (collision handling works)
			expect(id1).not.toBe(id2)

			// Get compact info, which should reflect the updated collision count
			const info = getCompactInfo(obj)
			expect(info.collisionCount).toBeGreaterThan(0)
		})

		test("should work independently with local config override", () => {
			// Start completely fresh
			resetState()
			// Set global config to NOT handle collisions
			setStructureIdConfig({ newIdOnCollision: false })

			const obj = { a: 1, b: "test" }

			// Test local config override with getCompactId
			const id1 = getCompactId(obj) // With global config
			const id2 = getCompactId(obj, { newIdOnCollision: true }) // First with local override
			const id3 = getCompactId(obj, { newIdOnCollision: true }) // Second with local override

			// id2 and id3 should be different due to collision handling in local config
			expect(id2).not.toBe(id3)

			// Get another ID with global config - should still not be affected
			const id4 = getCompactId(obj)
			expect(id4).toBe(id1)
		})

		test("should properly compact the ID", () => {
			// Start fresh
			resetState()

			const obj = { a: 1, b: "test" }

			// Get the original ID using generateStructureId
			const originalId = generateStructureId(obj)

			// Get the compact ID using getCompactInfo
			const compactInfo = getCompactInfo(obj)

			// Get the compact ID using getCompactId
			const compactId = getCompactId(obj)

			// Verify that the compact ID is different from the original
			expect(compactInfo.id).not.toBe(originalId)

			// Verify that getCompactId and getCompactInfo.id return the same value
			expect(compactId).toBe(compactInfo.id)

			// Verify that compaction is happening by checking
			// that the compact ID is shorter than the original
			// or at least has a different format (hash)
			expect(compactInfo.id.length).not.toBe(originalId.length)
		})
	})
})
