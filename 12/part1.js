const N = 4

const test1 = `<x=-1, y=0, z=2>
<x=2, y=-10, z=-7>
<x=4, y=-8, z=8>
<x=3, y=5, z=-1>`

const puzzle = `<x=17, y=-9, z=4>
<x=2, y=2, z=-13>
<x=-1, y=5, z=-1>
<x=4, y=7, z=-7>`

const scanInput = input => {
  return input
    .split(/\r?\n/)
    .map(l => l.slice(1).slice(0, -1))
    .map(l => l.split(',')
      .map(e => e.trim())
      .map(e => e.substring(2))
      .map(Number)
    )
}
console.log(scanInput(test1))
const initializeVelocity = () => Array(N).fill(0).map(n => Array(3).fill(n))

const PERMUTATIONS = [[0,1], [0,2], [0,3], [1,2], [1,3], [2,3]]

const applyGravity = (position, velocity) => {
  const deltaVelocity = initializeVelocity()
  PERMUTATIONS.forEach(([i,j]) => {
    for (c = 0; c < 3; c++) {
      deltaVelocity[i][c] += Math.sign(position[j][c] - position[i][c])
      deltaVelocity[j][c] += Math.sign(position[i][c] - position[j][c])
    }
  })

  velocity.forEach((v3, n) => v3.forEach((v,c) => velocity[n][c] += deltaVelocity[n][c]))

  return velocity
}

const applyVelocity = (position, velocity) => {
  velocity.forEach((v3, n) => v3.forEach((v,c) => position[n][c] += velocity[n][c]))
  return position
}

const step = ([position, velocity]) => {
  const vStep = applyGravity(position, velocity)
  const pStep = applyVelocity(position, vStep)
  return [position, velocity]
}

const totalEnergy = ([position, velocity]) => {
  const potentialEnergy = Array(N).fill(0)
  position.forEach((v3, n) => v3.forEach((v,c) => potentialEnergy[n] += Math.abs(position[n][c])))

  const kineticEnergy = Array(N).fill(0)
  velocity.forEach((v3, n) => v3.forEach((v,c) => kineticEnergy[n] += Math.abs(velocity[n][c])))

  const totalEnergy = Array(N).fill(0)
  totalEnergy.forEach((_, n) => totalEnergy[n] = kineticEnergy[n] * potentialEnergy[n])
  console.log(totalEnergy)
  return totalEnergy.reduce((acc, e) => acc + e, 0)
}

console.log(step([scanInput(test1), initializeVelocity()]))

const signature = ([position, velocity]) => achse => {
  let s = ''
  for(let i = 0; i < N; i++) {
    s += ',' + position[i][achse] + ',' + velocity[i][achse]
  }
  return s
}

const work = (data, nrOfSteps) => {
  let position = scanInput(data)
  let velocity = initializeVelocity()

  for(let i = 0; i < nrOfSteps; i++) {
    [position, velocity] = step([position, velocity])
  }

  console.log(`Step ${nrOfSteps}: Total energy = ${totalEnergy([position, velocity])}`)
}

work(test1, 10)

console.log('============= Puzzle Part 1=================')
work(puzzle, 1000)

console.log('============= Puzzle Part 2=================')
// Da die Achsen unabhängig sind, reicht es die Zyklen für die Achsen zu finden
// und dann ist das Ergebnis das kleinste gemeinsame Vielfache

const ggt = (a, b) => b === 0 ? a : ggt(b, a % b)
const kgv = (a, b) => (a * b) / ggt(a, b)

const findCycle = (data) => {
  let position = scanInput(data)
  let velocity = initializeVelocity()
  const signature0 = [0,1,2].map(signature([position, velocity]))
  console.log('Sig 0', signature0)

  let cycle = [0,0,0]
  let nr = 0
  while(cycle[0] === 0 || cycle[1] === 0 || cycle[2] === 0) {
    [position, velocity] = step([position, velocity])
    nr++
    const signature1 = [0,1,2].map(signature([position, velocity]))
    cycle.forEach((c, i) => {
      if (c === 0) {
        if (signature1[i] === signature0[i]) {
          cycle[i] = nr
          console.log(`Cycle for axis ${i}: ${nr} --> Cycles ${cycle}`)
        }
      }
    })
    if (nr % 10000 === 0) console.log('Step', nr, signature1, cycle)
  }

  console.log(`Cycles:`, cycle)
  console.log('Ergebnis', kgv(kgv(cycle[0], cycle[1]), cycle[2]))
}

findCycle(test1)

console.log('Ergebnis Part2:')
findCycle(puzzle)
