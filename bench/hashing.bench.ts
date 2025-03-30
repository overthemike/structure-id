import { bench, describe } from "vitest"
import { murmurHash3, xxHash32 } from "../src/hash"

// Test data with different string lengths
const testStrings = {
	empty: "",
	small: "hello world",
	medium: "The quick brown fox jumps over the lazy dog",
	large: "a".repeat(1000),
	veryLarge: "b".repeat(10000),
	unicode: "こんにちは世界！Здравствуй Мир!你好世界！",
}

describe("Hash Function Benchmarks", () => {
	// Group tests by string size for better comparison
	describe("Empty String", () => {
		bench("murmurHash3", () => {
			murmurHash3(testStrings.empty)
		})

		bench("xxHash32", () => {
			xxHash32(testStrings.empty)
		})
	})

	describe("Small String", () => {
		bench("murmurHash3", () => {
			murmurHash3(testStrings.small)
		})

		bench("xxHash32", () => {
			xxHash32(testStrings.small)
		})
	})

	describe("Medium String", () => {
		bench("murmurHash3", () => {
			murmurHash3(testStrings.medium)
		})

		bench("xxHash32", () => {
			xxHash32(testStrings.medium)
		})
	})

	describe("Large String (1,000 chars)", () => {
		bench("murmurHash3", () => {
			murmurHash3(testStrings.large)
		})

		bench("xxHash32", () => {
			xxHash32(testStrings.large)
		})
	})

	describe("Very Large String (10,000 chars)", () => {
		bench("murmurHash3", () => {
			murmurHash3(testStrings.veryLarge)
		})

		bench("xxHash32", () => {
			xxHash32(testStrings.veryLarge)
		})
	})

	describe("Unicode String", () => {
		bench("murmurHash3", () => {
			murmurHash3(testStrings.unicode)
		})

		bench("xxHash32", () => {
			xxHash32(testStrings.unicode)
		})
	})
})
