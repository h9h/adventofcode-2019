const getOperand = (input, modeArray, index, pointer) => {
    const mode = pointer <= modeArray.length ? modeArray[modeArray.length - pointer]: '0'
    const result = mode === '0'? input[input[index+pointer]] : input[index+pointer]
    console.log('Operand', pointer, mode, result)
    return parseInt(result, 10)
}

const moonLanding = (inputString, id) => {
    const input = inputString.split(',')
    console.log('Input', input)
    
    let index = 0
    let running = true
    
    let lastOutput = -1

    do {
    
        const len = input[index].length
        console.log('Length Opcode', input[index], len)

        let opCode
        if (!len) {
            console.log('ABORT')
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
                    console.log(index, modeArray, 'Add', a1, a2, indexSum)
                    input[indexSum] = '' + (a1 + a2)
                    index +=4
                }
                break
            case 2:
                {
                    const a1 = getOperand(input, modeArray, index, 1)
                    const a2 = getOperand(input, modeArray, index, 2)
                    const indexMult = input[index+3]
                    console.log(index, modeArray, 'Mult', a1, a2, indexMult)
                    input[indexMult] = '' + (a1 * a2)
                    index +=4
                }
                break
            case 3:
                {
                    const indexInput = input[index+1]
                    console.log(index, 'Input', id, indexInput)
                    input[indexInput] = '' + id // the id of the air-conditioning unit
                    index +=2
                }
                break
            case 4:
                {
                    lastOutput = getOperand(input, modeArray, index, 1)
                    console.log(index, '---------------> Output', lastOutput)
                    index +=2
                }
                break
            case 5:
                {
                    const condition = getOperand(input, modeArray, index, 1)
                    if (condition !== 0) {
                        const jumpTo = getOperand(input, modeArray, index, 2)
                        console.log(index, 'Jump If True', jumpTo)
                        index = jumpTo
                    } else {
                        console.log(index, 'Jump If True skipped')
                        index += 3
                    }
                }
                break
            case 6:
                {
                    const condition = getOperand(input, modeArray, index, 1)
                    if (condition === 0) {
                        const jumpTo = getOperand(input, modeArray, index, 2)
                        console.log(index, 'Jump If False', jumpTo)
                        index = jumpTo
                    } else {
                        console.log(index, 'Jump If False skipped')
                        index += 3
                    }
                }
                break
            case 7:
                {
                    const a1 = getOperand(input, modeArray, index, 1)
                    const a2 = getOperand(input, modeArray, index, 2)
                    const indexMult = input[index+3]
                    console.log(index, modeArray, 'Less Than', a1, a2, indexMult)
                    input[indexMult] = a1 < a2 ? '1' : '0'
                    index +=4
                }
                break
            case 8:
                {
                    const a1 = getOperand(input, modeArray, index, 1)
                    const a2 = getOperand(input, modeArray, index, 2)
                    const indexMult = input[index+3]
                    console.log(index, modeArray, 'Equals', a1, a2, indexMult)
                    input[indexMult] = a1 === a2 ? '1' : '0'
                    index +=4
                }
                break
            case 99:
                running = false
                console.log(index, 'EXIT')
                break
            default:
                console.log('BOOM')
                running = false
        }
     } while (running)

     console.log('Return after 99')
     return lastOutput
}

const TESTS = [
    '3,9,8,9,10,9,4,9,99,-1,8',
    '3,9,7,9,10,9,4,9,99,-1,8',
    '3,3,1108,-1,8,3,4,3,99',
    '3,3,1107,-1,8,3,4,3,99',
    '3,12,6,12,15,1,13,14,13,4,13,99,-1,0,1,9',
    '3,3,1105,-1,9,1101,0,0,12,4,12,99,1',
    '3,21,1008,21,8,20,1005,20,22,107,8,21,20,1006,20,31,1106,0,36,98,0,0,1002,21,125,20,4,20,1105,1,46,104,999,1105,1,46,1101,1000,1,20,4,20,1105,1,46,98,99',
]

