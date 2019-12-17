let input = 'L,10,R,8,L,6,R,6,L,2,L,4,R,R,4,L,6,L,7,R,R,7,R,6,L,2,R,2,L,10,R,10,L,8,L,8,R,2,R,4,R,8,L,8,L,4,L,2,L,6,L,10,L,10,L,8,L,4,L,6,L,8,L,8,R,8,R,4,R,2,R,8,R,R,8,L,10,R,8,L,6,R,6,R,8,L,6,L,10,L,10,L,10,R,8,L,6,R,2,';
let out = [];

// convert every substr occurence in `arr` to a symbol in `str`
// toSymbols('12345123',['123','45']) yields 'ABA'
function toSymbols(str, arr) {
  arr.forEach((s, i) => {
    let re = new RegExp(s, 'g');
    str = str.replace(re, String.fromCharCode(65 + i));
  });
  return str;
}

do {
  out = [];
  let scratch = input;
  // we know there's only 3 subsequences
  for (let j = 0; j < 3; j++) {
    // we know a sequence can't be longer than 20
    let len = Math.random() * 20 | 0;
    let sym = scratch.substr(0, len);
    let re = new RegExp(sym, 'g');
    // remove all occurences of the symbol from the string
    scratch = scratch.replace(re, '');
    out.push(sym);
  }
  // did our randomly chosen symbols manage to cover the whole input?
  if (/^[ABC]+$/.test(toSymbols(input, out))) {
    break;
  }
} while (1);

console.log(toSymbols(input, out));
console.log(out);
