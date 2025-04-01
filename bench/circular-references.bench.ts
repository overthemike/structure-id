import { bench, describe } from "vitest"
import { getCompactId } from "../src/index"
import { createHash } from "node:crypto"

// Create test objects with circular references
const createCircularObjects = () => {
  // Simple circular reference
  const simpleCircular: Record<string, any> = {
    id: 1,
    name: "simple circular"
  }
  simpleCircular.self = simpleCircular

  // Nested circular reference
  const nestedCircular: Record<string, any> = {
    id: 2,
    name: "nested circular",
    level1: {
      level2: {
        level3: {}
      }
    }
  }
  nestedCircular.level1.level2.level3.back = nestedCircular

  // Multiple circular references
  const obj1: Record<string, any> = { id: 3, name: "obj1" }
  const obj2: Record<string, any> = { id: 4, name: "obj2" }
  const obj3: Record<string, any> = { id: 5, name: "obj3" }
  
  obj1.ref = obj2
  obj2.ref = obj3
  obj3.ref = obj1
  
  // Complex object with arrays and circular references
  const complexCircular: Record<string, any> = {
    id: 6,
    name: "complex circular",
    users: [
      { id: 1, name: "User 1" },
      { id: 2, name: "User 2" }
    ],
    metadata: {
      created: new Date().toISOString(),
      version: "1.0.0"
    }
  }
  complexCircular.users[0].parent = complexCircular
  complexCircular.self = complexCircular

  return {
    simpleCircular,
    nestedCircular,
    circularChain: obj1,
    complexCircular
  }
}

const testObjects = createCircularObjects()

// Modified SHA256 hash function that handles circular references
const sha256HashWithCircularHandling = (obj: unknown): string => {
  // Use a WeakMap to keep track of seen objects and break circular references
  const seen = new WeakMap()
  
  const stringify = (value: any): string => {
    // Handle primitive values
    if (value === null) return 'null'
    if (typeof value !== 'object') return JSON.stringify(value)
    
    // Handle circular references
    if (seen.has(value)) {
      return '"[Circular]"'
    }
    
    seen.set(value, true)
    
    // Handle arrays
    if (Array.isArray(value)) {
      const items = value.map(item => stringify(item))
      return `[${items.join(',')}]`
    }
    
    // Handle objects
    const entries = Object.entries(value)
      .map(([key, val]) => `"${key}":${stringify(val)}`)
      .sort() // Sort keys for consistent hashing
    
    return `{${entries.join(',')}}`
  }

  const stringified = stringify(obj)
  return createHash("sha256").update(stringified).digest("hex")
}

describe("Structure-ID vs SHA256 with Circular References Benchmarks", () => {
  describe("Simple Circular Reference", () => {
    bench("structure-id", () => {
      getCompactId(testObjects.simpleCircular)
    })

    bench("sha256 with circular handling", () => {
      sha256HashWithCircularHandling(testObjects.simpleCircular)
    })
  })

  describe("Nested Circular Reference", () => {
    bench("structure-id", () => {
      getCompactId(testObjects.nestedCircular)
    })

    bench("sha256 with circular handling", () => {
      sha256HashWithCircularHandling(testObjects.nestedCircular)
    })
  })

  describe("Circular Reference Chain", () => {
    bench("structure-id", () => {
      getCompactId(testObjects.circularChain)
    })

    bench("sha256 with circular handling", () => {
      sha256HashWithCircularHandling(testObjects.circularChain)
    })
  })

  describe("Complex Object with Circular References", () => {
    bench("structure-id", () => {
      getCompactId(testObjects.complexCircular)
    })

    bench("sha256 with circular handling", () => {
      sha256HashWithCircularHandling(testObjects.complexCircular)
    })
  })

  // Test with collision configuration enabled
  describe("With Collision Detection", () => {
    bench("structure-id with collision detection", () => {
      getCompactId(testObjects.complexCircular, {
        newIdOnCollision: true,
      })
    })

    bench("sha256 with circular handling", () => {
      sha256HashWithCircularHandling(testObjects.complexCircular)
    })
  })
})