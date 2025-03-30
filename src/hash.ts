export function murmurHash3(str: string): string {
	const seed = 0
	const c1 = 0xcc9e2d51
	const c2 = 0x1b873593
	const r1 = 15
	const r2 = 13
	const m = 5
	const n = 0xe6546b64

	let hash = seed

	// Convert string to UTF-8 bytes
	const data = new TextEncoder().encode(str)
	const len = data.length
	const nblocks = Math.floor(len / 4)

	// Process blocks of 4 bytes
	for (let i = 0; i < nblocks; i++) {
		let k =
			data[i * 4] |
			(data[i * 4 + 1] << 8) |
			(data[i * 4 + 2] << 16) |
			(data[i * 4 + 3] << 24)

		k = Math.imul(k, c1)
		k = (k << r1) | (k >>> (32 - r1))
		k = Math.imul(k, c2)

		hash ^= k
		hash = (hash << r2) | (hash >>> (32 - r2))
		hash = Math.imul(hash, m) + n
	}

	// Process remaining bytes
	let k = 0
	const remaining = len - nblocks * 4
	const offset = nblocks * 4

	if (remaining === 3) {
		k ^= data[offset + 2] << 16
	}
	if (remaining >= 2) {
		k ^= data[offset + 1] << 8
	}
	if (remaining >= 1) {
		k ^= data[offset]
		k = Math.imul(k, c1)
		k = (k << r1) | (k >>> (32 - r1))
		k = Math.imul(k, c2)
		hash ^= k
	}

	// Finalize
	hash ^= len
	hash ^= hash >>> 16
	hash = Math.imul(hash, 0x85ebca6b)
	hash ^= hash >>> 13
	hash = Math.imul(hash, 0xc2b2ae35)
	hash ^= hash >>> 16

	return (hash >>> 0).toString(16)
}
