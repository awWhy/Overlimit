/* Overlimit - awWhy's version of break infinity (or Decimal):
    From -1e1.8e308 to 1e1.8e308; Also allows small numbers like up to (1e-1.8e308)
    Beyond 1e9e15 or 1 ** 10 ** maxSafeInteger, precision for exponent will decrease (multiply by 10 won't work and etc)

    Altered JS math rules:
    '1 ** Infinity', '1 ** NaN' now returns 1 instead of NaN
    '0 ** 0', 'NaN ** 0' now retuns NaN instead of 1
    '0 * Infinity', '0 * NaN' now returns 0 instead of NaN
    'Infinity / 0', '-x ** Infinity' now returns NaN instead of Infinity
    '0 / NaN' now returns 0 instead of NaN
    Kept weird JS rules:
    'Infinity ** 0' returns 1 (NaN not included because its true value could be 0)
    'X / -+Infinity' returns 0 (precision being lost will result in 0)
    Idea is that 0 could be 1e-324 is not taken, because precision lost Math doesnt work like this
    If we would allow idea of that type then any value multiplied by 0 should be NaN (1e-324 * 1e308)
*/

/* Can be added if needed: (probably wont be added since no longer uses it)
    rules: Add option to change outcome for some Math rules (x/0, 0**0 and etc.)
    power, root, log: Allow second argument to be not a number (and bigger than 2 ** 1024)
    mantissa: Allow to remove first digit for really big numbers (-1e1e1 > -e1e1)
    optimization: Add non doAll (as example .mutliply that can take only 1 argument) function types, no idea if that is a required potential optimization (its ~6% faster)
    format: More options to format function object argument: At least digits
    format: Add format for power with a special separator: 1e12345 > 1e12,345
    calculator: Add website with calculator for testing
*/

type allowedTypes = string | number | bigint | [number, number] | Overlimit;
/** To test number for being Overlimit can use: typeof number === 'object'; Array.isArray(number); number instanceof Overlimit
 * @param number allowed types are string, number, bigint, Overlimit and [number, number]; If Array is used, then must not contain any mistakes (example and proper way: [11, 0] > [1.1, 1]; [1, NaN] > [NaN, NaN]; [1, 1.4] > [1, 1])
 */
export default class Overlimit extends Array<number> {
    constructor(number: allowedTypes) {
        const post = technical.convert(number);
        super(post[0], post[1]);
    }
    get mantissa() { return this[0]; }
    get exponent() { return this[1]; }

    static settings = {
        /** Default settings for format function */
        format: {
            /** Everything related to most basic style (123.45) */
            base: {
                /** Max amount of allowed digits past the point */
                maxDigits: 5,
                /** Min amount of digits allowed past the point (reduced by every new digit, example: 1.23456 > 12345.6) */
                minDigits: 0
            },
            /** Everything related to shorted exponent style (123e45) */
            power: {
                /** At what exponent should switch to this style; [possitive, negative] */
                convert: [6, -3],
                /** Max amount of allowed digits past the point */
                maxDigits: 3,
                /** Min amount of digits allowed past the point (reduced by every new digit, example: 1.234e5 > 1.2e345) */
                minDigits: 0
            },
            /** Everything related to big exponent style (123ee45) */
            bigPower: {
                /** At what exponent should switch to this style */
                convert: 1e4,
                /** If should be using '2.34ee3' instead of 'e2.34e3' ('input' type will ignore this and also add mantissa) */
                short: true,
                /** Max amount of allowed digits past the point */
                maxDigits: 2,
                /** Min amount of digits allowed past the point (reduced by every new digit, example: 1.23ee4 > 1ee234) */
                minDigits: 0
            },
            /** True means zero's will be added after dot until required digits amount is reached \
             * Can use value 'exponent' to set to true only if converted to power style or above
             */
            padding: false as boolean | 'exponent',
            /** What format should use instead of dot (1.23) */
            point: '.',
            /** What format should use instead of thousand separator (1 234) \
             * There is no power separator
             */
            separator: ''
        }
    };

