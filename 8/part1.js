const fs = require("fs");
const input = fs
	.readFileSync("./input.txt", "utf8")
	.split("")
	.map(Number);

const width = 25
const height = 6

const nrOfLayers = input.length / width / height
console.log('Nr of Layers', nrOfLayers)

const layers = Array(nrOfLayers).fill(1).map((_,i) => {
	const imageData = input.slice(i * width * height, (i+1) * width * height)
	return imageData
})

const countOccurrence = number => layer => layer.filter(bit => bit === number).length

const count0Layers = layers.map(countOccurrence(0))
console.log(count0Layers, Math.min(...count0Layers))

const indexLeast0 = count0Layers.indexOf(Math.min(...count0Layers))
console.log('Layer with least Zeros', indexLeast0)

console.log('Nr of 1s * Nr of 2s', countOccurrence(1)(layers[indexLeast0]) * countOccurrence(2)(layers[indexLeast0]))
