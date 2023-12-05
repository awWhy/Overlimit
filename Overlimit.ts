/* Overlimit - awWhy's version of break infinity (or Decimal):
    From -1e1.8e308 to 1e1.8e308; Also allows small numbers like up to (1e-1.8e308)
    Beyond 1e9e15 or 1 ** 10 ** maxSafeInteger, precision for exponent will decrease (multiply by 10 won't work and etc)

    Numbers can be send in these ways:
    1.25e32 as typeof 'number' (as long it's bellow 2 ** 1024 or Number.MAX_VALUE)
    '1.25e32' as typeof 'string' (2ee5 is not allowed, instead send '1e2e5')
    [1.25, 32] as typeof 'object' [number, number] (will be auto cloned)

    Chainable: (Limit(2).plus(1).toNumber())
        plus, minus, multiply, divide - These one's can take any amount of arguments (ignored if 0)
        power, log - Power must be a number. Also log can have any (number) base and even negative
        abs
        less, lessOrEqual, more, moreOrEqual, notEqual, equal - Only equal allows any amount of arguments
        max, min
        trunc, floor, ceil, round
        isNaN, isFinite - reacts to both parts, even if exponent is -Infinity

        format - Numbers are saved as '2e1', format will transform into '20' it's only for visual (has special settings)
        Really big numbers shown as '2e-e20' ('1e-2e20') or '-2ee20' ('-1e2e20')

        To get the result:
        toNumber - returns a Number (Must be bellow 2 ** 1024)
        toString - returns a String (Can be turned into a Number with JS default function)
        toArray - returns a Array (Fastest, but hardest to use; Limit auto clones arrays)

    Non chainable: (LimitAlt.abs('-2'))
        abs, isFinite, isNaN - Strings only, faster methods (if it was a string already)
        clone - Clones your Array (in fastest way)
        sort - Sorts provided Array (stable), if second value is true (false by default) then will sort in descending order

    Won't be added:
        sqrt or any other rootes - Use .power(1 / power) instead
        exp - I don't see the need, just use .power(Math.E, power)

    Some JS rules are altered:
    '-+1 ** Infinity', '1 ** NaN' now returns 1 instead of NaN
    '0 ** 0', 'NaN ** 0' now retuns NaN instead of 1
    '0 * Infinity', '0 * NaN' now returns 0 instead of NaN
    'Infinity / 0' now returns NaN instead of Infinity
    '0 / NaN' now returns 0 instead of NaN
    Kept weird JS rules:
    'Infinity ** 0' returns 1 (NaN not included because its true value could be 0)
    'X / -+Infinity' returns 0 (precision being lost will result in 0)
    Idea is that 0 could be 1e-324 is not taken, because precision lost Math doesnt work like this
    If we would allow idea of that type then any value multiplied by 0 should be NaN (1e-324 * 1e308)
*/

/* Can be added if needed:
    Class: Alternative to be able to call like: number.function()
    sort: Better sorting function that takes function as arqument
    power: Allow power to be bigger than 2**1024, if there ever will be a need for it
    log: Allow base to be bigger than 2**1024, if someone actually need it
    format: Fix rare bug with incorrect padding amount: 9.999999 > 10.0000 (instead of 10.000) (lazy to fix since no one even using this breakInfinity alternative)
    format: Allow more than 2 digits if number is >= 1000 (lazy to fix since no one even using this breakInfinity alternative)
    format: More options to format function object argument: Like point, separator, power, maxPower
    format: Add format for power with a special separator: 1e12345 > 1e12,345
    calculator: Add website where can test calculator
*/

