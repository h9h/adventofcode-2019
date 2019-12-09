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

		console.log('Logs', log)
		console.log('Programm modifications', compareProgram(programm, input))
		return [outputs, opCode]
	}
}


/*
console.log('Test 1:', intCodeComputer('109,1,204,-1,1001,100,1,100,1008,100,16,101,1006,101,0,99')([]))
console.log('Test 2:', intCodeComputer('1102,34915192,34915192,7,4,7,99,0')([]))
console.log('Test 3:', intCodeComputer('104,1125899906842624,99')([]))
*/

const input = '1102,34463338,34463338,63,1007,63,34463338,63,1005,63,53,1101,3,0,1000,109,988,209,12,9,1000,209,6,209,3,203,0,1008,1000,1,63,1005,63,65,1008,1000,2,63,1005,63,904,1008,1000,0,63,1005,63,58,4,25,104,0,99,4,0,104,0,99,4,17,104,0,99,0,0,1101,37,0,1005,1101,30,0,1013,1102,1,33,1019,1102,1,25,1003,1102,1,28,1018,1101,26,0,1006,1102,1,866,1029,1101,760,0,1023,1102,39,1,1012,1102,23,1,1009,1101,281,0,1026,1102,1,20,1011,1102,1,34,1008,1101,0,36,1017,1101,38,0,1000,1102,0,1,1020,1102,278,1,1027,1101,21,0,1010,1102,875,1,1028,1101,0,212,1025,1102,1,1,1021,1102,1,24,1014,1102,763,1,1022,1101,0,31,1007,1102,1,221,1024,1101,0,32,1002,1102,1,29,1004,1102,1,35,1016,1102,22,1,1015,1101,0,27,1001,109,9,1207,-6,26,63,1005,63,199,4,187,1105,1,203,1001,64,1,64,1002,64,2,64,109,19,2105,1,-4,4,209,1001,64,1,64,1106,0,221,1002,64,2,64,109,-33,1207,5,37,63,1005,63,241,1001,64,1,64,1106,0,243,4,227,1002,64,2,64,109,16,2102,1,-2,63,1008,63,23,63,1005,63,269,4,249,1001,64,1,64,1106,0,269,1002,64,2,64,109,16,2106,0,0,1106,0,287,4,275,1001,64,1,64,1002,64,2,64,109,-11,21101,40,0,0,1008,1016,38,63,1005,63,311,1001,64,1,64,1105,1,313,4,293,1002,64,2,64,109,4,21107,41,40,-9,1005,1011,329,1105,1,335,4,319,1001,64,1,64,1002,64,2,64,109,-14,21108,42,42,5,1005,1011,353,4,341,1106,0,357,1001,64,1,64,1002,64,2,64,109,2,2107,33,0,63,1005,63,379,4,363,1001,64,1,64,1105,1,379,1002,64,2,64,109,-7,1201,2,0,63,1008,63,25,63,1005,63,401,4,385,1105,1,405,1001,64,1,64,1002,64,2,64,109,11,1201,-8,0,63,1008,63,28,63,1005,63,429,1001,64,1,64,1106,0,431,4,411,1002,64,2,64,109,-7,2108,26,1,63,1005,63,449,4,437,1105,1,453,1001,64,1,64,1002,64,2,64,109,9,1206,7,465,1105,1,471,4,459,1001,64,1,64,1002,64,2,64,109,4,21102,43,1,-3,1008,1015,42,63,1005,63,491,1106,0,497,4,477,1001,64,1,64,1002,64,2,64,109,7,21108,44,43,-7,1005,1018,517,1001,64,1,64,1105,1,519,4,503,1002,64,2,64,109,-28,2101,0,7,63,1008,63,29,63,1005,63,545,4,525,1001,64,1,64,1105,1,545,1002,64,2,64,109,11,2107,28,-7,63,1005,63,561,1105,1,567,4,551,1001,64,1,64,1002,64,2,64,109,-4,2101,0,-1,63,1008,63,26,63,1005,63,587,1105,1,593,4,573,1001,64,1,64,1002,64,2,64,109,9,1206,7,607,4,599,1105,1,611,1001,64,1,64,1002,64,2,64,109,-10,1208,1,27,63,1005,63,627,1106,0,633,4,617,1001,64,1,64,1002,64,2,64,109,26,1205,-9,649,1001,64,1,64,1106,0,651,4,639,1002,64,2,64,109,-20,1208,0,23,63,1005,63,669,4,657,1105,1,673,1001,64,1,64,1002,64,2,64,109,-7,2102,1,1,63,1008,63,28,63,1005,63,693,1105,1,699,4,679,1001,64,1,64,1002,64,2,64,109,18,21102,45,1,-6,1008,1014,45,63,1005,63,725,4,705,1001,64,1,64,1106,0,725,1002,64,2,64,109,-23,1202,6,1,63,1008,63,25,63,1005,63,751,4,731,1001,64,1,64,1106,0,751,1002,64,2,64,109,20,2105,1,6,1106,0,769,4,757,1001,64,1,64,1002,64,2,64,109,-22,2108,39,10,63,1005,63,789,1001,64,1,64,1106,0,791,4,775,1002,64,2,64,109,3,1202,6,1,63,1008,63,32,63,1005,63,815,1001,64,1,64,1105,1,817,4,797,1002,64,2,64,109,23,21107,46,47,-9,1005,1012,835,4,823,1106,0,839,1001,64,1,64,1002,64,2,64,109,1,1205,-1,853,4,845,1105,1,857,1001,64,1,64,1002,64,2,64,109,-2,2106,0,8,4,863,1001,64,1,64,1105,1,875,1002,64,2,64,109,-8,21101,47,0,-2,1008,1010,47,63,1005,63,897,4,881,1106,0,901,1001,64,1,64,4,64,99,21102,27,1,1,21101,0,915,0,1105,1,922,21201,1,27810,1,204,1,99,109,3,1207,-2,3,63,1005,63,964,21201,-2,-1,1,21102,1,942,0,1106,0,922,22101,0,1,-1,21201,-2,-3,1,21101,957,0,0,1106,0,922,22201,1,-1,-2,1106,0,968,22101,0,-2,-2,109,-3,2106,0,0'
console.log('Puzzle 1:', intCodeComputer(input)([1n]))

console.log('Puzzle 2:', intCodeComputer(input)([2n]))
