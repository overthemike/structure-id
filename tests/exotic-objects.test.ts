import { describe, test, expect, beforeEach } from "vitest"
import { generateStructureId, resetState } from "../src/index"

describe("Exotic Objects Tests", () => {
	beforeEach(() => {
		// Reset state before each test to ensure consistent results
		resetState()
	})

	describe("Other Exotic Objects", () => {
		test("should handle WeakMap and WeakSet", () => {
			const key1 = {}
			const key2 = {}

			const weakMap1 = new WeakMap()
			weakMap1.set(key1, "value1")

			const weakMap2 = new WeakMap()
			weakMap2.set(key2, "value2")

			const weakSet1 = new WeakSet()
			weakSet1.add(key1)

			const weakSet2 = new WeakSet()
			weakSet2.add(key2)

			const obj1 = {
				weakMap: weakMap1,
				weakSet: weakSet1,
				name: "test",
			}

			const obj2 = {
				weakMap: weakMap2,
				weakSet: weakSet2,
				name: "different",
			}

			const id1 = generateStructureId(obj1)
			const id2 = generateStructureId(obj2)

			// WeakMap and WeakSet should be treated consistently
			expect(id1).toBeTruthy()
			expect(id1).toBe(id2)
		})

		test("should handle typed arrays", () => {
			const int8Array1 = new Int8Array([1, 2, 3])
			const int8Array2 = new Int8Array([4, 5, 6])

			const uint8Array1 = new Uint8Array([1, 2, 3])
			const float32Array1 = new Float32Array([1.1, 2.2, 3.3])

			const obj1 = { typedArray: int8Array1, name: "test" }
			const obj2 = { typedArray: int8Array2, name: "different" }
			const obj3 = { typedArray: uint8Array1, name: "test" }
			const obj4 = { typedArray: float32Array1, name: "test" }

			const id1 = generateStructureId(obj1)
			const id2 = generateStructureId(obj2)
			const id3 = generateStructureId(obj3)
			const id4 = generateStructureId(obj4)

			// Same typed array type should yield same structure ID
			expect(id1).toBe(id2)

			// Different typed array types might yield different IDs
			// depending on implementation
			expect(id1).toBeTruthy()
			expect(id3).toBeTruthy()
			expect(id4).toBeTruthy()
		})

		test("should handle ArrayBuffer and DataView", () => {
			const buffer1 = new ArrayBuffer(8)
			const view1 = new DataView(buffer1)
			view1.setInt32(0, 42)

			const buffer2 = new ArrayBuffer(8)
			const view2 = new DataView(buffer2)
			view2.setInt32(0, 100)

			const obj1 = { buffer: buffer1, view: view1, name: "test" }
			const obj2 = { buffer: buffer2, view: view2, name: "different" }

			const id1 = generateStructureId(obj1)
			const id2 = generateStructureId(obj2)

			// ArrayBuffer and DataView should be treated consistently
			expect(id1).toBeTruthy()
			expect(id1).toBe(id2)
		})

		test("should handle RegExp objects", () => {
			const regex1 = /test/g
			const regex2 = /different/i

			const obj1 = { pattern: regex1, name: "test" }
			const obj2 = { pattern: regex2, name: "different" }

			const id1 = generateStructureId(obj1)
			const id2 = generateStructureId(obj2)

			// RegExp objects should be treated consistently
			expect(id1).toBeTruthy()
			expect(id1).toBe(id2)
		})

		test("should handle Promise objects", () => {
			const promise1 = Promise.resolve(42)
			const promise2 = Promise.resolve("string")

			const obj1 = { future: promise1, name: "test" }
			const obj2 = { future: promise2, name: "different" }

			const id1 = generateStructureId(obj1)
			const id2 = generateStructureId(obj2)

			// Promise objects should be treated consistently
			expect(id1).toBeTruthy()
			expect(id1).toBe(id2)
		})
	})

	describe("Mixed Complex Objects", () => {
		test("should handle objects with mixed complex structures", () => {
			const symbolKey = Symbol("key")
			const map = new Map().set("key", "value")
			const set = new Set([1, 2, 3])
			const typed = new Uint8Array([1, 2, 3])
			const proxy = new Proxy({}, {})

			const complex1: Record<string | symbol, unknown> = {
				regularKey: "value",
				[symbolKey]: "symbol value",
				mapValue: map,
				setValue: set,
				typedArray: typed,
				proxyValue: proxy,
				nested: {
					inner: new Map().set("inner", "value"),
					dates: [new Date(), new Date(2020, 1, 1)],
				},
			}

			const complex2: Record<string | symbol, unknown> = {
				regularKey: "different",
				[symbolKey]: "different symbol value",
				mapValue: new Map().set("different", "map"),
				setValue: new Set([4, 5, 6]),
				typedArray: new Uint8Array([4, 5, 6]),
				proxyValue: new Proxy({}, {}),
				nested: {
					inner: new Map().set("different", "inner"),
					dates: [new Date(2022, 5, 5), new Date(2023, 10, 10)],
				},
			}

			const id1 = generateStructureId(complex1 as Record<string, unknown>)
			const id2 = generateStructureId(complex2 as Record<string, unknown>)

			// Complex mixed objects should be handled consistently
			expect(id1).toBeTruthy()
			expect(id2).toBeTruthy()
		})
	})
})
