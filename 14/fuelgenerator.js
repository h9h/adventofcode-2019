const fs = require('fs')

const getComponent = text => {
	const [amount, name] = text.trim().split(' ').map(c => c.trim())
	return [name, Number(amount)]
}

const getFormula = text => {
	const [componentsText, fuelText] = text.trim().split('=>')
	const ingredients = componentsText.split(',').map(getComponent).reduce((acc, [name, coefficient]) => {
		acc[name] = coefficient
		return acc
	}, {})
	const [name, produced] = getComponent(fuelText)
	const product = {[name]: produced}
	return [ingredients, product]
}

const readFormulas = (filename) => {
	return fs
		.readFileSync(filename, 'utf8')
		.split(/\r?\n/)
		.filter(t => t !== '')
		.map(getFormula)
}

const test1 = readFormulas('./test1.txt')
console.log(test1)

const getProductionFunction = formulas => name => {
	return formulas.filter(([_, output]) => output[name])[0]
	// <== this is where it breaks, if more formulas produce the same substance
	// if that were the case, one could try get a tree of backtracking
	// and find the minimum
}

const calculateOres = (formulas, fuel = 1) => {
	const substances = {FUEL: fuel}

	getProduction = getProductionFunction(formulas)

	while (!(Object.values(substances).filter(v => v > 0).length === 1 && substances.ORE)) {
		for ([productName, targetAmount] of Object.entries(substances)) {
			if (productName === 'ORE' || targetAmount === 0) continue

			const [ingredients, produced] = getProduction(productName)

			const fraction = Math.ceil(targetAmount / produced[productName])

			Object.entries(ingredients).forEach(([ingredient, coefficient]) => {
				substances[ingredient] = (substances[ingredient] ? substances[ingredient] : 0) + coefficient * fraction
			})
			substances[productName] -= produced[productName] * fraction
		}
	}

	console.log(substances)
	return substances.ORE
}

console.log('===================== TEST 1 ================')
console.log(calculateOres(test1))

console.log('===================== TEST 2 ================')
console.log(calculateOres(readFormulas('test2.txt')))

console.log('===================== TEST 3 ================')
console.log(calculateOres(readFormulas('test3.txt')))

console.log('===================== TEST 4 ================')
console.log(calculateOres(readFormulas('test4.txt')))

console.log('===================== TEST 5 ================')
console.log(calculateOres(readFormulas('test5.txt')))

console.log('===================== PART 1 ================')
const data = readFormulas('input.txt')
const antwort = calculateOres(data, 1)
console.log('Antwort Teil1: ', antwort)

console.log('===================== PART 2 ================')

const ore = 1000000000000

let upperBound = 1
while (calculateOres(data, upperBound) <= ore) {
	upperBound *= 10;
}

let lowerBound = upperBound / 10;

while (lowerBound !== upperBound) {
	const guess = lowerBound + Math.floor((upperBound - lowerBound) / 2);
	if (calculateOres(data, guess) <= ore) {
		lowerBound = guess;
	} else {
		upperBound = guess - 1;
	}
	console.log(lowerBound, upperBound)
}

console.log('Part 2:', lowerBound, upperBound)

