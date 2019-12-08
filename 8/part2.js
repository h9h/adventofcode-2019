const fs = require("fs");
const input = fs
	.readFileSync("./input.txt", "utf8")
	.split("")
	.map(Number);

const width = 25
const height = 6

const getLayers = (width, height) => data => {
	const nrOfLayers = data.length / width / height
	return Array(nrOfLayers).fill(1).map((_,i) => {
		return data.slice(i * width * height, (i+1) * width * height)
	})
}
const layers = getLayers(width, height)(input)

const getEffectiveBit = layers => position => {
	let color = 2
	let layerIndex = 0
	while (color === 2 && layerIndex < layers.length) {
		color = layers[layerIndex][position]
		layerIndex++
	}
	return color === 0 ? ' ' : color
}

const getImage = layers => Array(layers[0].length).fill(1).map((_,index) => getEffectiveBit(layers)(index))
const testData = '0222112222120000'.split('').map(Number)
console.log('Test Layers', getLayers(2,2)(testData))
console.log('Test Image', getImage(getLayers(2,2)(testData)))

const image = getImage(layers).join('')
const printImage = Array(height).fill(1).map((_, i) => image.substring(i * width, (i+1) * width))
console.log(printImage)
