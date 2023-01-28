# Overlimit
## Alternative to Break Infinity
Should have 0 dependicies (if not, then I set it up wrong) \
Curretly being worked on. But should be stable now \
To use, just download .ts or .js (JS auto created by esbuild) file of Overlimit \
Start with Limit(yourNumber).functionYouNeed().get() \
Supports numbers from -1e1e308 to 1e1e308, small numbers included (1e-1e308)
### Functions: (number can be sended as number, string or [base, exponent] (array will be cloned))
1. plus, minus, multiply, divide - Any amount of arguments
2. power, log - Power must be a number. Also log can have any (number) base and even negative (as long no complex numbers required)
3. abs
4. lessThan, lessOrEqual, moreThan, moreOrEqual, notEqual, equal - Only equal allows any amount of arguments
5. max, min - Any amount of arguments
6. trunc, floor, ceil, round
7. isNaN, isFinite - reacts to exponent as well, even if -Infinity (1 ** -Infinity === 0)
8. format - because numbers when converted into string or array shown as 1e1 instead of 10
9. toNumber - returns result in form of a number (Infinity if more than 2 ** 1024)
10. toString - returns result in form of a string (with can be turned into a number with Number())
11. toArray - returns result in form of an array, quickest but harder to mantain
Floats are only fixed when requesting an result ('toString' alike) or comparison ('lessThan' alike) or trunc type
Exponent isn't checked for being non finite on first call, only checked when receiving result
### Functions that are missing and won't be added:
1. sqrt - use power function instead (4 ** 0.5 === 2)
2. exp - use power function instead (Math.E ** 2)
#### Altered JS rules:
1. '-+1 ** Infinity', '1 ** NaN' now returns 1 instead of NaN
2. '0 * Infinity', '0 * NaN' now returns 0 instead of NaN
3. 'Infinity / 0' now returns NaN instead of Infinity
4. '0 / NaN' now returns 0 instead of NaN
