import { generateStructureId } from "./src"

const object1 = {
	prop1: "text",
	prop2: 3,
	prop3: {
		someBoolean: false,
	},
}

const object2 = {
	prop1: "other text",
	prop2: 123,
	prop3: {
		someBoolean: true,
	},
}

const object3 = {
	prop1: 2,
	prop2: "foobar",
	prop3: {
		someBoolean: false,
	},
}

const id1 = generateStructureId(object1)
const id2 = generateStructureId(object2)
const id3 = generateStructureId(object3)

console.log(`
  ${id1}
  ${id2}
  ${id3}
`)
