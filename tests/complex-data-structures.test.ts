import { describe, test, expect, beforeEach } from "vitest"
import { generateStructureId, resetState } from "../src/index"

describe("Complex Data Structure Tests", () => {
	beforeEach(() => {
		// Reset state before each test to ensure consistent results
		resetState()
	})

	describe("Map and Set Objects", () => {
		test("should handle objects containing Maps", () => {
			const map1 = new Map<string, number>()
			map1.set("a", 1)
			map1.set("b", 2)

			const map2 = new Map<string, number>()
			map2.set("x", 10)
			map2.set("y", 20)

			const obj1 = { dataMap: map1, name: "test" }
			const obj2 = { dataMap: map2, name: "different" }

			const id1 = generateStructureId(obj1)
			const id2 = generateStructureId(obj2)

			// Maps should be treated as objects of some kind
			expect(id1).toBeTruthy()
			expect(id1).toBe(id2)
		})

		test("should handle objects containing Sets", () => {
			const set1 = new Set<number>([1, 2, 3])
			const set2 = new Set<number>([4, 5, 6])

			const obj1 = { dataSet: set1, name: "test" }
			const obj2 = { dataSet: set2, name: "different" }

			const id1 = generateStructureId(obj1)
			const id2 = generateStructureId(obj2)

			// Sets should be treated as objects of some kind
			expect(id1).toBeTruthy()
			expect(id1).toBe(id2)
		})

		test("should handle nested Maps and Sets", () => {
			const map1 = new Map<string, Set<number>>()
			map1.set("a", new Set([1, 2, 3]))

			const map2 = new Map<string, Set<number>>()
			map2.set("a", new Set([4, 5, 6]))

			const obj1 = { nestedStructures: map1 }
			const obj2 = { nestedStructures: map2 }

			const id1 = generateStructureId(obj1)
			const id2 = generateStructureId(obj2)

			// Should handle nested collection types
			expect(id1).toBeTruthy()
			expect(id1).toBe(id2)
		})
	})

	describe("Proxy Objects", () => {
		test("should handle Proxy objects", () => {
			const target1 = { count: 42, name: "original" }
			const handler1 = {}
			const proxy1 = new Proxy(target1, handler1)

			const target2 = { count: 0, name: "different" }
			const handler2 = {}
			const proxy2 = new Proxy(target2, handler2)

			const obj1 = { proxyData: proxy1 }
			const obj2 = { proxyData: proxy2 }

			const id1 = generateStructureId(obj1)
			const id2 = generateStructureId(obj2)

			// Proxies with same target structure should generate same ID
			expect(id1).toBeTruthy()
			expect(id1).toBe(id2)
		})

		test("should handle Proxy objects with different structures", () => {
			const target1 = { count: 42, name: "original" }
			const proxy1 = new Proxy(target1, {})

			const target2 = { count: 42, title: "different" } // different property
			const proxy2 = new Proxy(target2, {})

			const obj1 = { proxyData: proxy1 }
			const obj2 = { proxyData: proxy2 }

			const id1 = generateStructureId(obj1)
			const id2 = generateStructureId(obj2)

			// Proxies with different target structures should generate different IDs
			expect(id1).not.toBe(id2)
		})

		test("should handle Proxy objects with custom handlers", () => {
			const target = { value: 42 }

			// Proxy with get trap
			const handler1 = {
				get(target: any, prop: string) {
					return prop in target ? target[prop] : "default"
				},
			}

			// Proxy with different get trap
			const handler2 = {
				get(target: any, prop: string) {
					return prop in target ? target[prop] * 2 : 0
				},
			}

			const proxy1 = new Proxy(target, handler1)
			const proxy2 = new Proxy(target, handler2)

			const obj1 = { proxyData: proxy1 }
			const obj2 = { proxyData: proxy2 }

			const id1 = generateStructureId(obj1)
			const id2 = generateStructureId(obj2)

			// Proxies with same target but different handlers should still have same ID
			// since the structure is the same
			expect(id1).toBe(id2)
		})
	})

	describe("Symbol Properties", () => {
		test("should handle objects with Symbol keys", () => {
			const symbolKey1 = Symbol("key1")
			const symbolKey2 = Symbol("key2")

			const obj1: Record<string | symbol, unknown> = {
				normalKey: "value",
				[symbolKey1]: "symbol value",
			}

			const obj2: Record<string | symbol, unknown> = {
				normalKey: "different",
				[symbolKey2]: "different symbol value",
			}

			const id1 = generateStructureId(obj1 as Record<string, unknown>)
			const id2 = generateStructureId(obj2 as Record<string, unknown>)

			// Symbol keys might not be included in the structure ID
			// but the function should at least not crash
			expect(id1).toBeTruthy()
		})

		test("should handle Symbol objects as values", () => {
			const sym1 = Symbol("description1")
			const sym2 = Symbol("description2")

			const obj1 = { id: sym1, name: "test" }
			const obj2 = { id: sym2, name: "different" }

			const id1 = generateStructureId(obj1)
			const id2 = generateStructureId(obj2)

			// Objects with Symbol values should have the same structure
			expect(id1).toBe(id2)
		})
	})

	describe("Custom Prototypes and Methods", () => {
		test("should handle objects with custom methods", () => {
			class CustomClass {
				value: number

				constructor(value: number) {
					this.value = value
				}

				calculate(): number {
					return this.value * 2
				}
			}

			const custom1 = new CustomClass(10)
			const custom2 = new CustomClass(20)

			const obj1 = { custom: custom1, name: "test" }
			const obj2 = { custom: custom2, name: "different" }

			const id1 = generateStructureId(obj1)
			const id2 = generateStructureId(obj2)

			// Custom classes should be treated based on their data structure
			expect(id1).toBeTruthy()
			expect(id1).toBe(id2)
		})

		test("should handle objects with inherited properties", () => {
			class Parent {
				parentValue: string

				constructor(value: string) {
					this.parentValue = value
				}
			}

			class Child extends Parent {
				childValue: number

				constructor(parentValue: string, childValue: number) {
					super(parentValue)
					this.childValue = childValue
				}
			}

			const child1 = new Child("parent1", 10)
			const child2 = new Child("parent2", 20)

			const obj1 = { instance: child1 }
			const obj2 = { instance: child2 }

			const id1 = generateStructureId(obj1)
			const id2 = generateStructureId(obj2)

			// Inheritance hierarchy should be reflected in structure
			expect(id1).toBeTruthy()
			expect(id1).toBe(id2)
		})
	})
})
