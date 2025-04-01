import { describe, test, expect } from "vitest";
import { generateStructureId } from "../src/index";

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

		// Empty objects and arrays have the same ID since they don't have any data
		expect(emptyObj).toBe(emptyArr);
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
		type Next = { next?: Next; value?: unknown };
		const largeObj: Next = {};
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
