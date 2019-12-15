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

	// Merke besuchte Koordinaten
	const visited = {}

	try {
		// Speicher, um zu einem gegebenen Punkt einen Programmstand vorhalten zu können:
		// - Koordinaten [x,y]
		// - Anzahl der Schritt bis zu diesem Punkt: steps
		// - Programm-Zustand an dem Punkt
		const queue = []
		queue.push({x: 0, y: 0, steps: 0, program})

		let found = false

		while (!found) {
			// Hole nächsten Punkt und Zustand dazu
			const current = queue.shift()

			if (!visited[key(current.x, current.y)]) {
				// Den Punkt werden wir jetzt abarbeiten
				visited[key(current.x, current.y)] = true

				// Erzeuge eine Kopie des aktuellen Zustands zum Punkt [x,y]
				const currentProgram = current.program
				const steps = current.steps + 1

				// Probiere jede Richtung aus
				for (let direction = 1; direction <= 4; direction++) {
					const newX = current.x + getDelta(direction)[0]
					const newY = current.y + getDelta(direction)[1]

					// ... aufsetzend auf dem Zustand an der Koordinate [x,y]
					const newProgram = currentProgram.cloneProgram()

					const [outputs] = newProgram([direction])

					if (outputs[0] === 2n) {
						// Oxygen gefunden!
						// Ergebnis und raus
						console.log('Steps', steps)
						found = true

					} else if (outputs[0] === 0n) {
						// (newX, newY) ist eine Wand, hier müssen wir nicht weitermachen
						visited[key(newX, newY)] = true

					} else {
						// freie Fahrt!
						// Enqueue den Zustand, damit wir von hier wieder alle Richtungen erkunden
						queue.push({x: newX, y: newY, steps, program: newProgram})
					}
				}
			}
		}
	} catch (e) {
		console.log('ERROR', e)
	}

	console.log(plot(visited))
}

const plot = (map) => {
	const [minX, maxX, minY, maxY] = Object.entries(map).reduce(([minX, maxX, minY, maxY], [key, _]) => {
		const [x,y] = key.split(',').map(Number)
		return [Math.min(x, minX), Math.max(x, maxX), Math.min(y, minY), Math.max(y, maxY)]
	}, [Number.MAX_SAFE_INTEGER,0, Number.MAX_SAFE_INTEGER,0])

	const grid = Array(maxY - minY + 1).fill(0).map(_ => Array(maxX - minX +1).fill(' '));

	Object.entries(map).forEach(([key, value]) => {
		const [x,y] = key.split(',').map(Number)
		if (value) grid[y - minY][x - minX] = '.'
	})

	return grid.map(l => l.join(''))
}

console.log('================= Part 1 ==================')
work(readData('./input.txt'))
