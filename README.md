# structure-id

A lightweight, robust library for generating unique identifiers for JavaScript/TypeScript objects based on their structure rather than requiring explicit string keys.

## Purpose

This library provides a solution for scenarios where you need to:

- Persist and rehydrate state without requiring explicit string keys
- Identify structurally identical objects across different instances
- Match objects by their shape rather than by identity or manual keys
- Detect circular references safely

## Installation

```bash
npm install structure-id
```

## Basic Usage

```typescript
import { generateStructureId } from 'structure-id';

// Example object
const user = {
  name: 'John',
  age: 30,
  preferences: {
    theme: 'dark',
    notifications: true
  }
};

// Generate a unique ID based on the object structure
const id = generateStructureId(user);
console.log(id); // "L0:3713-L1:5761-L2:13827"

// Same structure = same ID, regardless of values
const anotherUser = {
  name: 'Alice',
  age: 25,
  preferences: {
    theme: 'light',
    notifications: false
  }
};

const id2 = generateStructureId(anotherUser);
console.log(id === id2); // true (because the structure is identical)

// Different structure = different ID
const differentStructure = {
  name: 'Bob',
  age: 40,
  settings: { // Different property name
    theme: 'dark'
  }
};

const id3 = generateStructureId(differentStructure);
console.log(id === id3); // false (because the structure is different)
```

## API Reference

### `generateStructureId(obj: Record<string, any>): string`

Generates a unique ID string based on the structure of the provided object.

- **Parameters**:
  - `obj`: The object to generate an ID for.
- **Returns**: A string representing the structure ID.

### `getStructureInfo(obj: Record<string, any>): { id: string; levels: number; }`

Provides additional information about the object's structure.

- **Parameters**:
  - `obj`: The object to analyze.
- **Returns**: An object containing:
  - `id`: The structure ID.
  - `levels`: The number of nesting levels in the object.

### `resetState(): void`

Resets the internal state of the library, clearing all cached property mappings.

**Note**: You typically don't need to call this unless you want to start fresh with property-to-bit mappings.

## How It Works

The library uses a bit-wise approach to generate structure IDs:

1. Each JavaScript type gets a unique bit value (`number`, `string`, `object`, etc.)
2. Each property name gets a unique bit value the first time it's encountered
3. These bit values are consistently used for the same types and property names
4. The object is traversed, and hash values are calculated for each level of nesting
5. The final ID is formed by combining these level hashes

This approach ensures:
- Identical structures get identical IDs
- Different structures get different IDs
- The algorithm works correctly with circular references
- Property order doesn't affect the generated ID

## Performance Considerations

- The library maintains a global mapping of property names to bit values, which grows as more unique property names are encountered
- For very large or complex objects, the bit values might become quite large (using BigInt internally)
- Circular references are handled efficiently without stack overflows

## License

MIT
