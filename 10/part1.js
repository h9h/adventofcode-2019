const fs = require("fs");

const readData = (filename) => {
  return fs
    .readFileSync(filename, 'utf8')
    .split(/\r?\n/)
    .filter(l => l !== '')
    .map(l => l.split(''))
}

const test1 = readData('./test1.txt')
console.log(test1)
const test2 = readData('./test2.txt')
const input = readData('./input.txt')

const readPoint = data => ([x, y]) => data[y][x]
console.log(readPoint(test1)([0,1]))

// Range of numbers
function* rangeGen(start, end) {
  const inc = start < end ? 1 : -1
  yield start;
  if (start === end - inc) return;
  yield* range(start + inc, end);
}

const range = (start, end) => [...rangeGen(start, end)]
console.log('Ranges', range(0,5), range(5,0))

// Grösster gemeinsamer Teiler
const ggt = (a,b) => b === 0 ? a : ggt(b, a % b)
console.log('ggt', ggt(6,3), ggt(5,2), ggt(2,5), ggt(0,2))

const gitterpunkte = ([x1, y1], [x2, y2]) => {
  if (x1 === x2 && y1 === y2) return []
  if (x1 === x2) return range(y1, y2).map(y => [x1, y]).filter(([x,y]) => y !== y1)
  if (y1 === y2) return range(x1, x2).map(x => [x, y1]).filter(([x,y]) => x !== x1)

  const g = Math.abs(ggt(x2 -x1, y2 - y1))
  const result = []
  const [deltaX, deltaY] = [(x2 - x1)/g, (y2 - y1)/g]
  let [xNew, yNew] = [x1 + deltaX, y1 + deltaY]

  while(x2 !== xNew) {
    result.push([xNew, yNew])
    xNew += deltaX
    yNew += deltaY
  }

  return result
}

const testpunkte = [
  [0, 1], [0, 4],
  [0, 1], [2, 0],
  [0, 1], [2, 1],
  [0, 1], [2, 2],
  [0, 1], [2, 3],
  [0, 1], [2, 4],
  [0, 1], [3, 4],
  [0, 1], [4, 3],
  [0, 1], [4, 4],
  [0, 1], [0, 1]
]
for(let i = 0; i < testpunkte.length; i += 2) {
  console.log('Gitterpunkte ', testpunkte[i], testpunkte[i+1], gitterpunkte(testpunkte[i], testpunkte[i+1]))
}

const hasSight = data => ([x1, y1], [x2, y2]) => {
  if (x1 === x2 && y1 === y2) return false
  const mapPoint = readPoint(data)
  if (mapPoint([x2, y2]) !== '#') return false // Endpunkt ist kein Asteroid

  const punkte = gitterpunkte([x1, y1], [x2, y2])
  const hits = punkte.filter(p => mapPoint(p) === '#')
  return hits.length === 0
}

const test1Sight = hasSight(test1)
for(let i = 0; i < testpunkte.length; i += 2) {
  console.log('Sight ', testpunkte[i], testpunkte[i+1], test1Sight(testpunkte[i], testpunkte[i+1]))
}

const nrSightsPerPoint = data => ([x, y]) => {
  if (readPoint(data)([x,y]) !== '#') return 0

  let count = 0
  const testSight = hasSight(data)
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[0].length; j++) {
      if (testSight([x, y], [i, j])) count++
    }
  }
  return count
}
console.log('Nr of Sights', [0,1], nrSightsPerPoint(test1)([0,1]))

const nrSights = data => {
  const result = JSON.parse(JSON.stringify(data))
  const nrSightsData = nrSightsPerPoint(data)
  let max = 0
  let bestPoint = [-1, -1]

  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[0].length; j++) {
      result[i][j] = nrSightsData([i, j])
      if (result[i][j] > max) {
        max = result[i][j]
        bestPoint = [i, j]
      }
    }
  }

  return { result, bestPoint, max }
}
console.log(nrSights(test1))

const { bestPoint, max } = nrSights(input)

const winkel = ([x1, y1], [x2, y2]) => (Math.atan2(y1 - y2, x1 - x2) * 180 / Math.PI + 270) % 360

// Da wir mehr Asteroiden in der direkten Line of Sight haben als 200 reicht ein Umlauf
// wir müssen nicht "hinter vordere Treffer" schauen
const alleTreffer = data => bestPoint => {
  const testSight = hasSight(data)
  const treffer = []
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[0].length; j++) {
      if (testSight(bestPoint, [i, j])) {
        treffer.push({ winkel: winkel(bestPoint, [i, j]), point: [i, j]})
      }
    }
  }

  return treffer
}

const ergebnisse = data => {
  console.log('=================================================================')
  const { bestPoint, max } = nrSights(data)
  console.log({ bestPoint, max })
  const alle = alleTreffer(data)(bestPoint)
  const alleSortiertNachWinkel = alle.sort((h1, h2) => Math.sign(h1.winkel - h2.winkel))

  console.log(alleSortiertNachWinkel)
  console.log(alleSortiertNachWinkel[199])
}

ergebnisse(test2)
ergebnisse(input)