export const overlimit = {
    settings: {
        format: {
            //Calling function with type === 'input', will ignore point and separator, also number never turned into 1ee2
            digits: [0, 2, 4], //Digits past point (1.11) [min, power, max]; Decreases by 1 for every new digit
            //Do not use min setting more than 2, because numbers >= 1e3 will get incorectly converted
            //Power setting is for any number like 1.11e111
            padding: false, //Will add missing digits past point
            power: [6, -3], //When convert into: example 1000000 > 1e6; [+, -]
            maxPower: 1e4, //When convert into: 1e2345 > 2.34ee3; [+, -] (power is never formated)
            point: '.', //What should be used instead of dot; example 1.21 > 1,21
            separator: '' //What should be used as a thousand separator; example 1200 > 1 200
        }
    },
    Limit: (number: string | number | [number, number]) => {
        const { technical } = overlimit;
        let result = technical.convert(number);

        return {
            plus: function(...numbers: Array<string | number | [number, number]>) {
                if (numbers.length < 1) { return this; }
                const array = technical.convertAll(numbers);

                for (let i = 0; i < array.length; i++) {
                    result = technical.add(result, array[i]);
                }

                return this;
            },
            minus: function(...numbers: Array<string | number | [number, number]>) {
                if (numbers.length < 1) { return this; }
                const array = technical.convertAll(numbers);

                for (let i = 0; i < array.length; i++) {
                    result = technical.sub(result, array[i]);
                }

                return this;
            },
            multiply: function(...numbers: Array<string | number | [number, number]>) {
                if (numbers.length < 1) { return this; }
                const array = technical.convertAll(numbers);

                for (let i = 0; i < array.length; i++) {
                    result = technical.mult(result, array[i]);
                }

                return this;
            },
            divide: function(...numbers: Array<string | number | [number, number]>) {
                if (numbers.length < 1) { return this; }
                const array = technical.convertAll(numbers);

                for (let i = 0; i < array.length; i++) {
                    result = technical.div(result, array[i]);
                }

                return this;
            },
            power: function(power: number) {
                result = technical.pow(result, power);
                return this;
            },
            log: function(base = 2.718281828459045) {
                result = technical.log(result, base);
                return this;
            },
            abs: function() {
                result[0] = Math.abs(result[0]);
                return this;
            },
            trunc: function() {
                result = technical.trunc(result);
                return this;
            },
            floor: function() {
                result = technical.floor(result);
                return this;
            },
            ceil: function() {
                result = technical.ceil(result);
                return this;
            },
            round: function() {
                result = technical.round(result);
                return this;
            },
            isNaN: (): boolean => isNaN(result[0]) || isNaN(result[1]),
            isFinite: (): boolean => isFinite(result[0]) && isFinite(result[1]),
            lessThan: (compare: string | number | [number, number]): boolean => technical.less(result, technical.convert(compare)),
            lessOrEqual: (compare: string | number | [number, number]): boolean => technical.lessOrEqual(result, technical.convert(compare)),
            moreThan: (compare: string | number | [number, number]): boolean => technical.more(result, technical.convert(compare)),
            moreOrEqual: (compare: string | number | [number, number]): boolean => technical.moreOrEqual(result, technical.convert(compare)),
            notEqual: (compare: string | number | [number, number]): boolean => technical.notEqual(result, technical.convert(compare)),
            equal: (...compare: Array<string | number | [number, number]>): boolean => {
                if (compare.length < 1) { return true; }
                const array = technical.convertAll(compare);

                let allEqual = technical.equal(result, array[0]);
                for (let i = 1; i < array.length; i++) {
                    if (!allEqual) { return false; }
                    allEqual = technical.equal(array[i - 1], array[i]);
                }

                return allEqual;
            },
            max: function(...compare: Array<string | number | [number, number]>) {
                if (compare.length < 1) { return this; }
                const array = technical.convertAll(compare);

                for (let i = 0; i < array.length; i++) {
                    if (isNaN(array[i][0])) {
                        result = [NaN, NaN];
                        break;
                    }

                    if (technical.less(result, array[i])) { result = array[i]; }
                }

                return this;
            },
            min: function(...compare: Array<string | number | [number, number]>) {
                if (compare.length < 1) { return this; }
                const array = technical.convertAll(compare);

                for (let i = 0; i < array.length; i++) {
                    if (isNaN(array[i][0])) {
                        result = [NaN, NaN];
                        break;
                    }

                    if (technical.more(result, array[i])) { result = array[i]; }
                }

                return this;
            },
            format: (settings = {} as { digits?: number, type?: 'number' | 'input', padding?: boolean }): string => technical.format(result, settings),
            toNumber: (): number => Number(technical.convertBack(result)),
            toString: (): string => technical.convertBack(result),
            toArray: (): [number, number] => technical.prepare(result)
        };
    },
    LimitAlt: {
        //Faster methods (?), because no need to convert in both directions
        abs: (number: string): string => number[0] === '-' ? number.substring(1) : number,
        isNaN: (number: string): boolean => number.includes('NaN'),
        isFinite: (number: string): boolean => !number.includes('Infinity') && !number.includes('NaN'),
        clone: (number: [number, number]): [number, number] => [number[0], number[1]],
        sort: <sortType extends Array<string | number | [number, number]>>(toSort: sortType, descend = false) => {
            if (toSort.length < 2) { return; }
            const numbers = overlimit.technical.convertAll(toSort);
            const compare = descend ? overlimit.technical.moreOrEqual : overlimit.technical.lessOrEqual;

            let main: number[] | number[][] = [[0]];
            initial:
            for (let i = 1; i < numbers.length; i++) {
                const target = main[main.length - 1];
                if (compare(numbers[i - 1], numbers[i])) {
                    do {
                        target.push(i);
                        i++;
                        if (i >= numbers.length) { break initial; }
                    } while (compare(numbers[i - 1], numbers[i]));
                    main.push([i]);
                } else {
                    do {
                        target.push(i);
                        i++;
                        if (i >= numbers.length) {
                            target.reverse();
                            break initial;
                        }
                    } while (compare(numbers[i], numbers[i - 1]));
                    target.reverse();
                    main.push([i]);
                }
            }

            const merge = (array: number[][]): number[] | number[][] => {
                if (array.length === 1) { return array[0]; }
                let main: number[] | number[][] = [] as number[][];

                let i;
                for (i = 0; i < array.length - 1; i += 2) {
                    main.push([]);
                    const target = main[main.length - 1];
                    const first = array[i];
                    const second = array[i + 1];
                    let f = 0;
                    let s = 0;
                    while (f < first.length || s < second.length) {
                        if (s >= second.length || (f < first.length && compare(numbers[first[f]], numbers[second[s]]))) {
                            target.push(first[f]);
                            f++;
                        } else {
                            target.push(second[s]);
                            s++;
                        }
                    }
                }
                if (i === array.length - 1) { main.push(array[i]); }

                main = merge(main);
                return main;
            };
            main = merge(main) as number[];

            const clone = toSort.slice(0);
            toSort.length = 0;
            for (let i = 0; i < clone.length; i++) {
                toSort.push(clone[main[i]]);
            }
        }
    },
    /* Private functions */
    technical: {
        /* Main calculations */
        //No abs, isNaN, isFinite because they are too simple
        //No max, min instead on spot it will call comparison function (.more())
        add: (left: [number, number], right: [number, number]): [number, number] => {
            if (right[0] === 0) { return left; }
            if (left[0] === 0) { return right; }
            if (!isFinite(left[0]) || !isFinite(right[0])) {
                const check = left[0] + right[0]; //Infinity + -Infinity === NaN
                return isNaN(left[0]) || isNaN(right[0]) || isNaN(check) ? [NaN, NaN] : [check, Infinity];
            }

            const difference = left[1] - right[1];
            if (Math.abs(difference) > 15) { return difference > 0 ? left : right; }

            if (difference === 0) {
                left[0] += right[0];
            } else if (difference > 0) {
                left[0] += right[0] / 10 ** difference;
            } else {
                right[0] += left[0] / 10 ** (-difference);
                left = right;
            }

            const after = Math.abs(left[0]);
            if (after === 0) {
                left[1] = 0;
            } else if (after >= 10) {
                left[0] /= 10;
                left[1]++;
            } else if (after < 1) {
                const digits = -Math.floor(Math.log10(after));
                left[0] *= 10 ** digits;
                left[1] -= digits;
            }

            left[0] = Math.round(left[0] * 1e14) / 1e14;
            if (Math.abs(left[0]) === 10) {
                left[0] = 1;
                left[1]++;
            }

            return left;
        },
        sub: (left: [number, number], right: [number, number]): [number, number] => {
            right[0] *= -1; //Easier this way
            return overlimit.technical.add(left, right);
        },
        mult: (left: [number, number], right: [number, number]): [number, number] => {
            if (left[0] === 0 || right[0] === 0) { return [0, 0]; }

            left[1] += right[1];
            left[0] *= right[0];

            if (Math.abs(left[0]) >= 10) {
                left[0] /= 10;
                left[1]++;
            }

            left[0] = Math.round(left[0] * 1e14) / 1e14;
            if (Math.abs(left[0]) === 10) {
                left[0] = 1;
                left[1]++;
            }

            return left;
        },
        div: (left: [number, number], right: [number, number]): [number, number] => {
            if (right[0] === 0) { return [NaN, NaN]; }
            if (left[0] === 0) { return [0, 0]; }

            left[1] -= right[1];
            left[0] /= right[0];

            if (Math.abs(left[0]) < 1) {
                left[0] *= 10;
                left[1]--;
            }

            left[0] = Math.round(left[0] * 1e14) / 1e14;
            if (Math.abs(left[0]) === 10) {
                left[0] = 1;
                left[1]++;
            }

            return left;
        },
        pow: (left: [number, number], power: number): [number, number] => {
            if (power === 0) { return left[0] === 0 || isNaN(left[0]) ? [NaN, NaN] : [1, 0]; }
            if (left[0] === 0) { return power < 0 ? [NaN, NaN] : [0, 0]; }
            if (!isFinite(power)) {
                if (left[1] === 0 && (left[0] === 1 || (left[0] === -1 && !isNaN(power)))) { return [1, 0]; }
                if ((power === -Infinity && left[1] >= 0) || (power === Infinity && left[1] < 0)) { return [0, 0]; }
                return isNaN(power) || isNaN(left[0]) ? [NaN, NaN] : [Infinity, Infinity];
            }

            const negative = left[0] < 0 ? Math.abs(power) % 2 : null;
            if (negative !== null) { //Complex numbers are not supported
                if (Math.floor(power) !== power) { return [NaN, NaN]; }
                left[0] *= -1;
            }

            const base10 = power * (Math.log10(left[0]) + left[1]);
            if (!isFinite(base10)) {
                if (isNaN(left[0])) { return [NaN, NaN]; }
                if (base10 === -Infinity) { return [0, 0]; }
                return [negative === 1 ? -Infinity : Infinity, Infinity];
            }

            const target = Math.floor(base10);
            left[0] = 10 ** (base10 - target);
            left[1] = target;

            left[0] = Math.round(left[0] * 1e14) / 1e14;
            if (left[0] === 10) {
                left[0] = 1;
                left[1]++;
            }

            if (negative === 1) { left[0] *= -1; }
            return left;
        },
        log: (left: [number, number], base: number): [number, number] => {
            if (Math.abs(base) === 1 || (left[0] === -1 && left[1] === 0)) { return [NaN, NaN]; }
            if (left[0] === 1 && left[1] === 0) { return [0, 0]; }
            if (base === 0) { return [NaN, NaN]; } //Order matters (0 ** 0 === 1)
            if (left[0] === 0) { return isNaN(base) ? [NaN, NaN] : [Math.abs(base) > 1 ? -Infinity : Infinity, Infinity]; }
            if (!isFinite(base)) { return [NaN, NaN]; } //Order matters (Infinity ** 0 === 1 || Infinity ** -Infinity === 0)
            if (!isFinite(left[0])) {
                if (isNaN(left[0]) || left[0] === -Infinity) { return [NaN, NaN]; }
                return [Math.abs(base) < 1 ? -Infinity : Infinity, Infinity];
            }

            const negative = left[0] < 0;
            if (negative) { //Complex numbers are not supported
                if (base > 0) { return [NaN, NaN]; }
                left[0] *= -1;
            }

            const tooSmall = left[1] < 0; //Minor issue with negative power
            const base10 = Math.log10(Math.abs(Math.log10(left[0]) + left[1]));
            const target = Math.floor(base10);
            left[0] = 10 ** (base10 - target);
            left[1] = target;

            if (tooSmall) { left[0] *= -1; } //Already can be negative
            if (base !== 10) {
                left[0] /= Math.log10(Math.abs(base));

                const after = Math.abs(left[0]);
                if (after < 1 || after >= 10) {
                    const digits = Math.floor(Math.log10(after));
                    left[0] /= 10 ** digits;
                    left[1] += digits;
                }
            }

            if (base < 0 || negative) { //Special test for negative numbers
                if (left[1] < 0) { return [NaN, NaN]; }
                //Due to floats (1.1 * 100 !== 110), test is done in this way (also we assume that numbers are never uneven)
                const test = left[1] < 16 ? Math.abs(Math.round(left[0] * 1e14) / 10 ** (14 - left[1])) % 2 : 0;
                if (base < 0 && !negative) {
                    if (test !== 0) { return [NaN, NaN]; } //Result must be even
                } else { //base < 0 && negative
                    if (test !== 1) { return [NaN, NaN]; } //Result must be uneven
                }
            }

            left[0] = Math.round(left[0] * 1e14) / 1e14;
            if (Math.abs(left[0]) === 10) {
                left[0] = 1;
                left[1]++;
            }

            return left;
        },
        less: (left: [number, number], right: [number, number]): boolean => {
            if (left[0] === 0 || right[0] === 0 || left[1] === right[1]) { return left[0] < right[0]; }
            if (left[0] > 0 && right[0] > 0) { return left[1] < right[1]; }
            if (left[0] < 0 && right[0] > 0) { return true; }
            if (right[0] < 0 && left[0] > 0) { return false; }
            return left[1] > right[1];
        },
        lessOrEqual: (left: [number, number], right: [number, number]): boolean => {
            if (left[0] === 0 || right[0] === 0 || left[1] === right[1]) { return left[0] <= right[0]; }
            if (left[0] > 0 && right[0] > 0) { return left[1] < right[1]; }
            if (left[0] < 0 && right[0] > 0) { return true; }
            if (right[0] < 0 && left[0] > 0) { return false; }
            return left[1] > right[1];
        },
        more: (left: [number, number], right: [number, number]): boolean => {
            if (left[0] === 0 || right[0] === 0 || left[1] === right[1]) { return left[0] > right[0]; }
            if (left[0] > 0 && right[0] > 0) { return left[1] > right[1]; }
            if (left[0] < 0 && right[0] > 0) { return false; }
            if (right[0] < 0 && left[0] > 0) { return true; }
            return left[1] < right[1];
        },
        moreOrEqual: (left: [number, number], right: [number, number]): boolean => {
            if (left[0] === 0 || right[0] === 0 || left[1] === right[1]) { return left[0] >= right[0]; }
            if (left[0] > 0 && right[0] > 0) { return left[1] > right[1]; }
            if (left[0] < 0 && right[0] > 0) { return false; }
            if (right[0] < 0 && left[0] > 0) { return true; }
            return left[1] < right[1];
        },
        equal: (left: [number, number], right: [number, number]): boolean => {
            return left[1] === right[1] && left[0] === right[0];
        },
        notEqual: (left: [number, number], right: [number, number]): boolean => {
            return left[1] !== right[1] || left[0] !== right[0];
        },
        trunc: (left: [number, number]): [number, number] => {
            if (left[1] < 0) {
                return [0, 0];
            } else if (left[1] === 0) {
                left[0] = Math.trunc(left[0]);
            } else if (left[1] <= 14) {
                left[0] = Math.trunc(left[0] * 10 ** left[1]) / 10 ** left[1];
            }

            return left;
        },
        floor: (left: [number, number]): [number, number] => {
            if (left[1] < 0) {
                return [left[0] < 0 ? -1 : 0, 0];
            } else if (left[1] === 0) {
                left[0] = Math.floor(left[0]);
            } else if (left[1] <= 14) {
                left[0] = Math.floor(left[0] * 10 ** left[1]) / 10 ** left[1];
            }

            return left;
        },
        ceil: (left: [number, number]): [number, number] => {
            if (left[1] < 0) {
                return [left[0] < 0 ? 0 : 1, 0];
            } else if (left[1] === 0) {
                left[0] = Math.ceil(left[0]);
            } else if (left[1] <= 14) {
                left[0] = Math.ceil(left[0] * 10 ** left[1]) / 10 ** left[1];
            }

            return left;
        },
        round: (left: [number, number]): [number, number] => {
            if (left[1] < 0) {
                return [left[1] === -1 ? Math.round(left[0] / 10) : 0, 0];
            } else if (left[1] === 0) {
                left[0] = Math.round(left[0]);
            } else if (left[1] <= 14) {
                left[0] = Math.round(left[0] * 10 ** left[1]) / 10 ** left[1];
            }

            return left;
        },
        format: (left: [number, number], settings: { digits?: number, type?: 'number' | 'input', padding?: boolean }): string => {
            const [base, power] = left;
            if (!isFinite(base) || !isFinite(power)) { return overlimit.technical.convertBack(left); }
            const { format: setting } = overlimit.settings;
            //Using != null instead of ??, because esbuild creates >7 variables that are never used (and that annoys me)

            //1.23ee123 (-1.23e-e123)
            if ((power >= setting.maxPower || power <= -setting.maxPower) && settings.type !== 'input') {
                const digits = settings.digits != null ? settings.digits : setting.digits[1];
                let exponent = Math.floor(Math.log10(Math.abs(power)));
                let result = Math.abs(Math.round(power / 10 ** (exponent - digits)) / 10 ** digits);
                if (result === 10) {
                    result = 1;
                    exponent++;
                }
                if (base < 0) { result *= -1; }

                const formated = (settings.padding != null ? settings.padding : setting.padding) ?
                    result.toFixed(digits).replace('.', setting.point) : `${result}`.replace('.', setting.point);
                return `${formated}e${power < 0 ? '-' : ''}e${exponent}`;
            }

            //1.23e123
            if (power >= setting.power[0] || power < setting.power[1]) {
                const digits = settings.digits != null ? settings.digits : setting.digits[1];
                let exponent = power;
                let result: string | number = Math.round(base * 10 ** digits) / 10 ** digits;
                if (Math.abs(result) === 10) {
                    result = 1;
                    exponent++;
                }

                result = (settings.padding != null ? settings.padding : setting.padding) ? result.toFixed(digits) : `${result}`;
                return settings.type !== 'input' ? `${result.replace('.', setting.point)}e${exponent}` : `${result}e${exponent}`;
            }

            //12345
            const digits = settings.digits != null ? settings.digits : Math.max(setting.digits[2] - Math.max(power, 0), setting.digits[0]);
            const result = Math.round(base * 10 ** (digits + power)) / 10 ** digits;
            let formated = (settings.padding != null ? settings.padding : setting.padding) && digits > 0 ? result.toFixed(digits) : `${result}`;

            if (settings.type === 'input') { return formated; }
            formated = formated.replace('.', setting.point);
            return result >= 1e3 ? formated.replaceAll(/\B(?=(\d{3})+(?!\d))/g, setting.separator) : formated;
        },
        /* Convertion functions */
        convert: (number: string | number | [number, number]): [number, number] => {
            let result: [number, number];
            if (typeof number !== 'object' || number === null) { //Not an Array
                if (typeof number !== 'string') { number = `${number}`; } //Using log10 could cause floating point error
                const index = number.indexOf('e'); //About 5+ times quicker than regex
                result = index === -1 ? [Number(number), 0] : [Number(number.slice(0, index)), Number(number.slice(index + 1))];
            } else {
                result = [number[0], number[1]]; //Not instant return, because might need a fix
            }

            if (!isFinite(result[0])) { return isNaN(result[0]) ? [NaN, NaN] : [result[0], Infinity]; }

            const after = Math.abs(result[0]);
            if (after === 0) {
                result[1] = 0; //Just in case
            } else if (after < 1 || after >= 10) {
                const digits = Math.floor(Math.log10(after));
                result[0] /= 10 ** digits;
                result[1] += digits;

                if (Math.abs(result[0]) < 1) { //Happens more often than you would think
                    result[0] *= 10;
                    result[1]--;
                }
            }

            //Float fix always done after exponent, because (11.1 / 10 !== 1.11)
            result[0] = Math.round(result[0] * 1e14) / 1e14;
            if (Math.abs(result[0]) === 10) {
                result[0] = 1;
                result[1]++;
            }

            return result;
        },
        convertAll: (numbers: Array<string | number | [number, number]>): Array<[number, number]> => {
            const result = [];
            const { convert } = overlimit.technical;
            for (let i = 0; i < numbers.length; i++) {
                result[i] = convert(numbers[i]);
            }
            return result;
        },
        prepare: (number: [number, number]): [number, number] => {
            if (isFinite(number[0]) && isFinite(number[1])) { return number; }
            if (number[0] === 0 || number[1] === -Infinity) { return [0, 0]; }
            if (isNaN(number[0]) || isNaN(number[1])) { return [NaN, NaN]; }
            return [number[0] < 0 ? -Infinity : Infinity, Infinity]; //Base can be non Infinity
        },
        convertBack: (number: [number, number]): string => {
            number = overlimit.technical.prepare(number);
            if (!isFinite(number[0])) { return `${number[0]}`; }
            return number[1] === 0 ? `${number[0]}` : `${number[0]}e${number[1]}`;
        }
    }
};

