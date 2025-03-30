import { generateStructureId, setStructureIdConfig } from "."

setStructureIdConfig({
	newIdOnCollision: true,
})

const obj = {
	name: "Jon",
	age: 30,
}

const obj2 = {
	name: "anna",
	age: 31,
}

const id = generateStructureId(obj)
const id2 = generateStructureId(obj2)

console.log(id, id2)
