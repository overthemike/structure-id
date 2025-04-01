import { describe, test, expect, beforeEach } from "vitest"
import {
  generateStructureId,
  setStructureIdConfig,
  resetState,
} from "../src/index"

describe("Collision Handling Tests", () => {
  beforeEach(() => {
    resetState()
    setStructureIdConfig({ newIdOnCollision: false }) // Default
  })

  test("should use different L0 hash when newIdOnCollision is enabled", () => {
    // This test targets lines 264-273
    
    // First, with collision handling disabled
    setStructureIdConfig({ newIdOnCollision: false })
    
    const obj1 = { test: true }
    const obj2 = { test: false } // Structurally identical
    
    const id1WithoutCollision = generateStructureId(obj1)
    const id2WithoutCollision = generateStructureId(obj2)
    
    // Without collision handling, structurally identical objects should get same ID
    expect(id1WithoutCollision).toBe(id2WithoutCollision)
    
    // Reset state for clean test
    resetState()
    
    // Now with collision handling enabled
    setStructureIdConfig({ newIdOnCollision: true })
    
    const obj3 = { test: true }
    const obj4 = { test: false } // Structurally identical
    
    const id1WithCollision = generateStructureId(obj3)
    const id2WithCollision = generateStructureId(obj4)
    
    // With collision handling, structurally identical objects should get different IDs
    expect(id1WithCollision).not.toBe(id2WithCollision)
    
    // Split IDs to verify L0 part is different but structure parts (L1+) are the same
    const id1Parts = id1WithCollision.split("-")
    const id2Parts = id2WithCollision.split("-")
    
    // L0 part should be different
    expect(id1Parts[0]).not.toBe(id2Parts[0])
    
    // Structure parts (L1+) should be the same
    const id1Structure = id1Parts.slice(1).join("-")
    const id2Structure = id2Parts.slice(1).join("-")
    expect(id1Structure).toBe(id2Structure)
  })
})