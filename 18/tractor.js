const fs = require('fs')
const util = require('util')

const readDataLines = (filename) => {
  return fs
    .readFileSync(filename, 'utf8')
    .trim()
    .split(/\r\n/)
    .map(l => l.trim())
}

const key = (x, y) => `${x},${y}`

function* range(start, end) {
  yield start;
  if (start === end) return;
  yield* range(start + 1, end);
}

const KEYS = [...range(97, 122)].map(n => String.fromCharCode(n)).join('')
console.log(KEYS)

const createGrid = lines => {
  const positionsKey = {}
  let positionEntrance = null

  const grid = lines.map((l, row) => [...l].map((c, col) => {
    if (KEYS.indexOf(c) > -1) positionsKey[c] = [row, col]
    if (c === '@') positionEntrance = [row, col]
    return c
  }))

  positionsKey['@'] = positionEntrance
  return [grid, positionsKey]
}

// console.log(createGrid(readDataLines('input.txt')))

const createVisited = (grid, keys) => {
  return visited = grid.map((l, row) => l.map((c, col) => {
    if (c === '#') return true
    if (keys.indexOf(c) > -1) return true
    return keys.toUpperCase().indexOf(c) > -1;
  }))
}

const calculateShortestDistance = visited => (source, target) => {
  const queue = []

  const [zielRow, zielCol] = target

  const [row, col] = source
  queue.push({row, col, distance: 0})

  while(queue.length > 0) {
    const current = queue.shift()
    debugger
    visited[current.row][current.col] = true

    if (current.row === zielRow && current.col === zielCol) return current.distance;

    [[-1,0], [1,0], [0,-1], [0,1]].forEach(([deltaRow, deltaCol]) => {
      const [newRow, newCol] = [current.row + deltaRow, current.col + deltaCol]
      if (visited[newRow][newCol] && !(newRow === zielRow && newCol === zielCol)) return

      queue.push({row: newRow, col: newCol, distance: current.distance + 1})
    })
  }
  return -1
}

const getPossibleTargets = (grid, positionsKey) => (keys, source) => {
  console.log('getPossibleTargets', keys, source)
  const targets = [];

  [...keys].forEach(k => {
    const visited = createVisited(grid, keys)
    const dist = calculateShortestDistance(visited)(positionsKey[source], positionsKey[k])
    if (dist > 0) targets.push({ source: k, distance: dist })
  })

  return targets
}

const part1 = filename => {
  // lese grid
  const [grid, positionsKey] = createGrid(readDataLines(filename))
  //console.log(grid)

  const calculateTree = (level, grid, positionsKey) => (keys, tree) => {
    level++
    if (level > 3) return
    keys = keys.replace(tree.source, '')
    if (keys.length === 0) return
    const children = getPossibleTargets(grid, positionsKey)(keys, tree.source)
    children.forEach(child => calculateTree(level, grid, positionsKey)(keys, child))
    tree.children = children
  }

  const keys = KEYS
  const tree = { source: '@' }

  const level = 0
  calculateTree(level, grid, positionsKey)(keys, tree)

  console.log(util.inspect(tree, false, null))
}

part1('input.txt')
