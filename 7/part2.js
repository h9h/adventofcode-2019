const getOperand = (input, index, pointer) => {
	const len = input[index].length
	const modeArray = (!len || len < 2) ? [] : [
		...input[index].substring(0, len - 2)]
	const mode = pointer <= modeArray.length ? modeArray[modeArray.length -
	pointer] : '0'
	const result = mode === '0' ? input[input[index + pointer]] : input[index +
	pointer]
	// console.log('Operand', pointer, mode, result)
	return parseInt(result, 10)
}

const intCodeComputer = (programm) => {
	const input = programm.split(',')
	// console.log('Input', input)
	let index = 0

	return (inputs) => {
		let lastOutput = -1

		let inputIndex = 0
		let running = true
		let opCode

		do {
			const len = input[index].length
			// console.log('Length Opcode', input[index], len)

			if (!len) {
				// console.log('ABORT')
				opCode = 99
			} else {
				opCode = len < 2 ? parseInt(input[index], 10) : parseInt(
					input[index].substring(len - 2, len), 10)
			}

			switch (opCode) {
				case 1: {
					const a1 = getOperand(input, index, 1)
					const a2 = getOperand(input, index, 2)
					const indexSum = input[index + 3]
					// console.log(index, 'Add', a1, a2, indexSum)
					input[indexSum] = '' + (a1 + a2)
					index += 4
				}
					break
				case 2: {
					const a1 = getOperand(input, index, 1)
					const a2 = getOperand(input, index, 2)
					const indexMult = input[index + 3]
					// console.log(index, modeArray, 'Mult', a1, a2, indexMult)
					input[indexMult] = '' + (a1 * a2)
					index += 4
				}
					break
				case 3: {
					const indexInput = input[index + 1]
					// console.log(index, '---------------> Input', inputs[inputIndex], indexInput)
					input[indexInput] = parseInt(inputs[inputIndex], 10)
					inputIndex++
					index += 2
				}
					break
				case 4: {
					lastOutput = getOperand(input, index, 1)
					console.log(index, '---------------> Output', index, lastOutput)
					index += 2
					running = false
				}
					break
				case 5: {
					const condition = getOperand(input, index, 1)
					if (condition !== 0) {
						const jumpTo = getOperand(input, index, 2)
						// console.log(index, 'Jump If True', jumpTo)
						index = jumpTo
					} else {
						// console.log(index, 'Jump If True skipped')
						index += 3
					}
				}
					break
				case 6: {
					const condition = getOperand(input, index, 1)
					if (condition === 0) {
						const jumpTo = getOperand(input, index, 2)
						// console.log(index, 'Jump If False', jumpTo)
						index = jumpTo
					} else {
						// console.log(index, 'Jump If False skipped')
						index += 3
					}
				}
					break
				case 7: {
					const a1 = getOperand(input, index, 1)
					const a2 = getOperand(input, index, 2)
					const indexMult = input[index + 3]
					// console.log(index, modeArray, 'Less Than', a1, a2, indexMult)
					input[indexMult] = a1 < a2 ? '1' : '0'
					index += 4
				}
					break
				case 8: {
					const a1 = getOperand(input, index, 1)
					const a2 = getOperand(input, index, 2)
					const indexMult = input[index + 3]
					// console.log(index, modeArray, 'Equals', a1, a2, indexMult)
					input[indexMult] = a1 === a2 ? '1' : '0'
					index += 4
				}
					break
				case 99:
					running = false
					// console.log(index, 'EXIT')
					break
				default:
					console.log('BOOM')
					running = false
			}
		} while (running)

		return [lastOutput, opCode]
	}
}

const amplifier = (programm, phaseSetting) => {
	const amps = Array(5).fill(0).map(_ => intCodeComputer(programm))
	let ps = phaseSetting
	let result = 0
	let i = 0
	let opCode = 0
	do {
		const [r, o] = amps[i % 5](i < 5 ? [ps[i], '' + result] : ['' + result])
		i++
		if (r > -1) result = r
		opCode = o
	} while (i % 5 !== 4 || opCode !== 99)

	return result
}

