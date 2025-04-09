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

// Seed for L0 hash - changes on each reset to ensure different IDs after reset
export let RESET_SEED = 0

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
	const emptyObj = isObject(obj) && Object.keys(obj).length === 0
	const emptyArr = Array.isArray(obj) && (obj as unknown[]).length === 0

	if (emptyObj) return "{}"
	if (emptyArr) return "[]"

	// Use provided config or fall back to global config
	const effectiveConfig = config || globalConfig

	// Type check for primitives - WeakMap requires object keys
	if (typeof obj !== "object" || obj === null) {
		// Handle primitives with a fallback implementation
		return `L0:${TYPE_BITS[typeof obj] || 0n}-L1:${TYPE_BITS[typeof obj] || 0n}`
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

			// Check if this is a root-level (level 0) empty collection
			const isRootLevel = level === 0
			const isEmpty =
				(isObject(value) && Object.keys(value as object).length === 0) ||
				(Array.isArray(value) && (value as unknown[]).length === 0)

			// Apply the multiplier approach for non-empty collections or non-root empty collections
			if (!isRootLevel || !isEmpty) {
				if (type === "object") {
					// Process object properties
					const objValue = value as Record<string, unknown>

					// Sort keys for consistent ordering
					const keys = Object.keys(objValue).sort()

					let multiplier = 1n
					// Add keys to level hash
					for (const key of keys) {
						const propType = getType(objValue[key])
						const keyBit = getBit(key)
						levelHashes[level] += keyBit * multiplier

						// Add type information with the same multiplier
						levelHashes[level] += (TYPE_BITS[propType] || 0n) * multiplier

						// Increment multiplier for next property
						multiplier++

						// Process property at next level
						processStructure(objValue[key], level + 1, [...path, key])
					}
				} else if (type === "array") {
					// Process array items
					const arrayValue = value as unknown[]

					// Add array length to hash
					const lengthBit = getBit(`length:${arrayValue.length}`)
					levelHashes[level] += lengthBit

					let multiplier = 1n
					// Process each item
					for (let i = 0; i < arrayValue.length; i++) {
						const itemType = getType(arrayValue[i])
						const indexBit = getBit(`[${i}]`)
						levelHashes[level] += indexBit * multiplier

						// Add type information with the same multiplier
						levelHashes[level] += (TYPE_BITS[itemType] || 0n) * multiplier

						// Increment multiplier
						multiplier++

						// Process array item at next level
						processStructure(arrayValue[i], level + 1, [...path, `[${i}]`])
					}
				}
			}
			// For root-level empty collections, we don't need to do any further processing
			// The type bits added above will ensure they get different IDs
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

	// Get the current count from the counter map (or 0 if not seen before)
	const currentCount = STRUCTURE_HASH_COUNTER.get(structureSignature) ?? 0

	// For L0 value, use either:
	// 1. Just the counter value if collision handling is enabled (to ensure different IDs)
	// 2. The original L0 hash (which contains structure type information) if collision handling is disabled
	if (effectiveConfig?.newIdOnCollision) {
		// When collision handling is enabled, use only the counter for the L0 value
		// to ensure each instance gets a unique ID
		levelHashes[0] = BigInt(currentCount)

		// Increment the counter
		STRUCTURE_HASH_COUNTER.set(structureSignature, currentCount + 1)
	}
	// Otherwise we keep the L0 hash as is - already properly set in processStructure

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
 * Get the structure signature for an object without generating an ID or updating counters
 * This is the key functionality needed for pre-registering structures
 */
export function getStructureSignature(obj: unknown): string {
	if (typeof obj !== "object" || obj === null) {
		// For primitives, fall back to a simple signature
		return `type:${typeof obj}`
	}

	// If we've already calculated a signature for this object, return it
	if (OBJECT_SIGNATURE_CACHE.has(obj)) {
		return OBJECT_SIGNATURE_CACHE.get(obj) as string
	}

	// Otherwise, generate the structure ID without collision handling
	// and extract the signature (everything after the L0 part)
	const tempId = generateStructureId(obj, { newIdOnCollision: false })
	const signature = tempId.split("-").slice(1).join("-")

	// Store this signature for the object
	OBJECT_SIGNATURE_CACHE.set(obj, signature)

	return signature
}

/**
 * Pre-register a structure to set its collision counter
 * This allows you to ensure the next ID generated for this structure
 * will start at the specified count
 */
export function registerStructure(obj: unknown, collisionCount: number): void {
	const signature = getStructureSignature(obj)
	STRUCTURE_HASH_COUNTER.set(signature, collisionCount)
}

/**
 * Register multiple structures at once with their collision counts
 */
export function registerStructures(
	registrations: Array<{
		structure: unknown
		count: number
	}>,
): void {
	for (const { structure, count } of registrations) {
		registerStructure(structure, count)
	}
}

/**
 * Register known structure signatures with their collision counts
 * This is useful when you have the signatures but not the original objects
 */
export interface StructureRegistration {
	signature: string
	count: number
}

export function registerStructureSignatures(
	signatures: Array<StructureRegistration>,
): void {
	for (const { signature, count } of signatures) {
		STRUCTURE_HASH_COUNTER.set(signature, count)
	}
}

/**
 * Get the structure info for an object without incrementing the collision counter
 */
export function getStructureInfo(
	obj: unknown,
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
	// Return the counter directly - no adjustments needed
	const collisionCount = STRUCTURE_HASH_COUNTER.get(structureSignature) || 0

	// Determine the ID to return based on collision handling setting
	let id: string
	if (effectiveConfig.newIdOnCollision) {
		// When collision handling is enabled, use only the counter for the L0 value
		// to ensure each instance gets a unique ID
		const l0Hash = BigInt(collisionCount)
		const l0Part = `L0:${l0Hash}`
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

	// Generate a new random seed to ensure different IDs after reset
	RESET_SEED = Math.floor(Math.random() * 10000)

	// we need to start at 512 here because 0-256 holds the native js types
	nextBit = 512n
}

/**
 * Export the current structure ID state for persistence
 */
export interface StructureState {
	keyMap: Record<string, string> // key -> bigint as string
	collisionCounters: Record<string, number> // structure signature -> collision count
}

export function exportStructureState(): StructureState {
	// Convert the key map to serializable format (bigint -> string)
	const keyMap: Record<string, string> = {}
	for (const [key, value] of GLOBAL_KEY_MAP.entries()) {
		keyMap[key] = value.toString()
	}

	// Convert the collision counter to serializable format
	const collisionCounters: Record<string, number> = {}
	for (const [signature, count] of STRUCTURE_HASH_COUNTER.entries()) {
		collisionCounters[signature] = count
	}

	return {
		keyMap,
		collisionCounters,
	}
}

/**
 * Import a previously exported structure ID state
 */
export function importStructureState(state: StructureState): void {
	// Clear existing state first
	resetState()

	// Restore key map
	for (const [key, valueStr] of Object.entries(state.keyMap)) {
		GLOBAL_KEY_MAP.set(key, BigInt(valueStr))
	}

	// Restore collision counters
	for (const [signature, count] of Object.entries(state.collisionCounters)) {
		STRUCTURE_HASH_COUNTER.set(signature, count)
	}

	// Update the nextBit to be greater than any existing bit
	let maxBit = 512n
	for (const bitStr of Object.values(state.keyMap)) {
		const bit = BigInt(bitStr)
		if (bit > maxBit) {
			maxBit = bit
		}
	}

	// Set nextBit to the next power of 2
	nextBit = maxBit << 1n
}

export const getCompactId = (
	obj: unknown,
	config?: StructureIdConfig,
): string => {
	// Use the existing function
	const fullId = generateStructureId(obj, config)

	// Apply compact function
	return compact(fullId)
}

export const getCompactInfo = (
	obj: unknown,
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
