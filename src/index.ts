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
};

// Global key map for persistent property-to-bit mapping
const GLOBAL_KEY_MAP = new Map<string, bigint>();

// Global counters for consistent IDs
let nextBit = 512n;

// Function to get the next bit value
const getNextBit = (): bigint => {
	const bit = nextBit;
	nextBit <<= 1n;
	return bit;
};

// Type checks
const isObject = (x: unknown): x is object =>
	typeof x === "object" && x !== null && !Array.isArray(x);

/**
 * Get or create a bit for a key (using the global map)
 */
const getBit = (key: string): bigint => {
	if (!GLOBAL_KEY_MAP.has(key)) {
		GLOBAL_KEY_MAP.set(key, getNextBit());
	}
	return GLOBAL_KEY_MAP.get(key) as bigint;
};

/**
 * Generate a structure ID for an object
 */
export const generateStructureId = (obj: Record<string, unknown>): string => {
	// Maps to track object instances (for circular references)
	const objectMap = new Map<object, string>();

	// Track structure by level
	const levelHashes: Record<number, bigint> = {};

	/**
	 * Get the type of a value
	 */
	const getType = (value: unknown): string => {
		if (value === null) return "null";
		if (value === undefined) return "undefined";
		if (Array.isArray(value)) return "array";
		return typeof value;
	};

	/**
	 * Calculate an object's path signature for consistent circular reference detection
	 */
	const getObjectSignature = (obj: object, path: string[]): string => {
		const type = Array.isArray(obj) ? "array" : "object";

		if (type === "object") {
			// For objects, use sorted keys
			const keys = Object.keys(obj).sort().join(",");
			return `${path.join(".")}.{${keys}}`;
		}

		// For arrays, use length
		return `${path.join(".")}.[${(obj as unknown[]).length}]`;
	};

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
			levelHashes[level] = BigInt(1 << level);
		}

		const type = getType(value);

		// Add type bit to level hash
		levelHashes[level] += TYPE_BITS[type] || 0n;

		// For primitives, we're done
		if (type !== "object" && type !== "array") {
			return;
		}

		// Handle circular references
		if (isObject(value) || Array.isArray(value)) {
			const objValue = value as object;
			const objSig = getObjectSignature(objValue, path);

			if (objectMap.has(objValue)) {
				// We've seen this exact object before (circular reference)
				const circularPath = objectMap.get(objValue);
				levelHashes[level] += getBit(`circular:${circularPath}`);
				return;
			}

			// Mark this object as visited with its path
			objectMap.set(objValue, objSig);

			// Add object type to hash
			const objTypeBit = getBit(`type:${type}`);
			levelHashes[level] += objTypeBit;

			if (type === "object") {
				// Process object properties
				const objValue = value as Record<string, unknown>;

				// Sort keys for consistent ordering
				const keys = Object.keys(objValue).sort();

				// Add keys to level hash
				for (const key of keys) {
					const keyBit = getBit(key);
					levelHashes[level] += keyBit;

					// Process property at next level
					processStructure(objValue[key], level + 1, [...path, key]);
				}
			} else if (type === "array") {
				// Process array items
				const arrayValue = value as unknown[];

				// Add array length to hash
				const lengthBit = getBit(`length:${arrayValue.length}`);
				levelHashes[level] += lengthBit;

				// Process each item
				for (let i = 0; i < arrayValue.length; i++) {
					const indexBit = getBit(`[${i}]`);
					levelHashes[level] += indexBit;

					// Process array item at next level
					processStructure(arrayValue[i], level + 1, [...path, `[${i}]`]);
				}
			}
		}
	};

	// Process the root object
	processStructure(obj);

	// Convert level hashes to structure ID
	const idParts = Object.entries(levelHashes)
		.sort(([a], [b]) => Number(a) - Number(b))
		.map(([level, hash]) => `L${level}:${hash}`);

	return idParts.join("-");
};

/**
 * Get the structure info for debugging/exploration
 */
export function getStructureInfo(obj: Record<string, unknown>): {
	id: string;
	levels: number;
} {
	const id = generateStructureId(obj);
	const levels = id.split("-").length;

	return {
		id,
		levels,
	};
}

/**
 * Reset state for testing
 */
export function resetState(): void {
	GLOBAL_KEY_MAP.clear();

	// we need to start at 512 here because 0-256 holds the native js types
	nextBit = 512n;
}
