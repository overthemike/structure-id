import { describe, test, expect, beforeEach } from "vitest"
import {
  getStructureInfo,
  resetState,
  setStructureIdConfig,
  OBJECT_ID_CACHE,
  generateStructureId,
} from "../src/index"

// This test specifically targets line 452 in index.ts, which is the only remaining line not covered
describe("Coverage for Line 452", () => {
  beforeEach(() => {
    resetState()
  })

  test("should directly hit the uncached object branch in getStructureInfo", () => {
    // The specific line we need to cover is in getStructureInfo:
    // id = OBJECT_ID_CACHE.has(obj)
    //   ? (OBJECT_ID_CACHE.get(obj) as string)
    //   : generateStructureId(obj, { newIdOnCollision: false })
    
    // We need to ensure:
    // 1. newIdOnCollision is false
    // 2. The object is not in OBJECT_ID_CACHE
    // 3. The code path through the getStructureInfo function reaches this line
    
    // Set up necessary conditions
    setStructureIdConfig({ newIdOnCollision: false })
    
    // Create a unique object that won't be in any caches
    const uniqueKey = `unique-${Date.now()}-${Math.random()}`
    const uniqueObj = { [uniqueKey]: "value" }
    
    // Double-check it's not in the cache
    expect(OBJECT_ID_CACHE.has(uniqueObj)).toBe(false)
    
    // Call getStructureInfo which should hit the specific branch
    // This will cause line 452 to be executed to generate a fresh ID
    const info = getStructureInfo(uniqueObj)
    
    // Verify we got a valid result
    expect(info).toHaveProperty("id")
    expect(typeof info.id).toBe("string")
    expect(info.id.length).toBeGreaterThan(0)
    
    // Extra verification - the ID should match what generateStructureId produces
    const expectedId = generateStructureId(uniqueObj, { newIdOnCollision: false })
    expect(info.id).toBe(expectedId)
  })

  test("should cover the branch with custom conditions", () => {
    // Alternative approach targeting the same line
    setStructureIdConfig({ newIdOnCollision: false })
    
    // Create two structurally identical objects
    const obj1 = { a: 1, b: 2 }
    const obj2 = { a: 1, b: 2 } // Same structure but different reference
    
    // First, put obj1 in the cache by generating its ID
    const id1 = generateStructureId(obj1)
    
    // Now call getStructureInfo on obj2
    // Since obj2 is not in the cache (different reference), it should hit line 452
    const info = getStructureInfo(obj2)
    
    // Verify the function worked correctly
    expect(info.id).toBe(id1) // Should be same ID due to structural equality
  })
})