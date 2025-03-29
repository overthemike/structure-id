import { describe, test, expect, beforeEach } from "vitest"
import { generateStructureId, resetState } from "../src/index"

describe("Advanced Edge Cases", () => {
	beforeEach(() => {
		// Reset state before each test
		resetState()
	})

	describe("Exotic Edge Cases", () => {
		test("should handle objects with non-enumerable properties", () => {
			const obj1: Record<string, unknown> = { visible: "test" }
			Object.defineProperty(obj1, "hidden", {
				value: "secret",
				enumerable: false,
			})

			const obj2: Record<string, unknown> = { visible: "different" }
			Object.defineProperty(obj2, "hidden", {
				value: "different secret",
				enumerable: false,
			})

			const id1 = generateStructureId(obj1)
			const id2 = generateStructureId(obj2)

			// Non-enumerable properties likely won't be included in structure ID
			expect(id1).toBeTruthy()
			expect(id1).toBe(id2)
		})

		test("should handle objects with getters and setters", () => {
			const obj1 = {
				_value: 42,
				get computed() {
					return this._value * 2
				},
				set computed(v: number) {
					this._value = v / 2
				},
			}

			const obj2 = {
				_value: 100,
				get computed() {
					return this._value * 2
				},
				set computed(v: number) {
					this._value = v / 2
				},
			}

			const id1 = generateStructureId(obj1)
			const id2 = generateStructureId(obj2)

			// Objects with getters/setters should be treated consistently
			expect(id1).toBeTruthy()
			expect(id1).toBe(id2)
		})

		test("should handle Error objects", () => {
			const error1 = new Error("Something went wrong")
			const error2 = new TypeError("Type error occurred")

			const obj1 = { error: error1, name: "test" }
			const obj2 = { error: error2, name: "different" }

			const id1 = generateStructureId(obj1)
			const id2 = generateStructureId(obj2)

			// Error objects should be treated consistently
			expect(id1).toBeTruthy()
			expect(id1).toBe(id2)
		})

		test("should handle functions and methods", () => {
			// Functions as values
			const func1 = () => "result"
			const func2 = () => {
				return "different"
			}

			const obj1 = {
				callback: func1,
				method() {
					return "method"
				},
			}

			const obj2 = {
				callback: func2,
				method() {
					return "different method"
				},
			}

			const id1 = generateStructureId(obj1)
			const id2 = generateStructureId(obj2)

			// Functions should be treated consistently
			expect(id1).toBeTruthy()
			expect(id1).toBe(id2)
		})
	})
})
