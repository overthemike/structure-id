import { bench, describe } from "vitest"
import { getCompactId } from "../src/index"
import { createHash } from "node:crypto"

// Test data with different object structures
const testObjects = {
	empty: {},
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
}

// Hash function using SHA256
const sha256Hash = (obj: unknown): string => {
	const stringified = JSON.stringify(obj)
	return createHash("sha256").update(stringified).digest("hex")
}

describe("Structure-ID vs SHA256 Benchmarks", () => {
	describe("Empty Object", () => {
		bench("structure-id", () => {
			getCompactId(testObjects.empty as Record<string, unknown>)
		})

		bench("sha256", () => {
			sha256Hash(testObjects.empty)
		})
	})

	describe("Simple Object", () => {
		bench("structure-id", () => {
			getCompactId(testObjects.simple as Record<string, unknown>)
		})

		bench("sha256", () => {
			sha256Hash(testObjects.simple)
		})
	})

	describe("Nested Object", () => {
		bench("structure-id", () => {
			getCompactId(testObjects.nested as Record<string, unknown>)
		})

		bench("sha256", () => {
			sha256Hash(testObjects.nested)
		})
	})

	describe("Large Object (50 properties)", () => {
		bench("structure-id", () => {
			getCompactId(testObjects.large as Record<string, unknown>)
		})

		bench("sha256", () => {
			sha256Hash(testObjects.large)
		})
	})

	describe("Complex Object (Deeply Nested)", () => {
		bench("structure-id", () => {
			getCompactId(testObjects.complex as Record<string, unknown>)
		})

		bench("sha256", () => {
			sha256Hash(testObjects.complex)
		})
	})

	describe("Large Array of Objects", () => {
		bench("structure-id", () => {
			getCompactId(testObjects.array as unknown as Record<string, unknown>)
		})

		bench("sha256", () => {
			sha256Hash(testObjects.array)
		})
	})

	// Test with collision configuration enabled
	describe("With Collision Detection", () => {
		bench("structure-id with collision detection", () => {
			getCompactId(testObjects.complex as Record<string, unknown>, {
				newIdOnCollision: true,
			})
		})

		// SHA256 behavior doesn't change with collision detection
		bench("sha256", () => {
			sha256Hash(testObjects.complex)
		})
	})
})
