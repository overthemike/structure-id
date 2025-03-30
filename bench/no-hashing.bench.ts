import { bench, describe } from "vitest"
import { murmurHash3, xxHash32 } from "../src/hash"

// Test data with different string lengths
const testStrings = {
	small: "hello world",
	medium: "The quick brown fox jumps over the lazy dog",
	large: "a".repeat(1000),
}

// Simple identity function (no hashing)
const noHash = (str: string): string => str

describe("Hashing vs No Hashing Benchmarks", () => {
	describe("Small String", () => {
		bench("No hashing", () => {
			noHash(testStrings.small)
		})

		bench("murmurHash3", () => {
			murmurHash3(testStrings.small)
		})

		bench("xxHash32", () => {
			xxHash32(testStrings.small)
		})
	})

	describe("Medium String", () => {
		bench("No hashing", () => {
			noHash(testStrings.medium)
		})

		bench("murmurHash3", () => {
			murmurHash3(testStrings.medium)
		})

		bench("xxHash32", () => {
			xxHash32(testStrings.medium)
		})
	})

	describe("Large String (1,000 chars)", () => {
		bench("No hashing", () => {
			noHash(testStrings.large)
		})

		bench("murmurHash3", () => {
			murmurHash3(testStrings.large)
		})

		bench("xxHash32", () => {
			xxHash32(testStrings.large)
		})
	})
})
