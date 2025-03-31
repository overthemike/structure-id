import { hash } from "./hash"

const compact = (str: string): string => hash(str)
/**
 * Structure-ID: Generate unique IDs based on object structure
 */

// Initialize TYPE_BITS with fixed values
const TYPE_BITS: Record<string, bigint> = {
	root: 0n,
	number: 1n,
	string: 2n,
	boolean: 4n,
	bigint: 8n,
	null: 16n,
	undefined: 32n,
	symbol: 64n,
	object: 128n,
	array: 256n,
}

// Global key map for persistent property-to-bit mapping
export const GLOBAL_KEY_MAP = new Map<string, bigint>()

// Cache to track structure hashes and their collision counts
export const STRUCTURE_HASH_COUNTER = new Map<string, number>()

// Cache for object reference to structure ID mapping (memoization)
export let OBJECT_ID_CACHE = new WeakMap<object, string>()

// Cache for structure signature mapping (to detect identical structures)
export let OBJECT_SIGNATURE_CACHE = new WeakMap<object, string>()

// Cache for structure info results
export let STRUCTURE_INFO_CACHE = new WeakMap<
	object,
	{
		id: string
		levels: number
		collisionCount: number
	}
>()

// Global counters for consistent IDs
let nextBit = 512n

// Function to get the next bit value
const getNextBit = (): bigint => {
	const bit = nextBit
	nextBit <<= 1n
	return bit
}

// Type checks
const isObject = (x: unknown): x is object =>
	typeof x === "object" && x !== null && !Array.isArray(x)

/**
 * Get or create a bit for a key (using the global map)
 */
const getBit = (key: string): bigint => {
	if (!GLOBAL_KEY_MAP.has(key)) {
		GLOBAL_KEY_MAP.set(key, getNextBit())
	}
	return GLOBAL_KEY_MAP.get(key) as bigint
}

// Configuration type for ID generation
export interface StructureIdConfig {
	/**
	 * When true, generates a new unique ID if the same structure is encountered again
	 */
	newIdOnCollision?: boolean
}

// Global configuration
let globalConfig: StructureIdConfig = {
	newIdOnCollision: false,
}

/**
 * Set global configuration for structure ID generation
 */
export function setStructureIdConfig(config: StructureIdConfig): void {
	globalConfig = { ...config }
}

/**
 * Get the current global configuration
 */
export function getStructureIdConfig(): StructureIdConfig {
	return { ...globalConfig }
}

/**
 * Generate a structure ID for an object
 */
