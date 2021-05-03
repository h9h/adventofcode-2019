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

	return (inputs) => {
		const outputs = []
		let relativeBase = 0n

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
					input.set(idxInput, inputs[inputIndex])
					log.push(`${index}: get input ${inputs[inputIndex]} into *${idxInput}`)
					inputIndex++
					index += 2n
				}
					break
				case 4n:
					index = generateOutput(input, index, relativeBase, outputs)
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
					console.log('BOOM', traceStep)
					console.log(compareProgram(programm, input))
					throw new Error(`Unknown operator ${opCode}`)
			}
		} while (running)

//		console.log('Logs', log)
//		console.log('Programm modifications', compareProgram(programm, input))
		return [outputs, opCode]
	}
}


/*
console.log('Test 1:', intCodeComputer('109,1,204,-1,1001,100,1,100,1008,100,16,101,1006,101,0,99')([]))
console.log('Test 2:', intCodeComputer('1102,34915192,34915192,7,4,7,99,0')([]))
console.log('Test 3:', intCodeComputer('104,1125899906842624,99')([]))
*/

const input = '109,424,203,1,21102,1,11,0,1106,0,282,21101,18,0,0,1106,0,259,2102,1,1,221,203,1,21101,0,31,0,1106,0,282,21102,1,38,0,1106,0,259,21002,23,1,2,21202,1,1,3,21102,1,1,1,21101,57,0,0,1106,0,303,2102,1,1,222,20101,0,221,3,21002,221,1,2,21102,259,1,1,21102,1,80,0,1106,0,225,21102,96,1,2,21101,91,0,0,1105,1,303,2101,0,1,223,21001,222,0,4,21101,259,0,3,21101,225,0,2,21102,1,225,1,21101,118,0,0,1106,0,225,21002,222,1,3,21102,1,43,2,21101,0,133,0,1105,1,303,21202,1,-1,1,22001,223,1,1,21101,148,0,0,1106,0,259,1201,1,0,223,20101,0,221,4,20101,0,222,3,21101,16,0,2,1001,132,-2,224,1002,224,2,224,1001,224,3,224,1002,132,-1,132,1,224,132,224,21001,224,1,1,21101,195,0,0,106,0,109,20207,1,223,2,20101,0,23,1,21102,-1,1,3,21101,0,214,0,1105,1,303,22101,1,1,1,204,1,99,0,0,0,0,109,5,1202,-4,1,249,22102,1,-3,1,22101,0,-2,2,21202,-1,1,3,21102,250,1,0,1106,0,225,21202,1,1,-4,109,-5,2106,0,0,109,3,22107,0,-2,-1,21202,-1,2,-1,21201,-1,-1,-1,22202,-1,-2,-2,109,-3,2105,1,0,109,3,21207,-2,0,-1,1206,-1,294,104,0,99,22102,1,-2,-2,109,-3,2105,1,0,109,5,22207,-3,-4,-1,1206,-1,346,22201,-4,-3,-4,21202,-3,-1,-1,22201,-4,-1,2,21202,2,-1,-1,22201,-4,-1,1,21202,-2,1,3,21101,0,343,0,1105,1,303,1106,0,415,22207,-2,-3,-1,1206,-1,387,22201,-3,-2,-3,21202,-2,-1,-1,22201,-3,-1,3,21202,3,-1,-1,22201,-3,-1,2,21202,-4,1,1,21102,384,1,0,1106,0,303,1105,1,415,21202,-4,-1,-4,22201,-4,-3,-4,22202,-3,-2,-2,22202,-2,-4,-4,22202,-3,-2,-3,21202,-4,-1,-2,22201,-3,-2,1,22102,1,1,-4,109,-5,2105,1,0'
//console.log('Puzzle 1:', intCodeComputer(input)([1n]))

const points = []
for (let i = 0; i < 50; i++) {
	for (let j = 0; j < 50; j++) {
		points.push([BigInt(i), BigInt(j)])
	}
}
points.forEach(p => {
	console.log('Puzzle 1:', intCodeComputer(input)(p))
})

exports.intCodeComputer = intCodeComputer
