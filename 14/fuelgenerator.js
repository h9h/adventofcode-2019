const fs = require('fs')

const getComponent = text => {
	const [amount, name] = text.trim().split(' ').map(c => c.trim())
	return [name, Number(amount)]
}

const getFormula = text => {
	const [componentsText, fuelText] = text.trim().split('=>')
	const need = componentsText.split(',').map(getComponent).reduce((acc, c) => {
		acc[c[0]] = c[1]
		return acc
	}, {})
	const g = getComponent(fuelText)
	const get = {[g[0]]: g[1]}
	return [need, get]
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

const getNeededFunction = formulas => name => {
	return formulas.filter(([_, output]) => output[name])[0]
}

const calculate = (formulas, fuel = 1) => {
	const need = {FUEL: fuel}

	getNeeded = getNeededFunction(formulas)

	let done = false
	while (!done) {
		for ([name, amount] of Object.entries(need)) {
			if (name === 'ORE') continue
			if (need[name] === 0) continue

			// müssen erzeugen
			const [needed, output] = getNeeded(name)

			const fraction = Math.ceil(need[name] / output[name])

			Object.entries(needed).forEach(([nameNeed, amountNeed]) => {
				if (!need[nameNeed]) need[nameNeed] = 0
				need[nameNeed] += amountNeed * fraction
			})
			need[name] -= output[name] * fraction
		}

		done = Object.values(need).filter(v => v > 0).length === 1 && need.ORE
	}

	console.log(need)
	return need.ORE
}

console.log('===================== TEST 1 ================')
console.log(calculate(test1))

console.log('===================== TEST 2 ================')
console.log(calculate(readFormulas('test2.txt')))

console.log('===================== TEST 3 ================')
console.log(calculate(readFormulas('test3.txt')))

console.log('===================== TEST 4 ================')
console.log(calculate(readFormulas('test4.txt')))

console.log('===================== TEST 5 ================')
console.log(calculate(readFormulas('test5.txt')))

console.log('===================== PART 1 ================')
const data = readFormulas('input.txt')
const antwort = calculate(data, 1)
console.log('Antwort Teil1: ', antwort)

console.log('===================== PART 2 ================')

const ore = 1000000000000

let upperBound = 1
while (calculate(data, upperBound) <= ore) {
	upperBound *= 10;
}

let lowerBound = upperBound / 10;

while (lowerBound !== upperBound) {
	const guess = lowerBound + Math.floor((upperBound - lowerBound) / 2);
	if (calculate(data, guess) <= ore) {
		lowerBound = guess;
	} else {
		upperBound = guess - 1;
	}
	console.log(lowerBound, upperBound)
}

console.log('Part 2:', lowerBound, upperBound)