export const generateStructureId = (
	obj: unknown,
	config?: StructureIdConfig,
): string => {
	// Use provided config or fall back to global config
	const effectiveConfig = config || globalConfig

	// Type check for primitives - WeakMap requires object keys
	if (typeof obj !== "object" || obj === null) {
		// Handle primitives with a fallback implementation
		return `L0:0-L1:${TYPE_BITS[typeof obj] || 0n}`
	}

	// Quick optimization: Check if we've already calculated an ID for this exact object reference
	// Only use cache if we're not using collision handling, since collision handling requires tracking unique IDs
	if (!effectiveConfig?.newIdOnCollision && OBJECT_ID_CACHE.has(obj)) {
		return OBJECT_ID_CACHE.get(obj) as string
	}

	// Maps to track object instances (for circular references)
	const objectMap = new Map<object, string>()

	// Track structure by level
	const levelHashes: Record<number, bigint> = {}

	/**
	 * Get the type of a value
	 */
	const getType = (value: unknown): string => {
		if (value === null) return "null"
		if (value === undefined) return "undefined"
		if (Array.isArray(value)) return "array"
		return typeof value
	}

	/**
	 * Calculate an object's path signature for consistent circular reference detection
	 */
	const getObjectSignature = (obj: object, path: string[]): string => {
		const type = Array.isArray(obj) ? "array" : "object"

		if (type === "object") {
			// For objects, use sorted keys
			const keys = Object.keys(obj).sort().join(",")
			return `${path.join(".")}.{${keys}}`
		}

		// For arrays, use length
		return `${path.join(".")}.[${(obj as unknown[]).length}]`
	}

	/**
	 * Process a value and calculate its structure hash
	 */
	const processStructure = (
		value: unknown,
		level = 0,
		path: string[] = [],
	): void => {
		// Initialize level hash if needed
		if (!levelHashes[level]) {
			levelHashes[level] = BigInt(1 << level)
		}

		const type = getType(value)

		// Add type bit to level hash
		levelHashes[level] += TYPE_BITS[type] || 0n

		// For primitives, we're done
		if (type !== "object" && type !== "array") {
			return
		}

		// Handle circular references
		if (isObject(value) || Array.isArray(value)) {
			const objValue = value as object
			const objSig = getObjectSignature(objValue, path)

			if (objectMap.has(objValue)) {
				// We've seen this exact object before (circular reference)
				const circularPath = objectMap.get(objValue)
				levelHashes[level] += getBit(`circular:${circularPath}`)
				return
			}

			// Mark this object as visited with its path
			objectMap.set(objValue, objSig)

			// Add object type to hash
			const objTypeBit = getBit(`type:${type}`)
			levelHashes[level] += objTypeBit

			if (type === "object") {
				// Process object properties
				const objValue = value as Record<string, unknown>

				// Sort keys for consistent ordering
				const keys = Object.keys(objValue).sort()

				// Add keys to level hash
				for (const key of keys) {
					const keyBit = getBit(key)
					levelHashes[level] += keyBit

					// Process property at next level
					processStructure(objValue[key], level + 1, [...path, key])
				}
			} else if (type === "array") {
				// Process array items
				const arrayValue = value as unknown[]

				// Add array length to hash
				const lengthBit = getBit(`length:${arrayValue.length}`)
				levelHashes[level] += lengthBit

				// Process each item
				for (let i = 0; i < arrayValue.length; i++) {
					const indexBit = getBit(`[${i}]`)
					levelHashes[level] += indexBit

					// Process array item at next level
					processStructure(arrayValue[i], level + 1, [...path, `[${i}]`])
				}
			}
		}
	}

	// Process the root object
	processStructure(obj)

	// Generate a structure signature for collision detection
	// This includes all levels except L0
	const structureLevels = Object.entries(levelHashes)
		.filter(([level]) => Number(level) > 0)
		.sort(([a], [b]) => Number(a) - Number(b))
		.map(([level, hash]) => `L${level}:${hash}`)

	const structureSignature = structureLevels.join("-")

	// Store the structure signature for this object
	if (typeof obj === "object" && obj !== null) {
		OBJECT_SIGNATURE_CACHE.set(obj, structureSignature)
	}

	// Handle collisions if configured
	if (effectiveConfig?.newIdOnCollision) {
		let collisionCount = 0

		// Check if we've seen this structure before
		if (STRUCTURE_HASH_COUNTER.has(structureSignature)) {
			// Get the current count and increment it
			const currentCount = STRUCTURE_HASH_COUNTER.get(structureSignature)
			collisionCount = currentCount !== undefined ? currentCount + 1 : 0
			STRUCTURE_HASH_COUNTER.set(structureSignature, collisionCount)
		} else {
			// First time seeing this structure
			STRUCTURE_HASH_COUNTER.set(structureSignature, 0)
		}

		// Set L0 to the collision count (starts at 0 for first occurrence)
		const l0Hash = BigInt(collisionCount)
		levelHashes[0] = l0Hash
	}

	// Convert all level hashes to the final structure ID
	const idParts = Object.entries(levelHashes)
		.sort(([a], [b]) => Number(a) - Number(b))
		.map(([level, hash]) => `L${level}:${hash}`)

	const finalId = idParts.join("-")

	// Cache the generated ID for this exact object reference (only for non-collision cases)
	// For collision handling, we need to generate unique IDs each time
	if (
		!effectiveConfig?.newIdOnCollision &&
		typeof obj === "object" &&
		obj !== null
	) {
		OBJECT_ID_CACHE.set(obj, finalId)
	}

	// Clear structure info cache for this object since we've generated a new ID
	if (
		typeof obj === "object" &&
		obj !== null &&
		STRUCTURE_INFO_CACHE.has(obj)
	) {
		STRUCTURE_INFO_CACHE.delete(obj)
	}

	return finalId
}

