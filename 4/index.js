const lowerBound = 246540
const upperBound = 787419

const passwords = []

const doubleDigit = p => {
    let c = p.charAt(0)
    for(let i = 1; i < 6; i++) {
        const d = p.charAt(i)
        if (c === d) return true
        c = d
    }
    return false
}

const increasing = p => {
    let c = p.charAt(0)
    for(let i = 1; i < 6; i++) {
        const d = p.charAt(i)
        if (c > d) return false
        c = d
    }
    return true
}


for(let password = lowerBound; password <= upperBound; password++) {
    const p = `` + password
    let isIn = doubleDigit(p)
    if (isIn) isIn = increasing(p)
    if (isIn) passwords.push(password)
}

console.log('d', doubleDigit('246788'))
console.log('i', increasing('246788'))
console.log('Password candidates von bis', passwords[0], passwords[passwords.length-1])
console.log('Alle', passwords)
console.log('Answer', passwords.length)

const passwords2 = passwords.filter(d => /(?:^|(.)(?!\1))(\d)\2(?!\2)/.test(d))

console.log('Alle Part2', passwords2)
console.log('Answer Part2', passwords2.length)
