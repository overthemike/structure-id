import { generateStructureId, getStructureInfo, setStructureIdConfig } from "."

setStructureIdConfig({
	newIdOnCollision: true,
})

const obj = {
	name: "mike",
	age: 30,
}

const obj2 = {
	name: "jon",
	age: 20,
}

const config = {
	newIdOnCollision: true,
}

console.log(generateStructureId(obj))
console.log(generateStructureId(obj2))

console.log(getStructureInfo(obj))
console.log(getStructureInfo(obj2))
