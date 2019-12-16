const fs = require('fs')

const readData = (filename) => {
  return fs
    .readFileSync(filename, 'utf8')
    .split('')
    .map(Number)
}

console.log(readData('./input.txt'))

const pattern = [0, 1, 0, -1]

const repeatedPattern = (pattern, positionOut) => {
  return pattern.reduce((acc, p) => {
    acc.push(...Array(positionOut + 1).fill(p))
    return acc
  }, [])
}
const getCoefficient = (pattern, positionOut) => {
  const rp = repeatedPattern(pattern, positionOut)
  return indexIn => rp[(indexIn + 1) % rp.length]
}

console.log(repeatedPattern(pattern, 0))
console.log(repeatedPattern(pattern, 1))

for (let i = 0; i < 10; i++) {
  const coef = getCoefficient(pattern, 1)
  console.log(coef(i))
}

const calculateFFT = (pattern, turns) => data => {
  let result = data
  for (let t = 0; t < turns; t++) {
    result = Array(data.length)
      .fill(0)
      .map((_, position) => {
        const rp = getCoefficient(pattern, position)
        return result.reduce((acc, d, i) => acc + d * rp(i), 0)
      })
      .map(n => (''+n).slice(-1))
  }
  return result
}

console.log('Test1')
{
  const round0 = calculateFFT(pattern, 0)([1,2,3,4,5,6,7,8])
  const round1 = calculateFFT(pattern, 1)([1,2,3,4,5,6,7,8])
  console.log(round0, round1)
}

console.log('Test2')
{
  const round100 = calculateFFT(pattern, 100)([1,9,6,1,7,8,0,4,2,0,7,2,0,2,2,0,9,1,4,4,9,1,6,0,4,4,1,8,9,9,1,7])
  console.log(round100)
}

console.log('Part1')
{
  const round100 = calculateFFT(pattern, 100)(readData('./input.txt'))
  console.log(round100)
}
