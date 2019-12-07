const getOperand = (input, modeArray, index, pointer) => {
	const mode = pointer <= modeArray.length ? modeArray[modeArray.length - pointer]: '0'
	const result = mode === '0'? input[input[index+pointer]] : input[index+pointer]
	// console.log('Operand', pointer, mode, result)
	return parseInt(result, 10)
}

const intCodeComputer = (programm, inputs) => {
	const input = programm.split(',')
	// console.log('Input', input)

	let index = 0
	let inputIndex = 0
	let running = true

	let lastOutput = -1

	do {

		const len = input[index].length
		// console.log('Length Opcode', input[index], len)

		let opCode
		if (!len) {
			// console.log('ABORT')
			opCode = 99;
		} else {
			opCode = len < 2 ? parseInt(input[index], 10) : parseInt(input[index].substring(len-2,len), 10)
		}
		const modeArray = (!len || len < 2) ? [] : [...input[index].substring(0, len-2)]

		switch (opCode) {
			case 1:
			{
				const a1 = getOperand(input, modeArray, index, 1)
				const a2 = getOperand(input, modeArray, index, 2)
				const indexSum = input[index+3]
				// console.log(index, modeArray, 'Add', a1, a2, indexSum)
				input[indexSum] = '' + (a1 + a2)
				index +=4
			}
				break
			case 2:
			{
				const a1 = getOperand(input, modeArray, index, 1)
				const a2 = getOperand(input, modeArray, index, 2)
				const indexMult = input[index+3]
				// console.log(index, modeArray, 'Mult', a1, a2, indexMult)
				input[indexMult] = '' + (a1 * a2)
				index +=4
			}
				break
			case 3:
			{
				const indexInput = input[index+1]
				// console.log(index, '---------------> Input', inputs[inputIndex], indexInput)
				input[indexInput] = parseInt(inputs[inputIndex], 10)
				inputIndex++
				index +=2
			}
				break
			case 4:
			{
				lastOutput = getOperand(input, modeArray, index, 1)
				// console.log(index, '---------------> Output', lastOutput)
				index +=2
			}
				break
			case 5:
			{
				const condition = getOperand(input, modeArray, index, 1)
				if (condition !== 0) {
					const jumpTo = getOperand(input, modeArray, index, 2)
					// console.log(index, 'Jump If True', jumpTo)
					index = jumpTo
				} else {
					// console.log(index, 'Jump If True skipped')
					index += 3
				}
			}
				break
			case 6:
			{
				const condition = getOperand(input, modeArray, index, 1)
				if (condition === 0) {
					const jumpTo = getOperand(input, modeArray, index, 2)
					// console.log(index, 'Jump If False', jumpTo)
					index = jumpTo
				} else {
					// console.log(index, 'Jump If False skipped')
					index += 3
				}
			}
				break
			case 7:
			{
				const a1 = getOperand(input, modeArray, index, 1)
				const a2 = getOperand(input, modeArray, index, 2)
				const indexMult = input[index+3]
				// console.log(index, modeArray, 'Less Than', a1, a2, indexMult)
				input[indexMult] = a1 < a2 ? '1' : '0'
				index +=4
			}
				break
			case 8:
			{
				const a1 = getOperand(input, modeArray, index, 1)
				const a2 = getOperand(input, modeArray, index, 2)
				const indexMult = input[index+3]
				// console.log(index, modeArray, 'Equals', a1, a2, indexMult)
				input[indexMult] = a1 === a2 ? '1' : '0'
				index +=4
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

	return lastOutput
}

const amplifier = (programm, phaseSetting) => {
	let ps = phaseSetting
	let result = 0
	for (let i = 0; i < 5; i++) {
		result = intCodeComputer(programm, [ps[i], '' + result])
	}

	return result
}

console.log('Test 1:', amplifier('3,15,3,16,1002,16,10,16,1,16,15,15,4,15,99,0,0', '43210'))
console.log('Test 2:', amplifier('3,23,3,24,1002,24,10,24,1002,23,-1,23,101,5,23,23,1,24,23,23,4,23,99,0,0', '01234'))
console.log('Test 3:', amplifier('3,31,3,32,1002,32,10,32,1001,31,-2,31,1007,31,0,33,1002,33,7,33,1,33,31,31,1,32,31,31,4,31,99,0,0,0', '10432'))


const programm = '3,8,1001,8,10,8,105,1,0,0,21,30,51,76,101,118,199,280,361,442,99999,3,9,102,5,9,9,4,9,99,3,9,102,4,9,9,1001,9,3,9,102,2,9,9,101,2,9,9,4,9,99,3,9,1002,9,3,9,1001,9,4,9,102,5,9,9,101,3,9,9,1002,9,3,9,4,9,99,3,9,101,5,9,9,102,4,9,9,1001,9,3,9,1002,9,2,9,101,4,9,9,4,9,99,3,9,1002,9,2,9,1001,9,3,9,102,5,9,9,4,9,99,3,9,1002,9,2,9,4,9,3,9,1002,9,2,9,4,9,3,9,1002,9,2,9,4,9,3,9,1001,9,2,9,4,9,3,9,102,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,101,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,1002,9,2,9,4,9,99,3,9,1001,9,1,9,4,9,3,9,1002,9,2,9,4,9,3,9,1002,9,2,9,4,9,3,9,101,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,101,1,9,9,4,9,3,9,102,2,9,9,4,9,3,9,101,1,9,9,4,9,3,9,102,2,9,9,4,9,99,3,9,1001,9,1,9,4,9,3,9,1001,9,2,9,4,9,3,9,101,1,9,9,4,9,3,9,101,1,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,1001,9,2,9,4,9,3,9,101,1,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,1001,9,1,9,4,9,3,9,101,1,9,9,4,9,99,3,9,1001,9,1,9,4,9,3,9,1002,9,2,9,4,9,3,9,1002,9,2,9,4,9,3,9,1002,9,2,9,4,9,3,9,101,2,9,9,4,9,3,9,1001,9,2,9,4,9,3,9,101,2,9,9,4,9,3,9,1001,9,1,9,4,9,3,9,1001,9,1,9,4,9,3,9,1002,9,2,9,4,9,99,3,9,102,2,9,9,4,9,3,9,1001,9,2,9,4,9,3,9,101,1,9,9,4,9,3,9,102,2,9,9,4,9,3,9,101,2,9,9,4,9,3,9,1001,9,1,9,4,9,3,9,101,1,9,9,4,9,3,9,101,1,9,9,4,9,3,9,1001,9,2,9,4,9,3,9,1001,9,2,9,4,9,99'

const getAllPermutations =(string) => {
	const results = [];
	if (string.length === 1) {
		results.push(string);
		return results;
	}

	for (let i = 0; i < string.length; i++) {
		const firstChar = string[i];
		const charsLeft = string.substring(0, i) + string.substring(i + 1);

		const innerPermutations = getAllPermutations(charsLeft);

		for (let j = 0; j < innerPermutations.length; j++) {
			results.push(firstChar + innerPermutations[j]);
		}
	}

	return results;
}
console.log(getAllPermutations('01234'))

const maximizeThrust = programm => {
	let maxThrust = 0
	getAllPermutations('01234').forEach(phaseSettings => {
		const result = amplifier(programm, phaseSettings)
		console.log('Attempt', phaseSettings, result)
		if (result > maxThrust) maxThrust = result
	})

	return maxThrust
}

console.log('Result', maximizeThrust(programm))

// 289373649 too high
