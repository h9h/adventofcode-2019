const fs = require('fs')
const intCodeProgramm = require('./intCodeProgram').intCodeComputer

const readData = (filename) => {
	return fs
		.readFileSync(filename, 'utf8')
}

const key = (x, y) => `${x},${y}`

const getDelta = direction => {
	switch (direction) {
		case 1: // N
			return [0, -1]
		case 2: // S
			return [0, 1]
		case 3: // W
			return [-1, 0]
		case 4: // E
			return [1, 0]
	}
}

const work = data => {
	const program = intCodeProgramm(data, {debug: false, stopAt: -1})

	// Wie in Part 1
	const visitedForwards = {}

	// Speicher für alle Koordinaten, die Wand sind
	const wand = {}

	// Merke den Ort wo Oxygen System steht
	let oxygenX
	let oxygenY

	try {
		const queue = []
		queue.push({x: 0, y: 0, steps: 0, program})

		while (queue.length) {
			const current = queue.shift()

			if (!visitedForwards[key(current.x, current.y)]) {
				visitedForwards[key(current.x, current.y)] = true

				const currentProgram = current.program
				const steps = current.steps + 1

				for (let direction = 1; direction <= 4; direction++) {
					const [deltaX, deltaY] = getDelta(direction)
					const newX = current.x + deltaX
					const newY = current.y + deltaY

					const newProgram = currentProgram.cloneProgram()

					const [outputs] = newProgram([direction])

					if (outputs[0] === 2n) {
						visitedForwards[key(newX, newY)] = true
						oxygenX = newX
						oxygenY = newY
					} else if (outputs[0] === 0n) {
						visitedForwards[key(newX, newY)] = true
						wand[key(newX, newY)] = true
					} else {
						queue.push({x: newX, y: newY, steps, program: newProgram})
					}
				}
			}
		}
	} catch (e) {
		console.log('ERROR', e)
	}

	// Starte am Punkt des Oxygen Generators
	const queue = []
	queue.push({x: oxygenX, y: oxygenY, minutes: 0})

	const visitedBackwards = {}
	let maxMinutes = 0

	while (queue.length) {
		const current = queue.shift()

		if(visitedBackwards[key(current.x, current.y)]) continue
		visitedBackwards[key(current.x, current.y)] = true

		// Falls Wand, weiter
		if (wand[key(current.x, current.y)]) continue
		// Falls nicht auf Pfad aus Part1, weiter
		if (!visitedForwards[key(current.x, current.y)]) continue

		// Ansonsten rechne
		maxMinutes = Math.max(current.minutes, maxMinutes)
		console.log(`Max Minutes: ${maxMinutes}`)

		// Backtracke bis alle Nicht-Wände besichtigt
		for(let direction = 1; direction <= 4; direction++) {
			const [deltaX, deltaY]  = getDelta(direction)
			queue.push({x: current.x + deltaX, y: current.y + deltaY, minutes: current.minutes + 1})
		}
	}

	console.log(maxMinutes)
}

console.log('================= Part 2 ==================')
work(readData('./input.txt'))
