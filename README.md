# N Ns

*This program is a solution to the following problem:*

Suppose you're given the following:
1) "count" as number
2) "digit" as number
1) "target" as number

"digit" represents a digit, while "count" represents the amount of of the same digit "digit" in a wide variety of expressions with 4 kinds of operations (+, -, *, /) and freedom to put parentheses anywhere. you can put the parentheses and the operations between integers to produce many expressions.

For example, when "digit" is 9 and "count" is 4, the following expressions are possible:

"9+9+9+9",
"9*9/9*9",
"9*(9+9)*9",
"(9-9)+9*9",
"(9-9)+(9/9)",
"(9-9+9)/9",
"9/((9+9)/9)",
...and as such. Each of expressions has exacly 4 of the same digit (9).

Among these expressions, we'll care about
the ones that produce positive integers.

The problem is to write a program that will determine whether there is an expression that can result in the value of the "target" variable. For example, when
"count" = 3
"digit" = 3
"target" = 18
the result should be the following expression: "(3+3)*3" (as a string). It is important to point out that this expression has parentheses which is why it can result in 18.

## Where did you get that problem from?

This problem is a bit more advanced version of the well-known math problem called Nine Nines. I've included python solutions to it in this repo.

## Potential issues

* `--count 6 --digit 1`` gives 10 while I think it should be 9.
* `--count 7 --digit 4`` gives 74 while I think it should be 54.