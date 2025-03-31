import { describe, test, expect, beforeEach } from "vitest"
import {
	getStructureInfo,
	resetState,
	setStructureIdConfig,
	generateStructureId,
} from "../src/index"

describe("Special Coverage Cases", () => {
	beforeEach(() => {
		resetState()
	})

	test("getStructureInfo - target specific signature calculation paths", () => {
		// Try with null and undefined first
		const nullInfo = getStructureInfo(null as any)
		expect(nullInfo.id).toBeTruthy()

		const undefinedInfo = getStructureInfo(undefined as any)
		expect(undefinedInfo.id).toBeTruthy()

		// Create a custom object with special properties that might trigger edge cases
		const specialObj = Object.create(null) // No prototype
		specialObj.a = 1

		// Try with the special object
		const info1 = getStructureInfo(specialObj as any)
		expect(info1.id).toBeTruthy()

		// Test with unusual values that might trigger type checks or edge cases
		const symbolObj = { [Symbol("test")]: "value" }
		const infoSymbol = getStructureInfo(symbolObj as any)
		expect(infoSymbol.id).toBeTruthy()

		// Try with circular references
		const circular: any = {}
		circular.self = circular
		const infoCircular = getStructureInfo(circular)
		expect(infoCircular.id).toBeTruthy()

		// Try with collision handling on and off
		setStructureIdConfig({ newIdOnCollision: true })

		// Generate a few IDs to populate any counters
		const simpleObj = { test: true }
		generateStructureId(simpleObj)
		generateStructureId(simpleObj)

		// Now get structure info for same object type but different instance
		const simpleObj2 = { test: false }
		const infoSimple = getStructureInfo(simpleObj2)
		expect(infoSimple.id).toBeTruthy()

		// Try with a completely fresh object without generating IDs first
		resetState()
		setStructureIdConfig({ newIdOnCollision: true })

		const freshObj = { fresh: true }
		const infoFresh = getStructureInfo(freshObj)
		expect(infoFresh.id).toBeTruthy()
	})
})
