const fs = require('fs')
const util = require('util')

const readDataLines = (filename) => {
	return fs
		.readFileSync(filename, 'utf8')
		.trim()
		.split(/\r\n/)
		.map(l => l.trim())
}

const point = (x, y) => `${x},${y}`
const xy = point => point.split(',').map(Number)

const reachableKeys = (grid, start, havekeys) => {
	const bfs = [ start ]
	const distance = { [start]: 0 }
	const keys = {}

	while(bfs.length) {
		const h = bfs.shift();

		[[-1,0], [1,0], [0,-1], [0,1]].forEach(([deltaRow, deltaCol]) => {
			const [row, col] = xy(h)
			const [newRow, newCol] = [row + deltaRow, col + deltaCol]

			const c = grid[newRow][newCol]

			if (c === '#') return
			const pt = point(newRow, newCol)
			if (distance[pt]) return
			distance[pt] = distance[h] + 1
			if ('A' <= c && c <= 'Z' && havekeys.indexOf(c.toLowerCase()) < 0) return
			if ('a' <= c && c <= 'z' && havekeys.indexOf(c) < 0) {
				keys[c] = [distance[pt], pt]
			} else {
				bfs.push(pt)
			}
		})
	}

	return keys
}

const reachable4 = (grid, starts, havekeys) => {
	const keys = {}
	starts.forEach((start, i) => {
		for (let [ch, [distance, point]] of Object.entries(reachableKeys(grid, start, havekeys))) {
			keys[ch] = [distance, point, i]
		}
	})

	return keys
}

const seen = {}
keyPoint = (point, keys) => `${point}:${keys}`

const minwalk = (grid, starts, havekeys) => {
	const hks = [...havekeys].sort().join('')

	if (seen[keyPoint(starts, hks)]) return seen[keyPoint(start, hks)]

	if (Object.keys(seen).length % 10 === 0) console.log(hks)

	const keys = reachable4(grid, starts, havekeys)
	if (keys.length === 0) return 0

	const poss = []
	for (let [ ch, [distance, point, roi]] of Object.entries(keys)) {
		const nstarts = [...starts]
		nstarts[roi] = point
		poss.push(distance + minwalk(grid, nstarts, havekeys + ch))
	}
	const ans = Math.min(...poss)

	return ans
}

const lines = readDataLines('input.txt')

const starts = []

const grid = lines.map((l, row) =>
	[...l].map((c, col) => {
		if (c === '@') starts.push(point(row, col))
		return c
	})
)

console.log(minwalk(grid, starts, ''))
