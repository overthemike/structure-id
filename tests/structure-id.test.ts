import { describe, test, expect } from "vitest";
import { generateStructureId } from "../src/index";

describe("Structure ID Generator", () => {
	describe("Basic Structure IDs", () => {
		test("should generate the same ID for objects with identical structure", () => {
			const obj1 = { count: 0, name: "test" };
			const obj2 = { count: 42, name: "different" };

			const id1 = generateStructureId(obj1);
			const id2 = generateStructureId(obj2);

			expect(id1).toBe(id2);
		});

		test("should generate different IDs for objects with different structures", () => {
			const obj1 = { count: 0, name: "test" };
			const obj2 = { count: 0, title: "test" }; // different property name

			const id1 = generateStructureId(obj1);
			const id2 = generateStructureId(obj2);

			expect(id1).not.toBe(id2);
		});

		test("should generate the same IDs for objects with the same properties but in a different order", () => {
			const obj1 = { count: 0, name: "test" };
			const obj2 = { name: "test", count: 0 };

			const id1 = generateStructureId(obj1);
			const id2 = generateStructureId(obj2);

			expect(id1).toBe(id2);
		});

		test("should generate different IDs for objects with different property types", () => {
			const obj1 = { count: 0, name: "test" };
			const obj2 = { count: "0", name: "test" }; // count is string instead of number

			const id1 = generateStructureId(obj1);
			const id2 = generateStructureId(obj2);

			expect(id1).not.toBe(id2);
		});

		test("should maintain consistent IDs across multiple calls", () => {
			const obj = { count: 0, name: "test" };

			const id1 = generateStructureId(obj);
			const id2 = generateStructureId(obj);
			const id3 = generateStructureId(obj);

			expect(id1).toBe(id2);
			expect(id2).toBe(id3);
		});
	});

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
			};

			const obj2 = {
				user: {
					name: "Jane",
					age: 25,
					preferences: {
						theme: "light",
						notifications: false,
					},
				},
			};

			const id1 = generateStructureId(obj1);
			const id2 = generateStructureId(obj2);

			expect(id1).toBe(id2);
		});

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
			};

			const obj2 = {
				user: {
					name: "Jane",
					age: 25,
					preferences: {
						theme: "light",
						fontSize: 14, // different property
					},
				},
			};

			const id1 = generateStructureId(obj1);
			const id2 = generateStructureId(obj2);

			expect(id1).not.toBe(id2);
		});

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
			};

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
			};

			const id1 = generateStructureId(obj1);
			const id2 = generateStructureId(obj2);

			expect(id1).toBe(id2);
			expect(id1.split("-").length).toBeGreaterThan(5); // Should have multiple level indicators
		});
	});

	describe("Arrays", () => {
		test("should generate the same ID for arrays with the same structure", () => {
			const obj1 = { items: [1, 2, 3] };
			const obj2 = { items: [4, 5, 6] };

			const id1 = generateStructureId(obj1);
			const id2 = generateStructureId(obj2);

			expect(id1).toBe(id2);
		});

		test("should generate different IDs for arrays with different lengths", () => {
			const obj1 = { items: [1, 2, 3] };
			const obj2 = { items: [1, 2, 3, 4] };

			const id1 = generateStructureId(obj1);
			const id2 = generateStructureId(obj2);

			expect(id1).not.toBe(id2);
		});

		test("should generate different IDs for arrays with different element types", () => {
			const obj1 = { items: [1, 2, 3] };
			const obj2 = { items: [1, "2", 3] }; // second element is a string

			const id1 = generateStructureId(obj1);
			const id2 = generateStructureId(obj2);

			expect(id1).not.toBe(id2);
		});

		test("should handle arrays of objects correctly", () => {
			const obj1 = {
				users: [
					{ name: "John", age: 30 },
					{ name: "Jane", age: 25 },
				],
			};

			const obj2 = {
				users: [
					{ name: "Alice", age: 35 },
					{ name: "Bob", age: 40 },
				],
			};

			const id1 = generateStructureId(obj1);
			const id2 = generateStructureId(obj2);

			expect(id1).toBe(id2);

			// Different structure in array elements
			const obj3 = {
				users: [
					{ name: "John", role: "admin" }, // different property
					{ name: "Jane", age: 25 },
				],
			};

			const id3 = generateStructureId(obj3);
			expect(id1).not.toBe(id3);
		});

		test("should handle mixed arrays", () => {
			const obj1 = { mixed: [1, "string", true, { a: 1 }] };
			const obj2 = { mixed: [2, "text", false, { a: 42 }] };

			const id1 = generateStructureId(obj1);
			const id2 = generateStructureId(obj2);

			expect(id1).toBe(id2);
		});
	});

	describe("Circular References", () => {
		test("should handle simple circular references", () => {
			const obj1: any = { name: "circular" };
			obj1.self = obj1;

			const obj2: any = { name: "also circular" };
			obj2.self = obj2;

			const id1 = generateStructureId(obj1);
			const id2 = generateStructureId(obj2);

			expect(id1).toBe(id2);
			expect(id1.length).toBeGreaterThan(0);
		});

		test("should handle complex circular references", () => {
			const obj1: any = { name: "complex" };
			const child1: any = { parent: obj1 };
			obj1.child = child1;

			const obj2: any = { name: "also complex" };
			const child2: any = { parent: obj2 };
			obj2.child = child2;

			const id1 = generateStructureId(obj1);
			const id2 = generateStructureId(obj2);

			expect(id1).toBe(id2);
			expect(id1.length).toBeGreaterThan(0);
		});

		test("should handle multi-level circular references", () => {
			// Create a three-object cycle
			const obj1: any = { name: "node1" };
			const obj2: any = { name: "node2" };
			const obj3: any = { name: "node3" };

			obj1.next = obj2;
			obj2.next = obj3;
			obj3.next = obj1; // Completes the cycle

			const result = generateStructureId(obj1);

			// Should produce a valid ID without stack overflow
			expect(result.length).toBeGreaterThan(0);
		});
	});

	describe("Edge Cases", () => {
		test("should handle primitive values", () => {
			expect(() => generateStructureId(42 as any)).not.toThrow();
			expect(() => generateStructureId("string" as any)).not.toThrow();
			expect(() => generateStructureId(true as any)).not.toThrow();
			expect(() => generateStructureId(null as any)).not.toThrow();
			expect(() => generateStructureId(undefined as any)).not.toThrow();
		});

		test("should handle empty objects and arrays", () => {
			const emptyObj = generateStructureId({});
			const emptyArr = generateStructureId([] as any);

			expect(emptyObj).not.toBe(emptyArr);
			expect(emptyObj.length).toBeGreaterThan(0);
			expect(emptyArr.length).toBeGreaterThan(0);
		});

		test("should handle object property order consistently", () => {
			const obj1 = { a: 1, b: 2, c: 3 };
			const obj2 = { c: 3, b: 2, a: 1 }; // Different order

			const id1 = generateStructureId(obj1);
			const id2 = generateStructureId(obj2);

			expect(id1).toBe(id2);
		});

		test("should handle Date objects", () => {
			const obj1 = { date: new Date("2023-01-01") };
			const obj2 = { date: new Date("2024-02-02") };

			const id1 = generateStructureId(obj1);
			const id2 = generateStructureId(obj2);

			expect(id1).toBe(id2);
		});

		test("should handle large objects without stack overflow", () => {
			// Create a large nested object
			const largeObj: any = {};
			let current = largeObj;

			// Create 1000 levels of nesting
			for (let i = 0; i < 100; i++) {
				current.next = { value: i };
				current = current.next;
			}

			// Should not throw a stack overflow error
			expect(() => generateStructureId(largeObj)).not.toThrow();
		});
	});
});
