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

const getTile = tileId => {
  switch(tileId) {
    case 35:
    case 46:
    case 10:
    case 94:
      return String.fromCharCode(tileId)
    default:
      throw new Error(`Unknown TileId ${tileId}`)
  }
}

const key = (x,y) => `${x},${y}`
const xy = key => (key.split(',').map(Number))

const addPoint = map => (x,y,tileId) => {
  map.set(key(x,y), tileId)
}

const createMap = output => {
  const width = output.indexOf('\n')
  const clean = output.replace(/\n/g, '')
  const map = new Map()
  const a = addPoint(map)
  let xyRobot = [0,0]
  let x = 0
  let y = 0
  for(let i = 0; i < clean.length; i++) {
    x = i % width
    y = Math.floor(i / width)
    a(x,y, clean[i])
    if (clean[i] === '^') xyRobot = [x,y]
  }

  return [map, xyRobot]
}

const calculateAlignmentParameter = map => {
  const intersections = [...map.entries()]
    .filter(([_, value]) => value === '#')
    .filter(([k, _]) => {
      const [x, y] = xy(k)
      return map.get(key(x-1, y)) === '#'
        && map.get(key(x+1, y)) === '#'
        && map.get(key(x, y-1)) === '#'
        && map.get(key(x, y+1)) === '#'
    })
  console.log(intersections)

  return intersections.reduce((sum, [k, _]) => {
    const [x,y] = xy(k)
    return sum + x * y
  }, 0)
}

const part1 = data => {
  let output = ''
  let map = null
  let xyRobot = null

  const ascii = intCodeProgramm(data, { debug: false, stopAt: -1 })

  let stepNr = 0

  try {
    while (true) {
      const [outputs, opCode, log] = ascii([])
      if (opCode === true || opCode === 99n) {
        writeOut(`log.txt`)(log)
      }
      if (opCode === true) {
        throw new Error(outputs)
      }
      // console.log('Step', ++stepNr, outputs, opCode)

      if (opCode === 99n) break

      const [char] = outputs.map(Number)

      output += getTile(char)
    }
  } catch (e) {
    console.log('ERROR', e)
  } finally {

    console.log(output)
    const [m, xy] = createMap(output)
    map = m
    xyRobot = xy
    const ap = calculateAlignmentParameter(map)
    console.log(ap)

  }

  return [map, xyRobot]
}

console.log('================= Part 1 ==================')
const [map, xyRobot] = part1(readData('./input.txt'))


console.log('================= Part 2 ==================')

const pfad = 'L,10,R,8,L,6,R,6,L,8,L,8,R,8,L,10,R,8,L,6,R,6,R,8,L,6,L,10,L,10,L,10,R,8,L,6,R,6,L,8,L,8,R,8,R,8,L,6,L,10,L,10,L,8,L,8,R,8,R,8,L,6,L,10,L,10,L,8,L,8,R,8,'

const movementFunctions = [
  'L,10,R,8,L,6,R,6,',
  'L,8,L,8,R,8,',
  'R,8,L,6,L,10,L,10'
].map(s => [...s].map(c => c.charCodeAt(0)).map(Number).concat(10))

const main = 'ABACABCBCB'.split('').join(',').split('').map(c => c.charCodeAt(0)).map(Number).concat(10)


console.log('Main routine:', main)
console.log('Movement Functions: ', movementFunctions)

const part2 = data => {
  let output = ''
  let map = null
  let xyRobot = null

  const ascii = intCodeProgramm(data, { insertQuarter: true, debug: false, stopAt: -1 })

  ascii([])

  {
    console.log('MAIN')
    const [outputs, opCode, log] = ascii(main)
    console.log(log)
    console.log(outputs.map(c => String.fromCharCode(Number(c))))
  }

  movementFunctions.forEach(fnct => {
    console.log('MOVEMENT FUNCTION', fnct)
    const [outputs, opCode, log] = ascii(fnct)
    console.log(outputs)
  })

  {
    console.log('Video Feed?')
    const [outputs, opCode, log] = ascii([110, 10])
    console.log(outputs)
  }

}

part2(readData('./input.txt'))
console.log('n'.charCodeAt(0))
