const HELP = `NAME
\tnns

SYNOPSIS
\tnode nns.js -d | --digit= -c | --count= [-t | --target=] [--debug] [--help]
\tnode nns.js -c 10 -d 8
\tnode nns.js --count=4 -d 8 --target=3 --debug

DESCRIPTION
\tThis program finds the smallest positive integer that cannot be expressed using exactly the given -c digits -d and multiple combinations of them with four basic operations (+, -, *, /).
\tThis program operates under the assumption that the smallest positive integer is 1.

OPTIONS
\t--digit\tThe specific digit to be used in the expressions.
\t--count\tThe count of times the digit is used in the expressions.
\t--target\tOptionally specified result of at least one of the expressions. The program will indicate whether the given target is possible with given --digit and --count values.
\t--debug\tDisplay the timing message.
\t--help\tDisplay this message.`

function parseInput() {
  const args = process.argv.slice(2)
  const result = {}
  // Loop over args
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    // Handle double-dash args (e.g., --count=10)
    if (arg.startsWith('--')) {
      const keyValuePair = arg.slice(2).split('=')
      const key = keyValuePair[0]
      const value = keyValuePair.length > 1 ? keyValuePair[1] : true
      result[key] = value
    }
    // Handle single-dash args (e.g., -c 3, -cdt 3)
    else if (arg.startsWith('-') && arg.length > 1) {
      if (arg.length === 2) {
        const nextArg = args[i + 1]
        result[arg[1]] = isNaN(nextArg) || nextArg.startsWith('-') ? true : Number(nextArg)
        if (!isNaN(nextArg) && !nextArg.startsWith('-')) {
          i++ // Skip next arg as it is a part of this flag
        }
      } else {
        // Handle combined flags (e.g., -dct)
        for (let j = 1; j < arg.length; j++) {
          result[arg[j]] = true
        }
      }
    }
  }
  return result
}

function formatInput({ count, digit, target }) {
  count = parseFloat(count)
  if (isNaN(count)) {
    throw new Error(`count should be a number, instead got "${count}"`)
  }
  digit = parseFloat(digit)
  if (isNaN(digit)) {
    throw new Error(`digit should be a number, instead got "${digit}"`)
  }
  if (target) {
    target = parseFloat(target)
    if (isNaN(target)) {
      throw new Error(`target should be a number or not included, instead got "${target}"`)
    }
  }
  return { count, digit, target }
}

function validateInput(count, digit, target) {
  if (count < 1) {
    throw new Error('this program requires at least 1 digit')
  }
  if (digit < 0) {
    throw new Error('this program requires "digit" to be a non-negative number')
  }
  if (target !== undefined && target < 0) {
    throw new Error('this program requires "target" to be a non-negative number or to not be provided')
  }
}

function main() {
  /*
   * PARSE INPUT
   */
  const { count: clong, digit: dlong, target: tlong, debug, help, c, d, t } = parseInput()
  /*
   * CHECK INPUT
   */
  const unformattedCount = c !== undefined || !isNaN(c) ? c : clong
  const unformattedDigit = d !== undefined || !isNaN(d) ? d : dlong
  const unformattedTarget = t !== undefined || !isNaN(t) ? t : tlong
  if (unformattedCount === undefined || unformattedDigit === undefined || help) {
    return console.info(HELP)
  }
  /*
   * FORMAT INPUT
   */
  const { count, digit, target } = formatInput({
    count: unformattedCount,
    digit: unformattedDigit,
    target: unformattedTarget
  })
  /*
   * VALIDATE INPUT
   */
  validateInput(count, digit, target)
  /*
   * RUN CALUCATION
   */
  calculate({ count, digit, target, debug })
}

function isValidExp(digit, count, expression) {
  const amtOfDigits = (expression.match(new RegExp(digit, 'g')) || []).length
  return amtOfDigits === count
  // if return false, means we've got a WIP expression that being built up
  // with the help of resultMatrix[0] & resultMatrix[1]
}

// The idea is to build all possible results of all possible expressions
// I tried to apply a backtracking algorithms
// Sets ended up being MUCH faster than using maps or arrays
function calculate({ count, digit, target, debug }) {
  if (debug) {
    console.time('calculation took')
  }

  const verticalLength = count + 1
  const targetMode = target !== undefined

  // First, create a list of map to store our results
  // The length of the list represents the iteration depth
  let resultMatrix = Array.from({ length: verticalLength }, () => new Map())
  resultMatrix[0].set(0, '0') // this helps me not to modify the loops for the first few iterations
  resultMatrix[1].set(digit, String(digit))
  resultMatrix[1].set(digit * -1, String(digit * -1))

  let winningExpression = false

  loop: // Iterate over two maps at the same time
  for (let leftIx = 1; leftIx < verticalLength; leftIx++) {
    const leftMap = resultMatrix[leftIx]

    for (let leftOperand of leftMap.keys()) {

      for (let rightIx = leftIx; rightIx < verticalLength; rightIx++) {
        const rightMap = resultMatrix[rightIx - leftIx]

        for (let rightOperand of rightMap.keys()) {
          // as you can see maps are chosen over sets
          //due to the ability to store expressions
          if (rightOperand > 0) {
            const leftExp = leftMap.get(leftOperand)
            const rightExp = rightMap.get(rightOperand)
            const addition = leftOperand + rightOperand
            const subtraction = leftOperand - rightOperand
            const multiplication = leftOperand * rightOperand
            const division = leftOperand / rightOperand
            resultMatrix[rightIx].set(addition, `(${leftExp}+${rightExp})`)
            resultMatrix[rightIx].set(subtraction, `(${leftExp}-${rightExp})`)
            resultMatrix[rightIx].set(multiplication, `(${leftExp}*${rightExp})`)
            resultMatrix[rightIx].set(division, `(${leftExp}/${rightExp})`)
          }
          // check for target when we're at the last level
          if (rightIx === count && targetMode) {
            if (resultMatrix[rightIx].has(target)) {
              const potentialWinner = resultMatrix[rightIx].get(target)
              if (isValidExp(digit, count, potentialWinner)) {
                winningExpression = potentialWinner
                break loop
              }
            }
          }
        }

      }
    }

  }

  if (targetMode) {
    if (winningExpression) {
      // clean up winning expression by convering negatives and trimming brackets
      winningExpression = winningExpression.
        slice(1, winningExpression.length - 1).
        replaceAll('--', '+').
        replaceAll('+-', '-').
        replaceAll(/-(\d+)\+(\d+)/g, `${digit}-${digit}`).
        replaceAll(/-(\d+)\/-(\d+)/g, `${digit}/${digit}`).
        replaceAll(/-(\d+)\*-(\d+)/g, `${digit}*${digit}`)

      console.log(`${target} can be computed in ${count} ${digit}s\nhere is how: ${winningExpression}`)
    } else {
      console.log(`${target} cannot be computed in ${count} ${digit}s`)
    }
  } else {
    let result = 1
    while (resultMatrix[count].has(result)) {
      result++
    }
    console.log(`${result} cannot be computed in ${count} ${digit}s`)
  }

  if (debug) {
    console.timeEnd('calculation took')
  }
}

try {
  main()
} catch (e) {
  // Clean up the error msg
  console.error('Error:', e.message)
}
