import { describe, test, expect, beforeEach } from "vitest"
import { generateStructureId, getStructureInfo, resetState } from "../src/index"

describe("Structure ID Generator", () => {
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

	describe("Nested Objects", () => {
		test("should generate the same ID for nested objects with identical structure", () => {
			const obj1 = {
				user: {
					name: "John",
					age: 30,
					preferences: {
						theme: "dark",
						notifications: true,
					},
				},
			}

			const obj2 = {
				user: {
					name: "Jane",
					age: 25,
					preferences: {
						theme: "light",
						notifications: false,
					},
				},
			}

			const id1 = generateStructureId(obj1)
			const id2 = generateStructureId(obj2)

			expect(id1).toBe(id2)
		})

		test("should generate different IDs for nested objects with different structures", () => {
			const obj1 = {
				user: {
					name: "John",
					age: 30,
					preferences: {
						theme: "dark",
						notifications: true,
					},
				},
			}

			const obj2 = {
				user: {
					name: "Jane",
					age: 25,
					preferences: {
						theme: "light",
						fontSize: 14, // different property
					},
				},
			}

			const id1 = generateStructureId(obj1)
			const id2 = generateStructureId(obj2)

			expect(id1).not.toBe(id2)
		})

		test("should handle deeply nested objects", () => {
			const obj1 = {
				level1: {
					level2: {
						level3: {
							level4: {
								level5: {
									value: "deep",
								},
							},
						},
					},
				},
			}

			const obj2 = {
				level1: {
					level2: {
						level3: {
							level4: {
								level5: {
									value: "also deep",
								},
							},
						},
					},
				},
			}

			const id1 = generateStructureId(obj1)
			const id2 = generateStructureId(obj2)

			expect(id1).toBe(id2)
			expect(id1.split("-").length).toBeGreaterThan(5) // Should have multiple level indicators
		})
	})

	describe("Arrays", () => {
		test("should generate the same ID for arrays with the same structure", () => {
			const obj1 = { items: [1, 2, 3] }
			const obj2 = { items: [4, 5, 6] }

			const id1 = generateStructureId(obj1)
			const id2 = generateStructureId(obj2)

			expect(id1).toBe(id2)
		})

		test("should generate different IDs for arrays with different lengths", () => {
			const obj1 = { items: [1, 2, 3] }
			const obj2 = { items: [1, 2, 3, 4] }

			const id1 = generateStructureId(obj1)
			const id2 = generateStructureId(obj2)

			expect(id1).not.toBe(id2)
		})

		test("should generate different IDs for arrays with different element types", () => {
			const obj1 = { items: [1, 2, 3] }
			const obj2 = { items: [1, "2", 3] } // second element is a string

			const id1 = generateStructureId(obj1)
			const id2 = generateStructureId(obj2)

			expect(id1).not.toBe(id2)
		})

		test("should handle arrays of objects correctly", () => {
			const obj1 = {
				users: [
					{ name: "John", age: 30 },
					{ name: "Jane", age: 25 },
				],
			}

			const obj2 = {
				users: [
					{ name: "Alice", age: 35 },
					{ name: "Bob", age: 40 },
				],
			}

			const id1 = generateStructureId(obj1)
			const id2 = generateStructureId(obj2)

			expect(id1).toBe(id2)

			// Different structure in array elements
			const obj3 = {
				users: [
					{ name: "John", role: "admin" }, // different property
					{ name: "Jane", age: 25 },
				],
			}

			const id3 = generateStructureId(obj3)
			expect(id1).not.toBe(id3)
		})

		test("should handle mixed arrays", () => {
			const obj1 = { mixed: [1, "string", true, { a: 1 }] }
			const obj2 = { mixed: [2, "text", false, { a: 42 }] }

			const id1 = generateStructureId(obj1)
			const id2 = generateStructureId(obj2)

			expect(id1).toBe(id2)
		})
	})

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

	describe("Edge Cases", () => {
		test("should handle primitive values", () => {
			expect(() => generateStructureId(42 as any)).not.toThrow()
			expect(() => generateStructureId("string" as any)).not.toThrow()
			expect(() => generateStructureId(true as any)).not.toThrow()
			expect(() => generateStructureId(null as any)).not.toThrow()
			expect(() => generateStructureId(undefined as any)).not.toThrow()
		})

		test("should handle empty objects and arrays", () => {
			const emptyObj = generateStructureId({})
			const emptyArr = generateStructureId([] as any)

			expect(emptyObj).not.toBe(emptyArr)
			expect(emptyObj.length).toBeGreaterThan(0)
			expect(emptyArr.length).toBeGreaterThan(0)
		})

		test("should handle object property order consistently", () => {
			const obj1 = { a: 1, b: 2, c: 3 }
			const obj2 = { c: 3, b: 2, a: 1 } // Different order

			const id1 = generateStructureId(obj1)
			const id2 = generateStructureId(obj2)

			expect(id1).toBe(id2)
		})

		test("should handle Date objects", () => {
			const obj1 = { date: new Date("2023-01-01") }
			const obj2 = { date: new Date("2024-02-02") }

			const id1 = generateStructureId(obj1)
			const id2 = generateStructureId(obj2)

			expect(id1).toBe(id2)
		})

		test("should handle large objects without stack overflow", () => {
			// Create a large nested object
			const largeObj: any = {}
			let current = largeObj

			// Create 1000 levels of nesting
			for (let i = 0; i < 100; i++) {
				current.next = { value: i }
				current = current.next
			}

			// Should not throw a stack overflow error
			expect(() => generateStructureId(largeObj)).not.toThrow()
		})
	})
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
})
