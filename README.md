# Overlimit
## Alternative to Break Infinity
0 dependicies, tryes to fix floats, keeps Infinity and NaN after JSON, and overall should be fast \
To use, just download .ts or .js (JS auto created by esbuild) file of Overlimit \
It uses 2 numbers ([mantissa, exponent]) instead of native 1 to have higher limit
### Functions: (arquments can be a number, bigint, string, [mantissa, exponent] or Overlimit)
0. Static compareFunc, used inside native sorting function, first value must be Overlimit: Array.sort((a, b) => Overlimit.compareFunc(b, a)); This will be equal to b - a
1. Standart, nothing special: plus, minus, multiply, divide, abs, lessThan, lessOrEqual, moreThan, moreOrEqual, notEqual, equal, max, min, trunc, floor, ceil, round
2. power, root - Second arqument must be a number
3. log - Can have negative base (because I don't agree with modern Math, but it doesn't use complex numbers so answer might end up being NaN anyway)
4. isNaN, isFinite - Only reacts to mantissa
5. format - For basic formatting because string numbers are saved as 1e1 instead of 10 (returns a String)
6. replaceNaN - Replaces current value with provided, but only if current one is NaN
7. clone, setValue - Clone will create new Overlimit, setValue will overwrite current value
8. toNumber, toSafeNumber, toString, toArray - returns a diffent type version, safeNumber will return Number.MAX_VALUE in case of NaN/Infinity after conversion; String version can be converted with Number(); Array version is readonly
9. all + FunctionName - Same functions, but they can use any amount of arguments (they aren't faster, but also probably not slower. Maybe max/min are faster)
#### Altered JS rules: (Most of these are either common sense or help against bugs)
1. '1 ** Infinity', '1 ** NaN' now returns 1 instead of NaN
2. '0 ** 0', 'NaN ** 0' now retuns NaN instead of 1
3. '0 * Infinity', '0 * NaN' now returns 0 instead of NaN
4. 'Infinity / 0', '-x ** Infinity' now returns NaN instead of Infinity
5. '0 / NaN' now returns 0 instead of NaN
