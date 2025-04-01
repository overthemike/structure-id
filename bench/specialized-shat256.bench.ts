import { bench, describe, test, beforeEach } from "vitest"
import { getCompactId, resetState } from "../src/index"
import { createHash } from "node:crypto"

// SHA256 hash function
const sha256Hash = (obj: unknown): string => {
	const stringified = JSON.stringify(obj)
	return createHash("sha256").update(stringified).digest("hex")
}

// Standalone JSON.stringify benchmark for comparison
const justStringify = (obj: unknown): string => {
	return JSON.stringify(obj)
}

// Test case generator
const createTestCase = (
	props: number,
	depth: number,
	arraySize = 0,
): Record<string, unknown> => {
	const result: Record<string, unknown> = {}

	// Add properties
	for (let i = 0; i < props; i++) {
		if (depth > 1 && i % 3 === 0) {
			// Add nested object
			result[`nested${i}`] = createTestCase(
				Math.max(1, props - 1),
				depth - 1,
				arraySize,
			)
		} else if (arraySize > 0 && i % 3 === 1) {
			// Add array
			result[`array${i}`] = Array.from({ length: arraySize }, (_, j) =>
				depth > 1 ? createTestCase(1, depth - 1) : `item${j}`,
			)
		} else {
			// Add primitive
			result[`prop${i}`] = `value${i}`
		}
	}

	return result
}

// Specialized test cases
const testCases = {
	// Flat objects (width testing)
	flat10: createTestCase(10, 1),
	flat50: createTestCase(50, 1),
	flat100: createTestCase(100, 1),
	flat500: createTestCase(500, 1),

	// Deep objects (depth testing)
	depth3: createTestCase(3, 3),
	depth5: createTestCase(3, 5),
	depth10: createTestCase(2, 10),

	// Array-heavy objects
	arraySmall: createTestCase(3, 2, 10),
	arrayMedium: createTestCase(3, 2, 50),
	arrayLarge: createTestCase(3, 2, 100),

	// Mixed complexity
	mixedMedium: createTestCase(10, 4, 20),
	mixedLarge: createTestCase(20, 5, 30),
}

describe("Width Scaling Benchmarks", () => {
	beforeEach(() => {
		resetState()
	})

	describe("10 Properties", () => {
		bench("structure-id", () => {
			getCompactId(testCases.flat10)
		})

		bench("sha256", () => {
			sha256Hash(testCases.flat10)
		})

		bench("just JSON.stringify", () => {
			justStringify(testCases.flat10)
		})
	})

	describe("50 Properties", () => {
		bench("structure-id", () => {
			getCompactId(testCases.flat50)
		})

		bench("sha256", () => {
			sha256Hash(testCases.flat50)
		})

		bench("just JSON.stringify", () => {
			justStringify(testCases.flat50)
		})
	})

	describe("100 Properties", () => {
		bench("structure-id", () => {
			getCompactId(testCases.flat100)
		})

		bench("sha256", () => {
			sha256Hash(testCases.flat100)
		})

		bench("just JSON.stringify", () => {
			justStringify(testCases.flat100)
		})
	})

	describe("500 Properties", () => {
		bench("structure-id", () => {
			getCompactId(testCases.flat500)
		})

		bench("sha256", () => {
			sha256Hash(testCases.flat500)
		})

		bench("just JSON.stringify", () => {
			justStringify(testCases.flat500)
		})
	})
})

describe("Depth Scaling Benchmarks", () => {
	beforeEach(() => {
		resetState()
	})

	describe("Depth 3", () => {
		bench("structure-id", () => {
			getCompactId(testCases.depth3)
		})

		bench("sha256", () => {
			sha256Hash(testCases.depth3)
		})

		bench("just JSON.stringify", () => {
			justStringify(testCases.depth3)
		})
	})

	describe("Depth 5", () => {
		bench("structure-id", () => {
			getCompactId(testCases.depth5)
		})

		bench("sha256", () => {
			sha256Hash(testCases.depth5)
		})

		bench("just JSON.stringify", () => {
			justStringify(testCases.depth5)
		})
	})

	describe("Depth 10", () => {
		bench("structure-id", () => {
			getCompactId(testCases.depth10)
		})

		bench("sha256", () => {
			sha256Hash(testCases.depth10)
		})

		bench("just JSON.stringify", () => {
			justStringify(testCases.depth10)
		})
	})
})

