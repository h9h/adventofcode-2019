const fs = require('fs')

const readData = (filename) => {
  return fs
    .readFileSync(filename, 'utf8')
    .split('')
    .filter(c => '0123456789'.indexOf(c) > -1)
    .map(Number)
}

const pattern = [0, 1, 0, -1]
/*
input = [input][input][input]....[input] (x 10000)

message-offset = 5.971.509

"Then, repeat each value in the pattern a number of times equal to the position in the output list being considered"..."skip first value"
Number at Position 5.971.509 is
  0 * v0 + .... + 0 * v5971508 + 1 * v5971509 + .... + 1*vEnd
since 5.971.509 > 6.500.000 / 2

Hence:
Phase 1:
(Summe v[n] bis Ende) % 10 für n=5.971.509 ... 6.500.000

=> Vektor Länge 6.500.000 - 5.971.509
=> Phase 2
 */


const input = readData('./input.txt')
console.log(input.join(''))
const startAt = Number(input.slice(0, 7).join(''))
console.log(`Start at ${startAt}`)

const numbers = Array(10000).fill(0).reduce((acc, _) => {
  acc.push(...input)
  return acc
}, [])
console.log(`10000*Numbers: Länge ${numbers.length}, Start Sample: ${numbers.slice(0, 10)}, End Sample: ${numbers.slice(-10)}`)
console.log(numbers.slice(-650).join(''))

console.log(`Assert Koeffizienten sind positiv: ${startAt} > ${numbers.length}/2`)

let digits = numbers.slice(startAt)

for (let phase = 0; phase < 100; phase++) {
  let newDigits = Array(digits.length).fill(0)
  let sum = 0
  for (let j = digits.length - 1; j > -1; j--) {
    sum += digits[j]
    newDigits[j] = sum % 10
  }
  digits = newDigits
}

console.log("Part 2 - ", digits.slice(0, 8).join(''))
// 6, 4, 3, 0, 1, 9, 3, 8 too low
