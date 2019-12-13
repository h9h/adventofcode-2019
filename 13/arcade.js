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

const addPoint = map => (x,y,tileId) => {
  map.set(key(x,y), tileId)
}

console.log('Add point', addPoint(new Map())(1,1,1))

const getTile = tileId => {
  switch(tileId) {
    case 0:
      return ' '
    case 1:
      return 'X'
    case 2:
      return '█'
    case 3:
      return '-'
    case 4:
      return 'o'
    default:
      throw new Error(`Unknown TileId ${tileId}`)
  }
}

const plot = (map) => {
  const [minX, maxX, minY, maxY] = [...map.entries()].reduce(([minX, maxX, minY, maxY], [key, _]) => {
    const [x,y] = key.split(',').map(Number)
    return [Math.min(x, minX), Math.max(x, maxX), Math.min(y, minY), Math.max(y, maxY)]
  }, [Number.MAX_SAFE_INTEGER,0, Number.MAX_SAFE_INTEGER,0])

  const game = Array(maxY - minY + 1).fill(0).map(_ => Array(maxX - minX +1).fill(' '));

  [...map.entries()].forEach(([key, tileId]) => {
    const [x,y] = key.split(',').map(Number)
    game[y - minY][x - minX] = getTile(tileId)
  })

  return game.map(l => l.join(''))
}

const countBlocks = map => {
  let count = 0;
  [...map.entries()].forEach(([_, tileId]) => {
    if (tileId === 2) count++
  })
  return count
}
const work = data => {
  const map = new Map()
  const p = addPoint(map)

  const arcade = intCodeProgramm(data)

  let log
  let stepNr = 0

  try {
    while (true) {
      let input = []

      const [outputs, opCode, returnLog] = arcade(input)
      log = returnLog
      if (opCode === 'ERROR') {
        throw new Error(outputs)
      }
      console.log('Step', ++stepNr, outputs, opCode)

      if (opCode === 99n) break

      const [newX, newY, tileId] = outputs.map(Number)
      p(newX, newY, tileId) // paint tile
    }
  } catch (e) {
    console.log('ERROR', e)
  } finally {
    writeOut(`log.txt`)(log)
    writeOut(`plot.txt`)(plot(map))
    console.log('Nr. of blocks: ', countBlocks(map))
  }
}

console.log('================= Part 1 ==================')
work(readData('./input.txt'))