describe("Array Scaling Benchmarks", () => {
	beforeEach(() => {
		resetState()
	})

	describe("Small Arrays (10 items)", () => {
		bench("structure-id", () => {
			getCompactId(testCases.arraySmall)
		})

		bench("sha256", () => {
			sha256Hash(testCases.arraySmall)
		})

		bench("just JSON.stringify", () => {
			justStringify(testCases.arraySmall)
		})
	})

	describe("Medium Arrays (50 items)", () => {
		bench("structure-id", () => {
			getCompactId(testCases.arrayMedium)
		})

		bench("sha256", () => {
			sha256Hash(testCases.arrayMedium)
		})

		bench("just JSON.stringify", () => {
			justStringify(testCases.arrayMedium)
		})
	})

	describe("Large Arrays (100 items)", () => {
		bench("structure-id", () => {
			getCompactId(testCases.arrayLarge)
		})

		bench("sha256", () => {
			sha256Hash(testCases.arrayLarge)
		})

		bench("just JSON.stringify", () => {
			justStringify(testCases.arrayLarge)
		})
	})
})

describe("Repeated Execution (Caching Effect)", () => {
	beforeEach(() => {
		resetState()
	})

	describe("First Run", () => {
		bench("structure-id", () => {
			getCompactId(testCases.mixedMedium)
		})

		bench("sha256", () => {
			sha256Hash(testCases.mixedMedium)
		})
	})

	describe("Repeated Runs (Same Object Instance)", () => {
		bench(
			"structure-id x10",
			() => {
				for (let i = 0; i < 10; i++) {
					getCompactId(testCases.mixedMedium)
				}
			},
			{ iterations: 100 },
		)

		bench(
			"sha256 x10",
			() => {
				for (let i = 0; i < 10; i++) {
					sha256Hash(testCases.mixedMedium)
				}
			},
			{ iterations: 100 },
		)
	})

	describe("Repeated Runs (Same Structure, Different Instances)", () => {
		bench(
			"structure-id (different instances)",
			() => {
				// Create 10 objects with the same structure but different values
				for (let i = 0; i < 10; i++) {
					const obj = JSON.parse(JSON.stringify(testCases.mixedMedium))
					// Modify a few values to make it different
					if (obj.prop1) obj.prop1 = `modified${i}`
					getCompactId(obj)
				}
			},
			{ iterations: 50 },
		)

		bench(
			"sha256 (different instances)",
			() => {
				// Create 10 objects with the same structure but different values
				for (let i = 0; i < 10; i++) {
					const obj = JSON.parse(JSON.stringify(testCases.mixedMedium))
					// Modify a few values to make it different
					if (obj.prop1) obj.prop1 = `modified${i}`
					sha256Hash(obj)
				}
			},
			{ iterations: 50 },
		)
	})
})

describe("Mixed Complexity Objects", () => {
	beforeEach(() => {
		resetState()
	})

	describe("Medium Complexity", () => {
		bench("structure-id", () => {
			getCompactId(testCases.mixedMedium)
		})

		bench("sha256", () => {
			sha256Hash(testCases.mixedMedium)
		})
	})

	describe("High Complexity", () => {
		bench("structure-id", () => {
			getCompactId(testCases.mixedLarge)
		})

		bench("sha256", () => {
			sha256Hash(testCases.mixedLarge)
		})
	})
})

// Test specific behavioral characteristics
describe("Structural Equality Tests", () => {
	beforeEach(() => {
		resetState()
	})

	test("Objects with same structure but different values", () => {
		const obj1 = { a: 1, b: { c: "test" } }
		const obj2 = { a: 2, b: { c: "different" } }

		const structureId1 = getCompactId(obj1)
		const structureId2 = getCompactId(obj2)

		const sha1 = sha256Hash(obj1)
		const sha2 = sha256Hash(obj2)

		console.log("Structure-ID equality:", structureId1 === structureId2)
		console.log("SHA256 equality:", sha1 === sha2)
	})

	test("Objects with same values but different property order", () => {
		const obj1 = { a: 1, b: 2, c: 3 }
		const obj2 = { c: 3, a: 1, b: 2 }

		const structureId1 = getCompactId(obj1)
		const structureId2 = getCompactId(obj2)

		const sha1 = sha256Hash(obj1)
		const sha2 = sha256Hash(obj2)

		console.log("Structure-ID equality:", structureId1 === structureId2)
		console.log("SHA256 equality:", sha1 === sha2)
	})

	test("Objects with circular references", () => {
		const obj1: Record<string, unknown> = { a: 1, b: 2 }
		obj1.self = obj1

		const obj2: Record<string, unknown> = { a: 1, b: 2 }
		obj2.self = obj2

		try {
			const structureId1 = getCompactId(obj1)
			const structureId2 = getCompactId(obj2)
			console.log("Structure-ID handles circular references")
			console.log("Structure-ID equality:", structureId1 === structureId2)
		} catch (e) {
			console.log("Structure-ID failed on circular reference:", e)
		}

		try {
			const sha1 = sha256Hash(obj1)
			const sha2 = sha256Hash(obj2)
			console.log("SHA256 handles circular references")
			console.log("SHA256 equality:", sha1 === sha2)
		} catch (e) {
			console.log("SHA256 failed on circular reference:", e)
		}
	})
})
