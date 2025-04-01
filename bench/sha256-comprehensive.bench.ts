import { test, bench, describe, beforeAll, beforeEach } from "vitest"
import { getCompactId, resetState } from "../src/index"
import { createHash } from "node:crypto"

// Helper to measure memory usage
const getMemoryUsage = (): number => {
	if (typeof process !== "undefined" && process.memoryUsage) {
		return process.memoryUsage().heapUsed / 1024 / 1024 // MB
	}
	return 0 // Fallback for browsers
}

// Test object generator for consistent test cases
const generateTestObject = (
	depth: number,
	breadth: number,
): Record<string, unknown> => {
	if (depth <= 0) {
		return { value: Math.random() }
	}

	const obj: Record<string, unknown> = {}

	// Add properties
	for (let i = 0; i < breadth; i++) {
		const key = `prop${i}`

		// Mix different types of values
		if (i % 4 === 0) {
			// Nested object
			obj[key] = generateTestObject(depth - 1, breadth)
		} else if (i % 4 === 1) {
			// Array of primitive values
			obj[key] = Array.from({ length: breadth }, (_, j) => `item${j}`)
		} else if (i % 4 === 2) {
			// Array of objects
			obj[key] = Array.from(
				{ length: Math.max(1, Math.floor(breadth / 2)) },
				(_, j) =>
					generateTestObject(
						Math.max(0, depth - 2),
						Math.max(1, Math.floor(breadth / 2)),
					),
			)
		} else {
			// Primitive value
			obj[key] = `value${i}`
		}
	}

	return obj
}

// Generate test cases with varying complexity
const testCases = {
	small: generateTestObject(2, 3), // Depth: 2, Breadth: 3
	medium: generateTestObject(3, 5), // Depth: 3, Breadth: 5
	large: generateTestObject(4, 8), // Depth: 4, Breadth: 8
	xlarge: generateTestObject(5, 10), // Depth: 5, Breadth: 10
}

// Number of iterations for each benchmark
const ITERATIONS = 1000

// SHA256 hash function
const sha256Hash = (obj: unknown): string => {
	const stringified = JSON.stringify(obj)
	return createHash("sha256").update(stringified).digest("hex")
}

// Perform setup before benchmarks
beforeAll(() => {
	console.log("Test case sizes (JSON string length):")
	for (const [name, obj] of Object.entries(testCases)) {
		console.log(`${name}: ${JSON.stringify(obj).length} characters`)
	}
})

describe("Performance Benchmarks", () => {
	// Reset structure-id state before each benchmark
	beforeEach(() => {
		resetState()
	})

	describe("Small Object", () => {
		bench("structure-id", () => {
			for (let i = 0; i < ITERATIONS; i++) {
				getCompactId(testCases.small)
			}
		})

		bench("sha256", () => {
			for (let i = 0; i < ITERATIONS; i++) {
				sha256Hash(testCases.small)
			}
		})
	})

	describe("Medium Object", () => {
		bench("structure-id", () => {
			for (let i = 0; i < ITERATIONS; i++) {
				getCompactId(testCases.medium)
			}
		})

		bench("sha256", () => {
			for (let i = 0; i < ITERATIONS; i++) {
				sha256Hash(testCases.medium)
			}
		})
	})

	describe("Large Object", () => {
		bench("structure-id", () => {
			for (let i = 0; i < ITERATIONS; i++) {
				getCompactId(testCases.large)
			}
		})

		bench("sha256", () => {
			for (let i = 0; i < ITERATIONS; i++) {
				sha256Hash(testCases.large)
			}
		})
	})

	describe("Extra Large Object", () => {
		bench("structure-id", () => {
			for (let i = 0; i < ITERATIONS; i++) {
				getCompactId(testCases.xlarge)
			}
		})

		bench("sha256", () => {
			for (let i = 0; i < ITERATIONS; i++) {
				sha256Hash(testCases.xlarge)
			}
		})
	})
})

describe("Memory Impact Tests", () => {
	// Run multiple iterations to measure memory impact
	test("structure-id memory impact", () => {
		resetState()

		const startMemory = getMemoryUsage()
		console.log(`Starting memory: ${startMemory.toFixed(2)} MB`)

		// Run 10,000 operations with structure-id
		for (let i = 0; i < 10000; i++) {
			getCompactId(testCases.medium)
		}

		const endMemory = getMemoryUsage()
		console.log(`Ending memory: ${endMemory.toFixed(2)} MB`)
		console.log(
			`Memory impact (structure-id): ${(endMemory - startMemory).toFixed(2)} MB`,
		)
	})

	test("sha256 memory impact", () => {
		const startMemory = getMemoryUsage()
		console.log(`Starting memory: ${startMemory.toFixed(2)} MB`)

		// Run 10,000 operations with sha256
		for (let i = 0; i < 10000; i++) {
			sha256Hash(testCases.medium)
		}

		const endMemory = getMemoryUsage()
		console.log(`Ending memory: ${endMemory.toFixed(2)} MB`)
		console.log(
			`Memory impact (sha256): ${(endMemory - startMemory).toFixed(2)} MB`,
		)
	})
})

// Test object comparison
describe("Identical Structure Tests", () => {
	test("structure-id vs sha256 for objects with same structure but different values", () => {
		// Create objects with identical structure but different values
		const obj1 = { a: 1, b: "test", c: { d: true } }
		const obj2 = { a: 2, b: "other", c: { d: false } }

		// Get IDs for both approaches
		const structureId1 = getCompactId(obj1)
		const structureId2 = getCompactId(obj2)

		const sha1 = sha256Hash(obj1)
		const sha2 = sha256Hash(obj2)

		console.log("Object 1:", obj1)
		console.log("Object 2:", obj2)
		console.log("Structure-ID 1:", structureId1)
		console.log("Structure-ID 2:", structureId2)
		console.log("SHA256 1:", sha1)
		console.log("SHA256 2:", sha2)

		// structure-id should produce identical IDs for objects with same structure
		console.log("Structure-IDs match:", structureId1 === structureId2)

		// SHA256 should produce different hashes
		console.log("SHA256 hashes match:", sha1 === sha2)
	})
})
