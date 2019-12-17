/*
 * Globales Log
 */
const log = []

/*
 * Hilfsfunktionen
 */
const padLeft = (n, c = ' ') => {
  const A = Array(n).fill(c).join('')
  return t => (A + t).slice((-1) * n)
}

const A5 = padLeft(5)
const A7 = padLeft(7)
const A16 = padLeft(16)

/* ====================================================================
 *
 * Interpretation der OpCodes
 *
 ======================================================================*/
const getCode = (program, index) => program.has(index) ? program.get(index) : 0

const setOpcode = (program, { index = 0, step = 0, ...rest }) => {
  if (rest.debug && rest.stopAt && step === rest.stopAt) {
    debugger
  }
  const code = getCode(program, index)
  const opCode = code % 100
  const modes = ('0000' + code).slice(-5).slice(0, 3)

  return { ...rest, index, code, opCode, modes, step: step + 1 }
}

const getOperand = (program, register) => pointer => {
  const { index, relativeBase, modes, opCode } = register
  const mode =  modes[3 -	pointer]

  const idx = index + pointer
  const parameter = getCode(program, idx) + (mode === '2' ? relativeBase : 0)
  if (pointer === 3 || opCode === 3) return parameter

  switch(mode) {
    case '0': // position mode
    case '2': // relative mode
      return getCode(program, parameter)
    case '1': // immediate mode
      return parameter
    default:
      console.log('Error unknown mode', mode)
      throw new Error(`Unknown mode, ${index}, ${mode}`)
  }
}

const getOperands = (program, register) => {
  const arity = getArity(register.opCode)
  const ops = Array(arity).fill(0).map((_,i) => i + 1).map(getOperand(program, register))

  register.previousIndex = register.index
  register.index += arity + 1

  const logMessage = `${A7(register.step)}|${A5(register.code)}[${A7(register.previousIndex)}]: ${A16(getHandlerName(register.opCode))}: ${ops.map(o => A16(o))}`
  log.push(logMessage)
  if (register.debug) console.log(logMessage)

  if (arity > 1) return [ops.slice(0, -1), ops.slice(-1)[0]]
  if (arity === 1) return ops[0]
  return null
}

/* ====================================================================
 *
 * opCode Fachfunktionen
 *
 ======================================================================*/
const add = (program, register) => {
  const [operands, idx] = getOperands(program, register)
  program.set(idx, operands.reduce((acc, o) => acc + o, 0))
}

const multiply = (program, register) => {
  const [operands, idx] = getOperands(program, register)
  program.set(idx, operands.reduce((acc, o) => acc * o, 1))
}

const getInput = (program, register) => {
  const idx = getOperands(program, register)
  program.set(idx, register.inputs[register.inputIndex])
  log.push(`----: get input ${register.inputs[register.inputIndex]} into *${idx}`)
  console.log(`----: get input ${register.inputs[register.inputIndex]} into *${idx}`)
  register.inputIndex += 1
}

const generateOutput = (program, register) => {
  register.outputs.push(getOperands(program, register))
  log.push(`----: set output ${register.outputs[register.outputs.length - 1]}`)

  // if (register.outputs.length === 1) {
  //   log.push('----: Exit wegen Anzahl Outputs === 1')
  //   register.exit = true
  // }
}

const jumpIfTrue = (program, register) => {
  const [condition, target] = getOperands(program, register)
  if (condition[0] !== 0) register.index = target
}

const jumpIfFalse = (program, register) => {
  const [condition, target] = getOperands(program, register)
  if (condition[0] === 0) register.index = target
}

const isLessThan = (program, register) => {
  const [operands, idx] = getOperands(program, register)
  program.set(idx, operands[0] < operands[1] ? 1 : 0)
}

const isEqual = (program, register) => {
  const [operands, idx] = getOperands(program, register)
  program.set(idx, operands[0] === operands[1] ? 1 : 0)
}

const changeBase = (program, register) => {
  const base = getOperands(program, register)
  register.relativeBase += base
}

const exit = (program, register) => {
  register.exit = true
  log.push(`${register.index}: exit`)
  log.push(`Outputs on exit: ${register.outputs}`)
}

const boom = (program, register) => {
  const message = `BOOM - Unknown operator at *${register.index}: ${register.opCode}`
  console.log('BOOM', message)
  log.push(message)
  register.message = message
  register.error = true
  register.exit = true
}

/* ====================================================================
 *
 * Verdrahtung der Funktionen
 *
 ======================================================================*/
const FUNCTIONS = {
  1:  { name: 'ADD',            arity: 3, handler: add },
  2:  { name: 'MULTIPLY',       arity: 3, handler: multiply },
  3:  { name: 'INPUT',          arity: 1, handler: getInput },
  4:  { name: 'OUTPUT',         arity: 1, handler: generateOutput },
  5:  { name: 'JUMP_IF_TRUE',   arity: 2, handler: jumpIfTrue },
  6:  { name: 'JUMP_IF_FALSE',  arity: 2, handler: jumpIfFalse },
  7:  { name: 'IS_LESS',        arity: 3, handler: isLessThan },
  8:  { name: 'IS_EQUAL',       arity: 3, handler: isEqual },
  9:  { name: 'CHANGE_BASE',    arity: 1, handler: changeBase },
  99: { name: 'EXIT',           arity: 0, handler: exit },
}

const getHandlerName = opCode => (FUNCTIONS[opCode] && FUNCTIONS[opCode].name) || `HIER NICHT BEKANNT: ${opCode}`
const getArity = opCode => (FUNCTIONS[opCode] && FUNCTIONS[opCode].arity) || 0
const getHandler = opCode => (FUNCTIONS[opCode] && FUNCTIONS[opCode].handler) || boom

const handleOpcode = (program, register) => {
  const handler = getHandler(register.opCode)
  handler(program, register)
}

/* ====================================================================
 *
 * execute program
 *
 ======================================================================*/

const intCodeComputer = (source, { insertQuarter = false, debug = false, stopAt = -1, program = null, register = null } = {}) => {
  // Reset Log
  log.size = 0

  // Parse Program-Data
  if (!program) {
    program = new Map()
    source.split(',').forEach((p, i) => program.set(i, Number(p)))
  }

  // Special logics
  if (insertQuarter) {
    console.log('Inserting Quarter')
    program.set(0, 2)
  }

  // initialise register
  if (!register) {
    register = {
      debug,
      stopAt,
      index: 0,
      relativeBase: 0,
    }
  }

  // ------------------------------------------
  // return actual compute function
  // ------------------------------------------
  const compute = (inputs) => {
    // reset IO
    register.inputs = inputs
    register.outputs = []
    register.inputIndex = 0
    delete register.exit

    // Loop till 99' or Error
    do {
      register = setOpcode(program, register)
      handleOpcode(program, register)
    } while (!register.exit)

    if (register.error) {
      return [register.message, register.error, log]
    } else {
      log.push(`RETURNING [${register.outputs}]`)
      return [register.outputs, register.opCode, log]
    }
  }

  compute.cloneProgram = () => intCodeComputer(null,
    {register: Object.assign({}, register), program: new Map(program)}
  )

  return compute
}

exports.intCodeComputer = intCodeComputer