console.log('Test 1:', amplifier(
	'3,26,1001,26,-4,26,3,27,1002,27,2,27,1,27,26,27,4,27,1001,28,-1,28,1005,28,6,99,0,0,5',
	'98765'))
console.log('Test 2:', amplifier(
	'3,52,1001,52,-5,52,3,53,1,52,56,54,1007,54,5,55,1005,55,26,1001,54,-5,54,1105,1,12,1,53,54,53,1008,54,0,55,1001,55,1,55,2,53,55,53,4,53,1001,56,-1,56,1005,56,6,99,0,0,0,0,10',
	'97856'))

const programm = '3,8,1001,8,10,8,105,1,0,0,21,30,51,76,101,118,199,280,361,442,99999,3,9,102,5,9,9,4,9,99,3,9,102,4,9,9,1001,9,3,9,102,2,9,9,101,2,9,9,4,9,99,3,9,1002,9,3,9,1001,9,4,9,102,5,9,9,101,3,9,9,1002,9,3,9,4,9,99,3,9,101,5,9,9,102,4,9,9,1001,9,3,9,1002,9,2,9,101,4,9,9,4,9,99,3,9,1002,9,2,9,1001,9,3,9,102,5,9,9,4,9,99,3,9,1002,9,2,9,4,9,3,9,1002,9,2,9,4,9,3,9,1002,9,2,9,4,9,3,9,1001,9,2,9,4,9,3,9,102,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,101,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,1002,9,2,9,4,9,99,3,9,1001,9,1,9,4,9,3,9,1002,9,2,9,4,9,3,9,1002,9,2,9,4,9,3,9,101,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,101,1,9,9,4,9,3,9,102,2,9,9,4,9,3,9,101,1,9,9,4,9,3,9,102,2,9,9,4,9,99,3,9,1001,9,1,9,4,9,3,9,1001,9,2,9,4,9,3,9,101,1,9,9,4,9,3,9,101,1,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,1001,9,2,9,4,9,3,9,101,1,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,1001,9,1,9,4,9,3,9,101,1,9,9,4,9,99,3,9,1001,9,1,9,4,9,3,9,1002,9,2,9,4,9,3,9,1002,9,2,9,4,9,3,9,1002,9,2,9,4,9,3,9,101,2,9,9,4,9,3,9,1001,9,2,9,4,9,3,9,101,2,9,9,4,9,3,9,1001,9,1,9,4,9,3,9,1001,9,1,9,4,9,3,9,1002,9,2,9,4,9,99,3,9,102,2,9,9,4,9,3,9,1001,9,2,9,4,9,3,9,101,1,9,9,4,9,3,9,102,2,9,9,4,9,3,9,101,2,9,9,4,9,3,9,1001,9,1,9,4,9,3,9,101,1,9,9,4,9,3,9,101,1,9,9,4,9,3,9,1001,9,2,9,4,9,3,9,1001,9,2,9,4,9,99'

const getAllPermutations = (string) => {
	const results = []
	if (string.length === 1) {
		results.push(string)
		return results
	}

	for (let i = 0; i < string.length; i++) {
		const firstChar = string[i]
		const charsLeft = string.substring(0, i) + string.substring(i + 1)

		const innerPermutations = getAllPermutations(charsLeft)

		for (let j = 0; j < innerPermutations.length; j++) {
			results.push(firstChar + innerPermutations[j])
		}
	}

	return results
}

const maximizeThrust = programm => {
	let maxThrust = 0
	getAllPermutations('56789').forEach(phaseSettings => {
		const result = amplifier(programm, phaseSettings)
		console.log('Attempt', phaseSettings, result)
		if (result > maxThrust) maxThrust = result
	})

	return maxThrust
}

console.log('Result', maximizeThrust(programm))
