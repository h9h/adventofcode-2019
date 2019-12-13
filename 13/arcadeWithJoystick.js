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

  const arcade = intCodeProgramm(data, { insertQuarter: true })
  const plotToConsole = false

  let stepNr = 0
  let score = -1

  // wir müssen den Paddle Richtung Ball bewegen, also brauchen wir x-Position von Paddle und Ball
  let xBall = 0
  let xPaddle = 0

  let input = []

  try {
    while (true) {
      const [outputs, opCode, log] = arcade(input)

      if (opCode === 99n) {
        writeOut(`log-joystick.txt`)(log)
        writeOut(`plot-joystick.txt`)(plot(map))
        break
      }
      if (opCode === true) {
        writeOut(`log-joystick-error.txt`)(log)
        console.log('ERROR', e)
        break
      }

      console.log('Step', ++stepNr, outputs, opCode)

      const [newX, newY, tileId] = outputs.map(Number)

      if (newX === -1 && newY === 0) {
        score = tileId
        console.log('SCORE: ', score)
      } else {
        p(newX, newY, tileId) // paint tile

        if (plotToConsole) {
          console.clear()
          console.log(plot(map))
        }
      }

      if (tileId === 3) xPaddle = newX
      if (tileId === 4) xBall = newX
      if (tileId === 3 || tileId === 4) {
        input = [BigInt(Math.sign(xBall - xPaddle))]
      }
    }
  } catch (e) {
    console.log('Caught Error', e)
  } finally {
    console.log('Nr. of blocks: ', countBlocks(map))
  }
}

console.log('================= Part 1 ==================')
work(readData('./input.txt'))
