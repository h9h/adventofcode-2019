const fs = require("fs");
const intCodeProgramm = require('./intCodeProgram').intCodeComputer

const writeOut = (name) => log => {
  fs.writeFileSync(name, log.join('\n'))
}


const readData = (filename) => {
  return fs
    .readFileSync(filename, 'utf8')
}

console.log(readData('./input.txt'))

const key = (x,y) => `${x},${y}`

const addPoint = map => (x,y,color) => {
  map.set(key(x,y), color)
}

console.log('Add point', addPoint(new Map())(1,1,1))

const newDirection = (direction, turn) => 'NESW'[('NESW'.indexOf(direction) + (turn === 0 ? 3 : 5)) % 4]
console.log(newDirection('N', 0))
console.log(newDirection('N', 1))
console.log(newDirection('W', 0))
console.log(newDirection('W', 1))

const newPoint = (x, y, direction) => {
  switch(direction){
    case 'N':
      return [x, y - 1]
    case 'E':
      return [x + 1, y]
    case 'S':
      return [x, y + 1]
    case 'W':
      return [x - 1, y]
    default:
      throw new Error('Lost my way')
  }
}

const plot = (map, painted) => {
  const [minX, maxX, minY, maxY] = [...map.entries()].reduce(([minX, maxX, minY, maxY], [key, _]) => {
    const [x,y] = key.split(',').map(Number)
    return [Math.min(x, minX), Math.max(x, maxX), Math.min(y, minY), Math.max(y, maxY)]
  }, [Number.MAX_SAFE_INTEGER,0, Number.MAX_SAFE_INTEGER,0])

  const signal = Array(maxY - minY + 1).fill(0).map(_ => Array(maxX - minX +1).fill(' '));

  [...painted.entries()].forEach(([key, _]) => {
    const [x,y] = key.split(',').map(Number)
    signal[y - minY][x - minX] = '█'
  })

  return signal.map(l => l.join(''))
}

const work = data => initialColor => {
  const map = new Map()
  const p = addPoint(map)
  p(0,0,initialColor)

  const robot = intCodeProgramm(data)

  let [x,y] = [0,0]
  let painted = new Set()
  let direction = 'N'
  let stepNr = 0

  let log

  try {
    while (true) {
      let input = [BigInt(map.get(key(x, y)))]
      console.log('Input', input)

      const [outputs, opCode, returnLog] = robot(input)
      log = returnLog
      if (opCode === 'ERROR') {
        throw new Error(outputs)
      }
      console.log('Step', ++stepNr, outputs, opCode)

      if (opCode === 99n) break

      const [color, turn] = outputs.map(Number)
      p(x, y, color) // paint current panel
      if (color === 1) painted.add(key(x, y))
      console.log('No of Painted', painted.size)

      direction = newDirection(direction, turn)
      const [a, b] = newPoint(x, y, direction)
      x = a
      y = b

      const newColor = map.has(key(x, y)) ? map.get(key(x, y)) : 0
      p(x, y, newColor) // goto new panel
    }
    console.log('Painted = visited:', painted.size)
    log.push('Painted = visited:', painted.size)

  } catch (e) {
    console.log('ERROR', e)
  } finally {
    writeOut(`log-${initialColor}.txt`)(log)
    writeOut(`plot-${initialColor}.txt`)(plot(map, painted))
  }
}

console.log('================= Part 1 ==================')
work(readData('./input.txt'))(0)

console.log('================= Part 2 ==================')
work(readData('./input.txt'))(1)