export const { Limit, LimitAlt } = overlimit;
export default Limit;

/* Some alternative old functions */

//Calculate power 2 times slower, but with higher accuracy (?)
//Need a lot of safe guards (this is short version), also it was first version that I figured out
/*  let maxPower = Math.log(1e307) / Math.log(left[0]);
    if (Math.abs(power) >= maxPower) {
        do {
            power /= maxPower;
            left[1] *= maxPower;
            left[0] **= maxPower;
            const gainedPower = Math.floor(Math.log10(left[0]));
            left[1] += gainedPower;
            left[0] /= 10 ** gainedPower;
            maxPower = Math.log(1e307) / Math.log(left[0]);
        } while (Math.abs(power) >= maxPower);
    }
    left[1] *= power;
    left[0] **= power; */
//I got current formula for power from looking at maxPower formula...

//Quicker Logarith, but less safe for really big exponents (1e300)
//Got it from combining these > logA(X) = logB(X) / logB(A); and logA(X) = 1 / logX(A);
//To get > logX(A) = logB(A) / logB(X); Where B can be any number, but was taken as 10
/*  const base10 = Math.log10(left[0]) + left[1];
    left = base === 10 ? [base10, 0] : [base10 / Math.log10(base), 0]; */
//Current formula is just changed order of stuff