TESTS.forEach((t, i) => {
    if (i !== 5) return
    console.log('TEST ', i)
    const test = moonLanding(t, -1)
    console.log('Test Result', test)
})

const input = '3,225,1,225,6,6,1100,1,238,225,104,0,1101,91,67,225,1102,67,36,225,1102,21,90,225,2,13,48,224,101,-819,224,224,4,224,1002,223,8,223,101,7,224,224,1,223,224,223,1101,62,9,225,1,139,22,224,101,-166,224,224,4,224,1002,223,8,223,101,3,224,224,1,223,224,223,102,41,195,224,101,-2870,224,224,4,224,1002,223,8,223,101,1,224,224,1,224,223,223,1101,46,60,224,101,-106,224,224,4,224,1002,223,8,223,1001,224,2,224,1,224,223,223,1001,191,32,224,101,-87,224,224,4,224,102,8,223,223,1001,224,1,224,1,223,224,223,1101,76,90,225,1101,15,58,225,1102,45,42,224,101,-1890,224,224,4,224,1002,223,8,223,1001,224,5,224,1,224,223,223,101,62,143,224,101,-77,224,224,4,224,1002,223,8,223,1001,224,4,224,1,224,223,223,1101,55,54,225,1102,70,58,225,1002,17,80,224,101,-5360,224,224,4,224,102,8,223,223,1001,224,3,224,1,223,224,223,4,223,99,0,0,0,677,0,0,0,0,0,0,0,0,0,0,0,1105,0,99999,1105,227,247,1105,1,99999,1005,227,99999,1005,0,256,1105,1,99999,1106,227,99999,1106,0,265,1105,1,99999,1006,0,99999,1006,227,274,1105,1,99999,1105,1,280,1105,1,99999,1,225,225,225,1101,294,0,0,105,1,0,1105,1,99999,1106,0,300,1105,1,99999,1,225,225,225,1101,314,0,0,106,0,0,1105,1,99999,1008,677,677,224,102,2,223,223,1005,224,329,1001,223,1,223,1108,677,226,224,1002,223,2,223,1006,224,344,101,1,223,223,107,677,226,224,1002,223,2,223,1006,224,359,101,1,223,223,108,677,677,224,1002,223,2,223,1006,224,374,1001,223,1,223,108,226,677,224,1002,223,2,223,1006,224,389,101,1,223,223,7,226,677,224,102,2,223,223,1006,224,404,1001,223,1,223,1108,677,677,224,1002,223,2,223,1005,224,419,101,1,223,223,1008,226,677,224,102,2,223,223,1006,224,434,101,1,223,223,107,226,226,224,102,2,223,223,1005,224,449,1001,223,1,223,1007,677,677,224,1002,223,2,223,1006,224,464,1001,223,1,223,1007,226,226,224,1002,223,2,223,1005,224,479,101,1,223,223,1008,226,226,224,102,2,223,223,1006,224,494,1001,223,1,223,8,226,226,224,102,2,223,223,1006,224,509,101,1,223,223,1107,677,677,224,102,2,223,223,1005,224,524,1001,223,1,223,1108,226,677,224,1002,223,2,223,1006,224,539,101,1,223,223,1107,677,226,224,1002,223,2,223,1006,224,554,101,1,223,223,1007,677,226,224,1002,223,2,223,1005,224,569,101,1,223,223,7,677,226,224,1002,223,2,223,1006,224,584,101,1,223,223,107,677,677,224,1002,223,2,223,1005,224,599,1001,223,1,223,8,226,677,224,1002,223,2,223,1005,224,614,101,1,223,223,7,677,677,224,1002,223,2,223,1006,224,629,1001,223,1,223,1107,226,677,224,1002,223,2,223,1006,224,644,101,1,223,223,108,226,226,224,102,2,223,223,1005,224,659,1001,223,1,223,8,677,226,224,1002,223,2,223,1005,224,674,101,1,223,223,4,223,99,226'
console.log('Result', moonLanding(input, 5))
