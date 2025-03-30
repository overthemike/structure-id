import { describe, test, expect, vi } from "vitest"
import { hash, hashFunction, murmurHash3, xxHash32 } from "../src/hash"

describe("Hash Functions", () => {
	// Test the individual hash functions
	describe("murmurHash3", () => {
		test("should generate consistent hashes for the same input", () => {
			const input = "test-string"
			const result1 = murmurHash3(input)
			const result2 = murmurHash3(input)

			expect(result1).toBe(result2)
		})

		test("should generate different hashes for different inputs", () => {
			const input1 = "test-string-1"
			const input2 = "test-string-2"

			const result1 = murmurHash3(input1)
			const result2 = murmurHash3(input2)

			expect(result1).not.toBe(result2)
		})

		test("should handle empty strings", () => {
			const result = murmurHash3("")
			expect(typeof result).toBe("string")
			// We expect a hex string
			expect(result).toMatch(/^[0-9a-f]+$/)
		})

		test("should handle Unicode characters", () => {
			const result = murmurHash3("测试字符串")
			expect(typeof result).toBe("string")
			expect(result).toMatch(/^[0-9a-f]+$/)
		})
	})

	describe("xxHash32", () => {
		test("should generate consistent hashes for the same input", () => {
			const input = "test-string"
			const result1 = xxHash32(input)
			const result2 = xxHash32(input)

			expect(result1).toBe(result2)
		})

		test("should generate different hashes for different inputs", () => {
			const input1 = "test-string-1"
			const input2 = "test-string-2"

			const result1 = xxHash32(input1)
			const result2 = xxHash32(input2)

			expect(result1).not.toBe(result2)
		})

		test("should handle empty strings", () => {
			const result = xxHash32("")
			expect(typeof result).toBe("string")
			expect(result).toMatch(/^[0-9a-f]+$/)
		})

		test("should handle Unicode characters", () => {
			const result = xxHash32("测试字符串")
			expect(typeof result).toBe("string")
			expect(result).toMatch(/^[0-9a-f]+$/)
		})

		test("should accept Uint8Array as input", () => {
			const stringInput = "test-string"
			const arrayInput = new TextEncoder().encode(stringInput)

			const result1 = xxHash32(stringInput)
			const result2 = xxHash32(arrayInput)

			expect(result1).toBe(result2)
		})

		test("should accept custom seed value", () => {
			const input = "test-string"
			const defaultSeedResult = xxHash32(input)
			const customSeedResult = xxHash32(input, 42)

			expect(defaultSeedResult).not.toBe(customSeedResult)
		})
	})

	// Test the combined hash function
	describe("hash", () => {
		test("should use xxHash32 as default", () => {
			const input = "test-string"
			const expectedResult = xxHash32(input)
			const result = hash(input)

			expect(result).toBe(expectedResult)
		})

		test("should use specified hash function when provided", () => {
			const input = "test-string"
			const expectedResult = murmurHash3(input)
			const result = hash(input, { type: hashFunction.MURMUR })

			expect(result).toBe(expectedResult)
		})

		test("should use custom hash function when provided", () => {
			const input = "test-string"
			const customHash = vi.fn().mockReturnValue("custom-hash-result")

			const result = hash(input, { custom: customHash })

			expect(customHash).toHaveBeenCalledWith(input)
			expect(result).toBe("custom-hash-result")
		})

		test("should prioritize custom function over type", () => {
			const input = "test-string"
			const customHash = vi.fn().mockReturnValue("custom-hash-result")

			const result = hash(input, {
				type: hashFunction.MURMUR,
				custom: customHash,
			})

			expect(customHash).toHaveBeenCalledWith(input)
			expect(result).toBe("custom-hash-result")
		})
	})

	// Test for specific expected output values
	describe("Known hash values", () => {
		const testCases = [
			{ input: "", murmur: "0", xx: "2cc5d05" },
			{ input: "hello", murmur: "248bfa47", xx: "fb0077f9" },
			{ input: "test123", murmur: "b1cde64d", xx: "ff2410ee" },
		]

		for (const { input, murmur, xx } of testCases) {
			test(`murmurHash3 for "${input}"`, () => {
				expect(murmurHash3(input)).toBe(murmur)
			})

			test(`xxHash32 for "${input}"`, () => {
				expect(xxHash32(input)).toBe(xx)
			})
		}
	})

	// Test edge cases
	describe("Edge cases", () => {
		test("hash handles undefined options", () => {
			const input = "test-string"
			const result = hash(input, undefined)
			const expectedResult = xxHash32(input)

			expect(result).toBe(expectedResult)
		})

		test("hash handles null or invalid custom function", () => {
			const input = "test-string"
			// @ts-expect-error - Testing invalid input
			const result = hash(input, { custom: null })
			const expectedResult = xxHash32(input)

			expect(result).toBe(expectedResult)
		})

		test("long input strings", () => {
			// Create a long string
			const longString = "a".repeat(10000)

			// Both hash functions should handle this without errors
			expect(() => murmurHash3(longString)).not.toThrow()
			expect(() => xxHash32(longString)).not.toThrow()
		})

		test("binary data representation", () => {
			// Create an array with specific binary values
			const binaryData = new Uint8Array([
				0xff, 0x00, 0xaa, 0x55, 0x12, 0x34, 0x56, 0x78,
			])

			// xxHash32 should handle Uint8Array input
			expect(() => xxHash32(binaryData)).not.toThrow()
		})
	})

	// Test performance (optional)
	describe("Performance", () => {
		test("hash functions complete in reasonable time", () => {
			const input = "test-string"

			const start1 = performance.now()
			murmurHash3(input)
			const end1 = performance.now()

			const start2 = performance.now()
			xxHash32(input)
			const end2 = performance.now()

			// These are very fast functions, so this is just a sanity check
			expect(end1 - start1).toBeLessThan(5) // less than 5ms
			expect(end2 - start2).toBeLessThan(5) // less than 5ms
		})
	})
})
