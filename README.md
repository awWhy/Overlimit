# Overlimit
## Alternative to Break Infinity
Work in progress, but probably will only add new sorting function and maybe Class alternative \
Should have 0 dependicies (if not, then I set it up wrong) \
If some functions are missing, then can ask for them to be added \
Due to constant fixing of Floating errors, numbers can end up being a little bigger than they should be \
To use, just download .ts or .js (JS auto created by esbuild) file of Overlimit \
Start with Limit(yourNumber).functionYouNeed().resultFunction() \
Supports numbers from -1e1e308 to 1e1e308, small numbers included (1e-1e308)
(Really big numbers formatted (with .format()), to look like 2e-e3 (1e-2e3))
### Functions: (number can be sended as number, string or [base, exponent] (array will be cloned))
1. plus, minus, multiply, divide - Any amount of arguments (ignored if 0)
2. power, log - Power must be a number. Also log can have any (number) base and even negative (as long no complex numbers required)
3. abs
4. lessThan, lessOrEqual, moreThan, moreOrEqual, notEqual, equal - Only equal allows any amount of arguments
5. max, min - Any amount of arguments
6. trunc, floor, ceil, round
7. isNaN, isFinite - reacts to exponent as well, even if -Infinity (1 ** -Infinity === 0)
8. format - because numbers shown as 1e1 instead of 10 (has many settings)
9. toNumber - returns result in form of a Number (Infinity if more than 2 ** 1024)
10. toString - returns result in form of a String (Can be turned into a Number with JS default function)
11. toArray - returns result in form of an Array (To use properly need to know JS object references) \
LimitAlt has faster way to do abs, isNaN, isFinite, but only if it's a String \
LimitAlt has faster way to clone (LimitAlt.clone()), but only if it's a Array of type [number, number] \
LimitAlt has sorting function, that will mutate provided Array, returns void (uses stable natural merge sort; LimitAlt.sort(array to sort, boolean for descending order (false default)))
### Functions that are missing and won't be added:
1. sqrt - use power function instead (1 / power, Example: 4 ** (1 / 2) is square root of 4)
2. exp - use power function instead (Math.E ** power)
#### Altered JS rules:
1. '-+1 ** Infinity', '1 ** NaN' now returns 1 instead of NaN
2. '0 ** 0', 'NaN ** 0' now retuns NaN instead of 1
3. '0 * Infinity', '0 * NaN' now returns 0 instead of NaN
4. 'Infinity / 0' now returns NaN instead of Infinity
5. '0 / NaN' now returns 0 instead of NaN
