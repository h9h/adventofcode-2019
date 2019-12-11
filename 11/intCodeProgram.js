let log = []

const getOperand = (input, index, relativeBase, pointer) => {
  const code = getCode(input, index)
  const opCode = code % 100n
  const modeArray = ('0000' + code).slice(-5).slice(0, 3)
  let mode =  modeArray[3 -	pointer]

  let result
  const idx = index + BigInt(pointer)
  const parameter = getCode(input, idx)

  //if (code === 203n) return getCode(input, idx + relativeBase)

  switch(mode) {
    case '0': // position mode
      result = pointer === 3 || opCode === 3n ? parameter : getCode(input, parameter)
      break
    case '1': // immediate mode
      result = parameter
      break
    case '2': // relative mode
      result = pointer === 3 || opCode === 3n ? parameter + relativeBase : getCode(input, parameter + relativeBase)
      break
    default:
      console.log('Error unknown mode', mode)
      throw new Error(`Unknown mode, ${index}, ${mode}`)
  }
  // console.log('Operand', pointer, mode, result)
  return result
}

const getCode = (input, index) => input.has(index) ? BigInt(input.get(index)) : 0n

function compareProgram(programm, input) {
  return programm.split(',').map((p, i) => input.get(BigInt(i)) !== BigInt(p) ? `${i}: ${p} ==> ${input.get(BigInt(i))}` : '').filter(p => p !== '')
}

const add = (input, index, relativeBase) => {
  const a1 = getOperand(input, index, relativeBase, 1)
  const a2 = getOperand(input, index, relativeBase, 2)
  const idxOut = getOperand(input, index, relativeBase, 3)
  input.set(idxOut, a1 + a2)
  log.push(`${index}: add ${a1}, ${a2} into *${idxOut}`)
  index += 4n
  return index
}

const multiply = (input, index, relativeBase) => {
  const a1 = getOperand(input, index, relativeBase, 1)
  const a2 = getOperand(input, index, relativeBase, 2)
  const idxOut = getOperand(input, index, relativeBase, 3)
  input.set(idxOut, a1 * a2)
  log.push(`${index}: multiply ${a1}, ${a2} into *${idxOut}`)
  index += 4n
  return index
}

const generateOutput = (input, index, relativeBase, outputs) => {
  outputs.push(getOperand(input, index, relativeBase, 1))
  log.push(`${index}: output ${outputs[outputs.length - 1]}`)
  index += 2n
  return index
}

const jumpIfTrue = (input, index, relativeBase) => {
  const indexAlt = index
  const condition = getOperand(input, index, relativeBase, 1)
  if (condition !== 0n) {
    index = getOperand(input, index, relativeBase, 2)
  } else {
    index += 3n
  }
  log.push(`${indexAlt}: (${condition !== 0n}) jump to *${index}`)
  return index
}

const jumpIfFalse = (input, index, relativeBase) => {
  const indexAlt = index
  const condition = getOperand(input, index, relativeBase, 1)
  if (condition === 0n) {
    index = getOperand(input, index, relativeBase, 2)
  } else {
    index += 3n
  }
  log.push(`${indexAlt}: (${condition === 0n}) jump to *${index}`)
  return index
}

const isLessThan = (input, index, relativeBase) => {
  const a1 = getOperand(input, index, relativeBase, 1)
  const a2 = getOperand(input, index, relativeBase, 2)
  const idxOut = getOperand(input, index, relativeBase, 3)
  input.set(idxOut, a1 < a2 ? 1n : 0n)
  log.push(`${index}: (${a1 < a2}) set ${input.get(idxOut)} into *${idxOut}`)
  index += 4n
  return index
}

const isEqual = (input, index, relativeBase) => {
  const a1 = getOperand(input, index, relativeBase, 1)
  const a2 = getOperand(input, index, relativeBase, 2)
  const idxOut = getOperand(input, index, relativeBase, 3)
  input.set(idxOut, a1 === a2 ? 1n : 0n)
  log.push(`${index}: (${a1 === a2}) set ${input.get(idxOut)} into *${idxOut}`)
  index += 4n
  return index
}

const intCodeComputer = (programm) => {
  log = []
  const input = new Map()
  programm.split(',').forEach((p, i) => input.set(BigInt(i), BigInt(p)))
  // console.log('Input', input)
  let index = 0n
  let relativeBase = 0n

  return (inputs) => {
    const outputs = []

    let inputIndex = 0
    let running = true
    let opCode

    do {
      const code = getCode(input, index)
      opCode = code % 100n

      switch (opCode) {
        case 1n:
          index = add(input, index, relativeBase)
          break
        case 2n:
          index = multiply(input, index, relativeBase)
          break
        case 3n: { // get Input
          const idxInput = getOperand(input, index, relativeBase, 1)
          input.set(idxInput, BigInt(inputs[inputIndex]))
          log.push(`${index}: get input ${inputs[inputIndex]} into *${idxInput}`)
          inputIndex++
          index += 2n
        }
          break
        case 4n:
          index = generateOutput(input, index, relativeBase, outputs)
          running = outputs.length < 2
          break
        case 5n:
          index = jumpIfTrue(input, index, relativeBase)
          break
        case 6n:
          index = jumpIfFalse(input, index, relativeBase)
          break
        case 7n:
          index = isLessThan(input, index, relativeBase)
          break
        case 8n:
          index = isEqual(input, index, relativeBase)
          break
        case 9n: { // set relative base
          const a1 = getOperand(input, index, relativeBase, 1)
          relativeBase += a1
          log.push(`${index}: change relative base by ${a1} to ${relativeBase}`)
          index += 2n
        }
          break
        case 99n: // finish
          running = false
          log.push(`${index}: exit`)
          break
        default:
          console.log('BOOM', log)
          log.push(`BOOM - Unknown operator ${opCode}`)
          opCode = 'ERROR'
          running = false
      }
    } while (running)

    if (opCode === 'ERROR') {
      return [log[log.length - 1], opCode, log]
    } else {
      console.log('Output ', outputs[0], outputs[1])
      log.push(`RETURNING [${outputs[0]}, ${outputs[1]}]`)
      return [outputs, opCode, log]
    }
  }
}


exports.intCodeComputer = intCodeComputer
