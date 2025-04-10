import { bench, describe } from "vitest"
import { getCompactId, generateStructureId } from "../src/index"
import complexNestedObject from "./largeobj"

// Test data with different object structures
const testObjects = {
	empty: {},
	a_empty: [],
	simple: { id: 1, name: "test" },
	nested: {
		id: 1,
		user: {
			name: "John",
			email: "john@example.com",
		},
		tags: ["important", "featured"],
	},
	large: Object.fromEntries(
		Array.from({ length: 50 }, (_, i) => [`key${i}`, `value${i}`]),
	),
	complex: {
		id: "xyz123",
		user: {
			id: 42,
			name: "Jane Doe",
			email: "jane@example.com",
			preferences: {
				theme: "dark",
				notifications: {
					email: true,
					push: false,
					sms: true,
				},
			},
		},
		items: Array.from({ length: 20 }, (_, i) => ({
			id: i,
			name: `Item ${i}`,
			price: Math.random() * 100,
			tags: ["tag1", "tag2", `custom${i}`],
		})),
		metadata: {
			created: new Date().toISOString(),
			lastModified: new Date().toISOString(),
			version: "1.0.0",
		},
	},
	array: Array.from({ length: 100 }, (_, i) => ({
		id: i,
		value: `value${i}`,
	})),
	verylarge: complexNestedObject,
}

describe("Hashed (getCompactId) vs No Hash (generateStructureId)", () => {
	describe("Empty Object", () => {
		bench("generateStructureId with an Empty Object", () => {
			generateStructureId(testObjects.empty)
		})

		bench("getCompactId with an Empty Object", () => {
			getCompactId(testObjects.empty)
		})
	})

	describe("Empty Array", () => {
		bench("generateStructureId with an Empty Array", () => {
			generateStructureId(testObjects.a_empty)
		})

		bench("getCompactId with an Empty Array", () => {
			getCompactId(testObjects.a_empty)
		})
	})

	describe("Simple Object", () => {
		bench("generateStructureId with a Simple Object", () => {
			generateStructureId(testObjects.simple)
		})

		bench("getCompactId with a Simple Object", () => {
			getCompactId(testObjects.simple)
		})
	})

	describe("Nested Object", () => {
		bench("generateStructureId with a Nested Object", () => {
			generateStructureId(testObjects.nested)
		})

		bench("getCompactId with a Nested Object", () => {
			getCompactId(testObjects.nested)
		})
	})

	describe("Large Object (50 properties)", () => {
		bench("generateStructureId with a Large Object (50 properties)", () => {
			generateStructureId(testObjects.large)
		})

		bench("getCompactId with a Large Object (50 properties)", () => {
			getCompactId(testObjects.large)
		})
	})

	describe("Complex Object (Deeply Nested)", () => {
		bench("generateStructureId with a Complex Object (Deeply Nested)", () => {
			generateStructureId(testObjects.complex)
		})

		bench("getCompactId with a Complex Object (Deeply Nested)", () => {
			getCompactId(testObjects.complex)
		})
	})

	describe("Large Array of Objects", () => {
		bench("generateStructureId with a large array of objects", () => {
			generateStructureId(testObjects.array)
		})

		bench("getCompactId with a large array of objects", () => {
			getCompactId(testObjects.array)
		})
	})

	describe("With Collision Detection", () => {
		bench("generateStructureId with collision detection", () => {
			generateStructureId(testObjects.complex, {
				newIdOnCollision: true,
			})
		})

		bench("getCompactId with collision detection", () => {
			getCompactId(testObjects.complex, {
				newIdOnCollision: true,
			})
		})
	})

	describe("Very large object", () => {
		bench("generateStructureId with a very large object", () => {
			generateStructureId(testObjects.verylarge)
		})

		bench("getCompactId with a very large object", () => {
			getCompactId(testObjects.verylarge)
		})
	})
})
