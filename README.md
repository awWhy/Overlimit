# Overlimit
## Alternative to Break Infinity
Work in progress, 0 dependicies, can ask to add if need missing functions \
Due to constant fixing of Floating errors, numbers can end up being a little bigger than they should be \
To use, just download .ts or .js (JS auto created by esbuild) file of Overlimit \
Start with Limit(yourNumber).functionYouNeed().resultFunction() \
Supports numbers from -1e1e308 to 1e1e308, small numbers included (1e-1e308)
### Functions: (number can be sended as number, string, readonly [mantissa, exponent] (array will be cloned) or Overlimit Array)
1. plus, minus, multiply, divide - Any amount of arguments (ignored if 0)
2. power, log - Power must be a number. Also log can have any (number) base and even negative (because I don't agree with modern Math, but there it doesn't use complex numbers so answer might end up being NaN)
3. abs
4. lessThan, lessOrEqual, moreThan, moreOrEqual, notEqual, equal - Only equal allows any amount of arguments
5. max, min - Any amount of arguments
6. trunc, floor, ceil, round
7. isNaN, isFinite - reacts to exponent as well, even if -Infinity (1 ** -Infinity === 0)
8. format - because numbers shown as 1e1 instead of 10 (has some settings, if needing can add more)
9. toNumber - returns result in form of a Number (can get turned into Infinity)
10. toString - returns result in form of a String (default JS function can turn it into Number, if needed)
11. toArray - returns result in form of an Array (its a readonly Array; I would set Array type properly as readonly, but TS being annoying)
12. toLimit - returns result in form of an Overlimit Array (better to use Class from start instead; Limit function only)
LimitAlt has sorting function (deprecated, might eventually be updated and moved to main), that will mutate provided Array, returns void (uses stable natural merge sort; 13. LimitAlt.sort(array to sort, boolean for descending order (false default)))
14. (Overlimit Class only) clone - clones current Overlimit Array
15. (Overlimit Class only) setValue - sets new value to current Overlimit Array
### Functions that are missing:
1. root - probably won't be added since it will just call power function with (1 / power) arqument
2. exp - won't be added, because as far as I know it's just Math.E ** power, so can just use power function
#### Altered JS rules:
1. '-+1 ** Infinity', '1 ** NaN' now returns 1 instead of NaN
2. '0 ** 0', 'NaN ** 0' now retuns NaN instead of 1
3. '0 * Infinity', '0 * NaN' now returns 0 instead of NaN
4. 'Infinity / 0' now returns NaN instead of Infinity
5. '0 / NaN' now returns 0 instead of NaN
