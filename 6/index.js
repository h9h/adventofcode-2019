const fs = require('fs')
const input = fs.readFileSync('./input.txt', 'utf8')

const newOrbit = o => {
  const [center, orbiter] = o.split(')')
  return { center, orbiter }
}

const newOrbits = data => data.split(/\r?\n/).map(o => newOrbit(o))

const generateTree = (os, root = 'COM', level = 1) =>
  os
    .filter(o => o.center === root)
    .map(o => ({ ...o, level, children: generateTree(os, o.orbiter, level + 1) }));

const visit = (tree, fn) => {
  fn(tree)
  if (tree.children) tree.children.forEach(c => visit(c, fn))
}

const evaluate = (tree, visitor) => {
  visit(tree, node => visitor.visit(node))
  return visitor.result()
}

const addLevelFn = () => {
  let sum = 0
  return {
    visit: node => sum += node.level,
    result: () => sum
  }
}

// Test Case
const testdata = 'COM)B\n' +
  'B)C\n' +
  'C)D\n' +
  'D)E\n' +
  'E)F\n' +
  'B)G\n' +
  'G)H\n' +
  'D)I\n' +
  'E)J\n' +
  'J)K\n' +
  'K)L'

const testOrbits = newOrbits(testdata)
const testTree = generateTree(testOrbits)[0]
console.log(testTree)
console.log('Sum Test', evaluate(testTree, addLevelFn()))

// Real Puzzle
const orbits = newOrbits(input)
const tree = generateTree(orbits)[0]
console.log('Puzzle Part 1: ', evaluate(tree, addLevelFn()))

// ------------------------------------------------ Part2
/*
Idee. Finde ersten gemeinsamen Vorfahr. Dann ist die Wegstrecke level(You) - level(Vorfahr) + level(SAN) - level(Vorfahr)
 */

const addBacklink = tree => {
  const backlinkFn = node => node.children && node.children.forEach(c => c.parent = node)
  visit(tree, backlinkFn)
}

addBacklink(testTree)
addBacklink(tree)

const findNodeFn = (orbiter) => {
  let searchnode = null
  return {
    visit: node => {
      if (node.orbiter === orbiter) searchnode = node
    },
    result: () => searchnode
  }
}

const getPathToNode = node => {
  const path = []

  let here = node
  while(here) {
    path.push(here.center)
    here = here.parent
  }
  return path.reverse()
}

const getDistance = (node1, node2) => {
  const path1 = getPathToNode(node1)
  const path2 = getPathToNode(node2)

  let index = 0
  while(path1[index] === path2[index]) index++
  return path1.length + path2.length - 2 * index
}

// Test Case
const nodeK = evaluate(testTree, findNodeFn('K'))
const nodeI = evaluate(testTree, findNodeFn('I'))

console.log('Path', getPathToNode(nodeK))
console.log('Distance', getDistance(nodeK, nodeI))

// Real Puzzle
const nodeYOU = evaluate(tree, findNodeFn('YOU'))
console.log('Node YOU', nodeYOU)

const pathYOU = getPathToNode(nodeYOU)
const nodeSAN = evaluate(tree, findNodeFn('SAN'))
console.log('Node SAN', nodeSAN)
const pathSAN = getPathToNode(nodeSAN)

console.log('Path YOU', pathYOU)
console.log('Path SAN', pathSAN)

console.log('Puzzle Part 2: Distance', getDistance(nodeYOU, nodeSAN))

