import { describe, test, expect, beforeEach } from "vitest"
import {
	generateStructureId,
	getStructureInfo,
	resetState,
	setStructureIdConfig,
} from "../src/index"

describe("Structure Info Tests", () => {
	beforeEach(() => {
		// Reset state before each test
		resetState()
		// Reset configuration to default
		setStructureIdConfig({ newIdOnCollision: false })
	})

	test("should return correct structure info without incrementing counter", () => {
		// Enable collision handling
		setStructureIdConfig({ newIdOnCollision: true })

		const obj1 = { name: "test", value: 42 }
		const obj2 = { name: "another", value: 100 }

		// Generate IDs (incrementing counter)
		const id1 = generateStructureId(obj1)
		const id2 = generateStructureId(obj2)

		// Both should have same structure but different IDs due to collision handling
		expect(id1).toBe("L0:0-L1:5")
		expect(id2).toBe("L0:1-L1:5")

		// Get structure info for obj1 (should show collision count as 1)
		const info1 = getStructureInfo(obj1)

		// ID should reflect current counter but not increment it
		expect(info1.id).toBe("L0:1-L1:5")
		expect(info1.collisionCount).toBe(1)

		// Generate another ID
		const id3 = generateStructureId(obj1)

		// Counter should have incremented to 2
		expect(id3).toBe("L0:2-L1:5")

		// Get structure info again
		const info2 = getStructureInfo(obj1)

		// Should reflect the current counter value (2) without incrementing
		expect(info2.id).toBe("L0:2-L1:5")
		expect(info2.collisionCount).toBe(2)
	})

	test("should correctly handle level count", () => {
		const shallow = { a: 1, b: 2 }
		const deep = {
			level1: {
				level2: {
					level3: { value: "deep" },
				},
			},
		}

		// Get structure info
		const shallowInfo = getStructureInfo(shallow)
		const deepInfo = getStructureInfo(deep)

		// Verify level counts - adjusted to match actual structure depth
		expect(shallowInfo.levels).toBe(2) // L0 and L1
		expect(deepInfo.levels).toBe(5) // L0, L1, L2, L3, and L4 (value)
	})

	test("should honor collision handling setting", () => {
		// Objects with identical structure
		const obj1 = { test: true }
		const obj2 = { test: false }

		// Generate with collision handling OFF
		setStructureIdConfig({ newIdOnCollision: false })

		// Generate an ID
		generateStructureId(obj1)

		// Get info for the second object
		const info1 = getStructureInfo(obj2)

		// With collision handling off, should show collision count 0
		expect(info1.collisionCount).toBe(0)

		// Now with collision handling ON
		setStructureIdConfig({ newIdOnCollision: true })

		// Generate an ID AND another ID to increment counter to 1
		generateStructureId(obj1)
		generateStructureId(obj2) // This will make the counter for this structure = 1

		// Get info for the second object - should now show count of 1
		const info2 = getStructureInfo(obj2)

		// With collision handling on and after generating an ID, counter should be 1
		expect(info2.collisionCount).toBe(1)
	})

	test("should match example behavior correctly", () => {
		// Enable collision handling
		setStructureIdConfig({
			newIdOnCollision: true,
		})

		const obj = {
			name: "mike",
			age: 30,
		}

		const obj2 = {
			name: "jon",
			age: 20,
		}

		// First get direct IDs
		const id1 = generateStructureId(obj) // L0:0-...
		const id2 = generateStructureId(obj2) // L0:1-...

		// Now get structure info (should not increment counters)
		const info1 = getStructureInfo(obj) // L0:1-... (current count = 1)
		const info2 = getStructureInfo(obj2) // L0:1-... (current count = 1)

		// Verify IDs from direct calls
		expect(id1).toBe("L0:0-L1:5") // First occurrence = 0
		expect(id2).toBe("L0:1-L1:5") // Second occurrence = 1

		// Verify structure info reflects current counts
		expect(info1.id).toBe("L0:1-L1:5")
		expect(info1.collisionCount).toBe(1)

		expect(info2.id).toBe("L0:1-L1:5")
		expect(info2.collisionCount).toBe(1)

		// Generate one more direct ID to increment the counter
		const id3 = generateStructureId(obj) // L0:2-...

		// Get structure info again
		const info3 = getStructureInfo(obj)

		// Should reflect the updated count
		expect(info3.id).toBe("L0:2-L1:5")
		expect(info3.collisionCount).toBe(2)
	})
})
