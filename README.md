# Overlimit
## Alternative to Break Infinity
Work in progress, 0 dependicies, can ask to add if need missing functions \
Tryes to fix floats, keep Infinity or NaN, and overall should be fast \
To use, just download .ts or .js (JS auto created by esbuild) file of Overlimit \
Supports numbers from -1e1e308 to 1e1e308, small numbers included (1e-1e308)
### Functions: (number can be sended as number, bigint, string, [mantissa, exponent] or Overlimit)
0. Static compareFunc, used inside native sorting function, first value must be Overlimit, doesn't require cloning: Array.sort((a, b) => Overlimit.compareFunc(new Overlimit(b), a)); This will be equal to b - a
1. plus, minus, multiply, divide - Any amount of arguments (ignored if 0)
2. power, root, log - Second arqument must be a number. Log can have negative base (because I don't agree with modern Math, but it doesn't use complex numbers so answer might end up being NaN anyway)
3. abs
4. lessThan, lessOrEqual, moreThan, moreOrEqual, notEqual, equal - only equal allows any amount of arguments
5. max, min - any amount of arguments
6. trunc, floor, ceil, round
7. isNaN, isFinite - only reacts to mantissa
8. format - because string numbers are saved as 1e1 instead of 10
9. toNumber, toSafeNumber - returns a Number version, safe version replaces Infinity with MAX_VALUE
10. toString - returns a String version
11. toArray - returns a (readonly) Array version
12. clone, setValue
13. replaceNaN - calls set value, but only if current value is NaN
#### Altered JS rules:
1. '1 ** Infinity', '1 ** NaN' now returns 1 instead of NaN
2. '0 ** 0', 'NaN ** 0' now retuns NaN instead of 1
3. '0 * Infinity', '0 * NaN' now returns 0 instead of NaN
4. 'Infinity / 0', '-x ** Infinity' now returns NaN instead of Infinity
5. '0 / NaN' now returns 0 instead of NaN