    /** Can be used inside native sorting function, equal to a - b. First variable must be Overlimit, doesn't require cloning, example: [1, '2', new Overlimit(3)].sort((a, b) => Overlimit.compareFunc(new Overlimit(b), a)) */
    static compareFunc(left: Overlimit, right: allowedTypes): 1 | 0 | -1 {
        return left.moreThan(right) ? 1 : left.notEqual(right) ? -1 : 0;
    }

    /** Creates new Overlimit */
    clone(): Overlimit { return new Overlimit(this); }
    setValue(newValue: allowedTypes) { return this.#privateSet(technical.convert(newValue)); }
    #privateSet(newValue: [number, number] | Overlimit) {
        this[0] = newValue[0];
        this[1] = newValue[1];
        return this;
    }

    /** Can take any amount of arquments */
    plus(...numbers: allowedTypes[]) {
        let result: [number, number] | Overlimit = this;
        for (let i = 0; i < numbers.length; i++) {
            result = technical.add(result, technical.convert(numbers[i]));
        }

        return this.#privateSet(result);
    }
    /** Can take any amount of arquments */
    minus(...numbers: allowedTypes[]) {
        let result: [number, number] | Overlimit = this;
        for (let i = 0; i < numbers.length; i++) {
            result = technical.sub(result, technical.convert(numbers[i]));
        }

        return this.#privateSet(result);
    }
    /** Can take any amount of arquments */
    multiply(...numbers: allowedTypes[]) {
        let result: [number, number] | Overlimit = this;
        for (let i = 0; i < numbers.length; i++) {
            result = technical.mult(result, technical.convert(numbers[i]));
        }

        return this.#privateSet(result);
    }
    /** Can take any amount of arquments */
    divide(...numbers: allowedTypes[]) {
        let result: [number, number] | Overlimit = this;
        for (let i = 0; i < numbers.length; i++) {
            result = technical.div(result, technical.convert(numbers[i]));
        }

        return this.#privateSet(result);
    }
    /** Power must be a number */
    power(power: number) { return this.#privateSet(technical.pow(this, power)); }
    /** Root must be a number, default value is 2 */
    root(root = 2) { return this.#privateSet(technical.pow(this, 1 / root)); }
    /** Base must be a number, default value is Math.E */
    log(base = 2.718281828459045) { return this.#privateSet(technical.log(this, base)); }

    abs() {
        this[0] = Math.abs(this[0]);
        return this;
    }

    trunc() { return this.#privateSet(technical.trunc(this)); }
    floor() { return this.#privateSet(technical.floor(this)); }
    ceil() { return this.#privateSet(technical.ceil(this)); }
    round() { return this.#privateSet(technical.round(this)); }

    /** Doesn't check exponent, since exponent being NaN while mantissa isn't would be a bug */
    isNaN(): boolean { return isNaN(this[0])/* || isNaN(this[1])*/; }
    /** Will set new value to provided, but only if current one is NaN */
    replaceNaN(replaceWith: allowedTypes): Overlimit { return isNaN(this[0]) ? this.#privateSet(technical.convert(replaceWith)) : this; }
    /** Doesn't check exponent, since exponent being Infinity while mantissa isn't would be a bug */
    isFinite(): boolean { return isFinite(this[0])/* && isFinite(this[1])*/; }

    lessThan(compare: allowedTypes): boolean { return technical.less(this, technical.convert(compare)); }
    lessOrEqual(compare: allowedTypes): boolean { return technical.lessOrEqual(this, technical.convert(compare)); }
    moreThan(compare: allowedTypes): boolean { return technical.more(this, technical.convert(compare)); }
    moreOrEqual(compare: allowedTypes): boolean { return technical.moreOrEqual(this, technical.convert(compare)); }
    notEqual(compare: allowedTypes): boolean { return technical.notEqual(this, technical.convert(compare)); }
    /** Can take any amount of arquments; Returns true if no arquments provided */
    equal(...compare: allowedTypes[]): boolean {
        let previous: [number, number] | Overlimit = this;
        for (let i = 0; i < compare.length; i++) {
            const next = technical.convert(compare[i]);
            if (technical.notEqual(previous, next)) { return false; }
            previous = next;
        }

        return true;
    }

    /** Set original number to biggest of provided arguments */
    max(...compare: allowedTypes[]) {
        let result: [number, number] | Overlimit = this;
        for (let i = 0; i < compare.length; i++) {
            const after = technical.convert(compare[i]);
            if (isNaN(after[0])) { return this.#privateSet([NaN, NaN]); }

            if (technical.less(result, after)) { result = after; }
        }

        return this.#privateSet(result);
    }
    /** Set original number to smallest of provided arguments */
    min(...compare: allowedTypes[]) {
        let result: [number, number] | Overlimit = this;
        for (let i = 0; i < compare.length; i++) {
            const after = technical.convert(compare[i]);
            if (isNaN(after[0])) { return this.#privateSet([NaN, NaN]); }

            if (technical.more(result, after)) { result = after; }
        }

        return this.#privateSet(result);
    }

    /** Returns formatted string, takes object as arqument
     * @param type "number" is default, "input" will make formatted number to be usable in Overlimit
     * @param padding should zeros be added past point, if below max digits. 'exponent' value will behave as true, but only after number turns to power version or above
     */
    format(settings = {} as { type?: 'number' | 'input', padding?: boolean | 'exponent' }): string { return technical.format(this, settings); }
    /** Returns value as Number, doesn't change original number */
    toNumber(): number { return Number(technical.turnString(this)); }
    /** Same as .toNumber, but also converts Infinity (and NaN; can use replaceNaN before calling this function) to Number.MAX_VALUE */
    toSafeNumber(): number {
        const result = Number(technical.turnString(this));
        if (isFinite(result)) { return result; }
        return Number.MAX_VALUE * (result < 0 ? -1 : 1);
    }
    /** Returns value as String, doesn't change original number */
    toString(): string { return technical.turnString(this); }
    /** Returns value as Array, doesn't change original number */
    toArray(): [number, number] { return [this[0], this[1]]; }
    /** Automatically called with JSON.stringify. It will call toString to preserve NaN and Infinity */
    toJSON(): string { return technical.turnString(this); }
}

/** Private Overlimit functions */
const technical = {
    convert: (number: allowedTypes): [number, number] | Overlimit => {
        if (typeof number === 'object' && number !== null) { return number; } //Readonly Array
        if (typeof number !== 'string') { number = `${number}`; } //Using log10 could cause floating point error
        const index = number.indexOf('e'); //Array.split is 3 times slower
        const result: [number, number] = index === -1 ? [Number(number), 0] : [Number(number.slice(0, index)), Number(number.slice(index + 1))];

        if (!isFinite(result[0]) || !isFinite(result[1])) {
            if (result[0] === 0 || result[1] === -Infinity) { return [0, 0]; }
            if (isNaN(result[0]) || isNaN(result[1])) { return [NaN, NaN]; }
            return [result[0] < 0 ? -Infinity : Infinity, Infinity];
        }

        const after = Math.abs(result[0]);
        if (after === 0) {
            return [0, 0];
        } else if (after < 1 || after >= 10) {
            const digits = Math.floor(Math.log10(after));
            result[0] /= 10 ** digits;
            result[1] += digits;

            if (Math.abs(result[0]) < 1) { //Important
                result[0] *= 10;
                result[1]--;
            }
        }

        //Float fix always done after exponent, because (11.1 / 10 !== 1.11)
        result[0] = Math.round(result[0] * 1e14) / 1e14;
        if (Math.abs(result[0]) === 10) {
            result[0] /= 10;
            result[1]++;
        }

        return result;
    },
    /* Number is readonly */
    turnString: (number: [number, number] | Overlimit): string => number[1] === 0 || !isFinite(number[0]) ? `${number[0]}` : `${number[0]}e${number[1]}`,
    /* Right is readonly */
    add: (left: [number, number] | Overlimit, right: [number, number] | Overlimit): [number, number] | Overlimit => {
        if (right[0] === 0) { return left; }
        if (left[0] === 0) { return [right[0], right[1]]; }
        if (!isFinite(left[0]) || !isFinite(right[0])) {
            const check = left[0] + right[0]; //Infinity + -Infinity === NaN
            return isNaN(check) ? [NaN, NaN] : [check, Infinity];
        }

        const difference = left[1] - right[1];
        if (Math.abs(difference) >= 16) { return difference > 0 ? left : [right[0], right[1]]; }

        if (difference === 0) {
            left[0] += right[0];
        } else if (difference > 0) {
            left[0] += right[0] / 10 ** difference;
        } else {
            left[0] = right[0] + (left[0] * 10 ** difference);
            left[1] = right[1];
        }

        const after = Math.abs(left[0]);
        if (after === 0) {
            return [0, 0];
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
            left[0] /= 10;
            left[1]++;
        }

        return left;
    },
    /* Right is readonly, its quite a lazy function... */
    sub: (left: [number, number] | Overlimit, right: [number, number] | Overlimit): [number, number] | Overlimit => technical.add(left, [-right[0], right[1]]),
    /* Right is readonly */
    mult: (left: [number, number] | Overlimit, right: [number, number] | Overlimit): [number, number] | Overlimit => {
        if (left[0] === 0 || right[0] === 0) { return [0, 0]; }

        left[1] += right[1];
        left[0] *= right[0];

        if (!isFinite(left[1])) {
            if (left[1] === -Infinity) { return [0, 0]; }
            return isNaN(left[1]) ? [NaN, NaN] : [Infinity, Infinity];
        }

        if (Math.abs(left[0]) >= 10) {
            left[0] /= 10;
            left[1]++;
        }

        left[0] = Math.round(left[0] * 1e14) / 1e14;
        if (Math.abs(left[0]) === 10) {
            left[0] /= 10;
            left[1]++;
        }

        return left;
    },
    /* Right is readonly */
    div: (left: [number, number] | Overlimit, right: [number, number] | Overlimit): [number, number] | Overlimit => {
        if (right[0] === 0) { return [NaN, NaN]; }
        if (left[0] === 0) { return [0, 0]; }

        left[1] -= right[1];
        left[0] /= right[0];

        if (!isFinite(left[1])) {
            if (left[1] === -Infinity) { return [0, 0]; }
            return isNaN(left[1]) ? [NaN, NaN] : [Infinity, Infinity];
        }

        if (Math.abs(left[0]) < 1) {
            left[0] *= 10;
            left[1]--;
        }

        left[0] = Math.round(left[0] * 1e14) / 1e14;
        if (Math.abs(left[0]) === 10) {
            left[0] /= 10;
            left[1]++;
        }

        return left;
    },
    pow: (left: [number, number] | Overlimit, power: number): [number, number] | Overlimit => {
        if (power === 0) { return left[0] === 0 || isNaN(left[0]) ? [NaN, NaN] : [1, 0]; }
        if (left[0] === 0) { return power < 0 ? [NaN, NaN] : [0, 0]; }
        if (!isFinite(power)) {
            if ((left[1] === 0 && left[0] === 1) || left[0] < 0) { return left[0] === 1 ? [1, 0] : [NaN, NaN]; }
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
            if (base10 === -Infinity) { return [0, 0]; }
            if (isNaN(left[0])) { return [NaN, NaN]; }
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
    log: (left: [number, number] | Overlimit, base: number): [number, number] | Overlimit => {
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
            //Due to floats (1.1 * 100 !== 110), test is done in this way (also we assume that big numbers are never uneven)
            const test = left[1] < 16 ? Math.abs(Math.round(left[0] * 1e14) / 10 ** (14 - left[1])) % 2 : 0;
            if (base < 0 && !negative) {
                if (test !== 0) { return [NaN, NaN]; } //Result must be even
            } else { //base < 0 && negative
                if (test !== 1) { return [NaN, NaN]; } //Result must be uneven
            }
        }

        left[0] = Math.round(left[0] * 1e14) / 1e14;
        if (Math.abs(left[0]) === 10) {
            left[0] /= 10;
            left[1]++;
        }

        return left;
    },
    /* Left and right are readonly */
    less: (left: [number, number] | Overlimit, right: [number, number] | Overlimit): boolean => {
        if (left[0] === 0 || right[0] === 0 || left[1] === right[1]) { return left[0] < right[0]; }
        if (left[0] > 0 && right[0] > 0) { return left[1] < right[1]; }
        if (left[0] < 0 && right[0] > 0) { return true; }
        if (right[0] < 0 && left[0] > 0) { return false; }
        return left[1] > right[1];
    },
    /* Left and right are readonly */
    lessOrEqual: (left: [number, number] | Overlimit, right: [number, number] | Overlimit): boolean => {
        if (left[0] === 0 || right[0] === 0 || left[1] === right[1]) { return left[0] <= right[0]; }
        if (left[0] > 0 && right[0] > 0) { return left[1] < right[1]; }
        if (left[0] < 0 && right[0] > 0) { return true; }
        if (right[0] < 0 && left[0] > 0) { return false; }
        return left[1] > right[1];
    },
    /* Left and right are readonly */
    more: (left: [number, number] | Overlimit, right: [number, number] | Overlimit): boolean => {
        if (left[0] === 0 || right[0] === 0 || left[1] === right[1]) { return left[0] > right[0]; }
        if (left[0] > 0 && right[0] > 0) { return left[1] > right[1]; }
        if (left[0] < 0 && right[0] > 0) { return false; }
        if (right[0] < 0 && left[0] > 0) { return true; }
        return left[1] < right[1];
    },
    /* Left and right are readonly */
    moreOrEqual: (left: [number, number] | Overlimit, right: [number, number] | Overlimit): boolean => {
        if (left[0] === 0 || right[0] === 0 || left[1] === right[1]) { return left[0] >= right[0]; }
        if (left[0] > 0 && right[0] > 0) { return left[1] > right[1]; }
        if (left[0] < 0 && right[0] > 0) { return false; }
        if (right[0] < 0 && left[0] > 0) { return true; }
        return left[1] < right[1];
    },
    /* Left and right are readonly */
    notEqual: (left: [number, number] | Overlimit, right: [number, number] | Overlimit): boolean => {
        return left[1] !== right[1] || left[0] !== right[0];
    },
    trunc: (left: [number, number] | Overlimit): [number, number] | Overlimit => {
        if (left[1] < 0) {
            return [0, 0];
        } else if (left[1] === 0) {
            left[0] = Math.trunc(left[0]);
        } else if (left[1] <= 14) {
            left[0] = Math.trunc(left[0] * 10 ** left[1]) / 10 ** left[1];
        }

        return left;
    },
    floor: (left: [number, number] | Overlimit): [number, number] | Overlimit => {
        if (left[1] < 0) {
            return [left[0] < 0 ? -1 : 0, 0];
        } else if (left[1] === 0) {
            left[0] = Math.floor(left[0]);
        } else if (left[1] <= 14) {
            left[0] = Math.floor(left[0] * 10 ** left[1]) / 10 ** left[1];
        }

        if (left[0] === -10) {
            left[0] = -1;
            left[1]++;
        }
        return left;
    },
    ceil: (left: [number, number] | Overlimit): [number, number] | Overlimit => {
        if (left[1] < 0) {
            return [left[0] < 0 ? 0 : 1, 0];
        } else if (left[1] === 0) {
            left[0] = Math.ceil(left[0]);
        } else if (left[1] <= 14) {
            left[0] = Math.ceil(left[0] * 10 ** left[1]) / 10 ** left[1];
        }

        if (left[0] === 10) {
            left[0] = 1;
            left[1]++;
        }
        return left;
    },
    round: (left: [number, number] | Overlimit): [number, number] | Overlimit => {
        if (left[1] < 0) {
            return [left[1] === -1 ? Math.round(left[0] / 10) : 0, 0];
        } else if (left[1] === 0) {
            left[0] = Math.round(left[0]);
        } else if (left[1] <= 14) {
            left[0] = Math.round(left[0] * 10 ** left[1]) / 10 ** left[1];
        }

        if (Math.abs(left[0]) === 10) {
            left[0] /= 10;
            left[1]++;
        }
        return left;
    },
    /* Left is readonly */
    format: (left: [number, number] | Overlimit, settings: { type?: 'number' | 'input', padding?: boolean | 'exponent' }): string => {
        const [base, power] = left;
        if (!isFinite(base)) { return `${base}`; }
        const defaultSettings = Overlimit.settings.format;
        const type = settings.type ?? 'number';
        let padding = settings.padding ?? defaultSettings.padding;

        const bigPowerSettings = defaultSettings.bigPower;
        if (power >= bigPowerSettings.convert || power <= -bigPowerSettings.convert) { //e1.23e123 (-e-1.23e123)
            if (padding === 'exponent') { padding = true; }
            let exponent = power;
            let inputBase = base;
            if (Math.abs(Math.round(inputBase)) === 10) { //Probably not required, but just in case
                inputBase /= 10;
                exponent++;
                if (exponent < 0 && exponent > -bigPowerSettings.convert) { return technical.format([inputBase, exponent], settings); }
            }

            exponent = Math.floor(Math.log10(Math.abs(exponent)));
            let digits = Math.max(bigPowerSettings.maxDigits - Math.floor(Math.log10(exponent)), bigPowerSettings.minDigits);
            let mantissa = Math.round(power / 10 ** (exponent - digits)) / 10 ** digits;
            if (Math.abs(mantissa) === 10) { //To remove rare bugs
                mantissa /= 10;
                exponent++;
                if (padding) { digits = Math.max(bigPowerSettings.maxDigits - Math.floor(Math.log10(Math.abs(exponent))), bigPowerSettings.minDigits); }
            }

            const short = type !== 'input' && bigPowerSettings.short; //1.23ee123 (-1.23e-e123)
            if (short) { mantissa = Math.abs(mantissa); }
            const formated = padding ? mantissa.toFixed(digits) : `${mantissa}`;
            if (type === 'input') { return `${inputBase}e${formated}e${exponent}`; }
            return `${base < 0 ? '-' : ''}${short ? '' : 'e'}${formated.replace('.', defaultSettings.point)}${short ? `e${power < 0 ? '-' : ''}` : ''}e${exponent}`;
        }

        const powerSettings = defaultSettings.power;
        if (power >= powerSettings.convert[0] || power < powerSettings.convert[1]) { //1.23e123 (-1.23e-123)
            if (padding === 'exponent') { padding = true; }

            let digits = Math.max(powerSettings.maxDigits - Math.floor(Math.log10(Math.abs(power))), powerSettings.minDigits);
            let mantissa = Math.round(base * 10 ** digits) / 10 ** digits;
            let exponent = power;
            if (Math.abs(mantissa) === 10) { //To remove rare bugs
                mantissa /= 10;
                exponent++;
                if (exponent === powerSettings.convert[1] || exponent === bigPowerSettings.convert) { return technical.format([mantissa, exponent], settings); }
                if (padding) { digits = Math.max(powerSettings.maxDigits - Math.floor(Math.log10(Math.abs(exponent))), powerSettings.minDigits); }
            }

            const formated = padding ? mantissa.toFixed(digits) : `${mantissa}`;
            return type === 'input' ? `${formated}e${exponent}` : `${formated.replace('.', defaultSettings.point)}e${exponent}`;
        }

        //12345 (-12345)
        const baseSettings = defaultSettings.base;
        let digits = power < 1 ? baseSettings.maxDigits :
            Math.max(baseSettings.maxDigits - power, baseSettings.minDigits);
        const mantissa = Math.round(base * 10 ** (digits + power)) / 10 ** digits;

        const powerCheck = Math.floor(Math.log10(Math.abs(mantissa))); //To remove rare bugs
        if (powerCheck === powerSettings.convert[0]) { return technical.format([base < 0 ? -1 : 1, powerCheck], settings); }
        if (padding === 'exponent') {
            padding = false;
        } else if (padding && powerCheck !== power) {
            digits = powerCheck < 1 ? baseSettings.maxDigits :
                Math.max(baseSettings.maxDigits - powerCheck, baseSettings.minDigits);
        }

        let formated = padding ? mantissa.toFixed(digits) : `${mantissa}`;
        if (type === 'input') { return formated; }
        let ending = ''; //Being lazy
        const index = formated.indexOf('.');
        if (index !== -1) { //For some reason this replaces dot 2 times faster (?), also fixes spaces after dot
            ending = `${defaultSettings.point}${formated.slice(index + 1)}`;
            formated = formated.slice(0, index);
        }
        return `${mantissa >= 1e3 ? formated.replaceAll(/\B(?=(\d{3})+(?!\d))/g, defaultSettings.separator) : formated}${ending}`;
    }
};