/**
 * Calculate the number of levels from an ID
 */
function calculateIdLevels(id: string): number {
	// Count the number of level indicators (L0, L1, etc.)
	return id.split("-").length
}

/**
 * Get the structure info for an object without incrementing the collision counter
 */
export function getStructureInfo(
	obj: Record<string, unknown>,
	config?: StructureIdConfig,
): {
	id: string
	levels: number
	collisionCount: number
} {
	// Use provided config or fall back to global config
	const effectiveConfig = config || globalConfig

	// Type check for primitives
	if (typeof obj !== "object" || obj === null) {
		const id = generateStructureId(obj, { newIdOnCollision: false })
		return {
			id,
			levels: calculateIdLevels(id),
			collisionCount: 0,
		}
	}

	// Check if we've already calculated structure info for this exact object
	if (STRUCTURE_INFO_CACHE.has(obj)) {
		return STRUCTURE_INFO_CACHE.get(obj) as {
			id: string
			levels: number
			collisionCount: number
		}
	}

	// Get or calculate the structure signature for this object
	const structureSignature = OBJECT_SIGNATURE_CACHE.has(obj)
		? (OBJECT_SIGNATURE_CACHE.get(obj) as string)
		: generateStructureId(obj, { newIdOnCollision: false })
				.split("-")
				.slice(1)
				.join("-")

	// Get the current collision count for this structure without incrementing
	// Get the current collision count for this structure without incrementing or adding entries
	const collisionCount = STRUCTURE_HASH_COUNTER.get(structureSignature) || 0

	// Determine the ID to return based on collision handling setting
	let id: string
	if (effectiveConfig.newIdOnCollision) {
		// Create ID with the current collision count
		const l0Part = `L0:${collisionCount}`
		id = [l0Part, structureSignature].join("-")
	} else {
		// For no collision handling, use cached ID or generate directly
		id = OBJECT_ID_CACHE.has(obj)
			? (OBJECT_ID_CACHE.get(obj) as string)
			: generateStructureId(obj, { newIdOnCollision: false })
	}

	// Calculate levels from the ID
	const levels = calculateIdLevels(id)

	// Create the result object
	const result = {
		id,
		levels,
		collisionCount,
	}

	// Cache the result for future calls
	STRUCTURE_INFO_CACHE.set(obj, result)

	return result
}

/**
 * Reset internal state for generating new IDs
 * This does NOT reset the global configuration
 */
export function resetState(): void {
	GLOBAL_KEY_MAP.clear()
	STRUCTURE_HASH_COUNTER.clear()

	// Clear caches when resetting state
	OBJECT_ID_CACHE = new WeakMap<object, string>()
	OBJECT_SIGNATURE_CACHE = new WeakMap<object, string>()
	STRUCTURE_INFO_CACHE = new WeakMap<
		object,
		{
			id: string
			levels: number
			collisionCount: number
		}
	>()

	// we need to start at 512 here because 0-256 holds the native js types
	nextBit = 512n
}

export const getCompactId = (
	obj: Record<string, unknown>,
	config?: StructureIdConfig,
): string => {
	// Use the existing function
	const fullId = generateStructureId(obj, config)

	// Apply compact function
	return compact(fullId)
}

export const getCompactInfo = (
	obj: Record<string, unknown>,
	config?: StructureIdConfig,
): {
	id: string
	levels: number
	collisionCount: number
} => {
	const info = getStructureInfo(obj, config)

	info.id = compact(info.id)

	return info
}
