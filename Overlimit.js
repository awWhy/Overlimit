"use strict";
export default class Overlimit extends Array {
  constructor(number) {
    const post = technical.convert(number);
    super(post[0], post[1]);
  }
  get mantissa() {
    return this[0];
  }
  get exponent() {
    return this[1];
  }
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
      padding: false,
      /** What format should use instead of dot (1.23) */
      point: ".",
      /** What format should use instead of thousand separator (1 234) \
       * There is no power separator
       */
      separator: ""
    }
  };
  /** Can be used inside native sorting function, equal to a - b. First variable must be Overlimit, doesn't require cloning, example: [1, '2', new Overlimit(3)].sort((a, b) => Overlimit.compareFunc(new Overlimit(b), a)) */
  static compareFunc(left, right) {
    return left.moreThan(right) ? 1 : left.notEqual(right) ? -1 : 0;
  }
  /** Creates new Overlimit */
  clone() {
    return new Overlimit(this);
  }
  setValue(newValue) {
    return this.#privateSet(technical.convert(newValue));
  }
  #privateSet(newValue) {
    this[0] = newValue[0];
    this[1] = newValue[1];
    return this;
  }
  /** Can take any amount of arquments */
  plus(...numbers) {
    let result = this;
    for (let i = 0; i < numbers.length; i++) {
      result = technical.add(result, technical.convert(numbers[i]));
    }
    return this.#privateSet(result);
  }
  /** Can take any amount of arquments */
  minus(...numbers) {
    let result = this;
    for (let i = 0; i < numbers.length; i++) {
      result = technical.sub(result, technical.convert(numbers[i]));
    }
    return this.#privateSet(result);
  }
  /** Can take any amount of arquments */
  multiply(...numbers) {
    let result = this;
    for (let i = 0; i < numbers.length; i++) {
      result = technical.mult(result, technical.convert(numbers[i]));
    }
    return this.#privateSet(result);
  }
  /** Can take any amount of arquments */
  divide(...numbers) {
    let result = this;
    for (let i = 0; i < numbers.length; i++) {
      result = technical.div(result, technical.convert(numbers[i]));
    }
    return this.#privateSet(result);
  }
  /** Power must be a number */
  power(power) {
    return this.#privateSet(technical.pow(this, power));
  }
  /** Root must be a number, default value is 2 */
  root(root = 2) {
    return this.#privateSet(technical.pow(this, 1 / root));
  }
  /** Base must be a number, default value is Math.E */
  log(base = 2.718281828459045) {
    return this.#privateSet(technical.log(this, base));
  }
  abs() {
    this[0] = Math.abs(this[0]);
    return this;
  }
  trunc() {
    return this.#privateSet(technical.trunc(this));
  }
  floor() {
    return this.#privateSet(technical.floor(this));
  }
  ceil() {
    return this.#privateSet(technical.ceil(this));
  }
  round() {
    return this.#privateSet(technical.round(this));
  }
  /** Doesn't check exponent, since exponent being NaN while mantissa isn't would be a bug */
  isNaN() {
    return isNaN(this[0]);
  }
  /** Will set new value to provided, but only if current one is NaN */
  replaceNaN(replaceWith) {
    return this.isNaN() ? this.setValue(replaceWith) : this;
  }
  /** Doesn't check exponent, since exponent being Infinity while mantissa isn't would be a bug */
  isFinite() {
    return isFinite(this[0]);
  }
  lessThan(compare) {
    return technical.less(this, technical.convert(compare));
  }
  lessOrEqual(compare) {
    return technical.lessOrEqual(this, technical.convert(compare));
  }
  moreThan(compare) {
    return technical.more(this, technical.convert(compare));
  }
  moreOrEqual(compare) {
    return technical.moreOrEqual(this, technical.convert(compare));
  }
  notEqual(compare) {
    return technical.notEqual(this, technical.convert(compare));
  }
  /** Can take any amount of arquments; Returns true if no arquments provided */
  equal(...compare) {
    let previous = this;
    for (let i = 0; i < compare.length; i++) {
      const next = technical.convert(compare[i]);
      if (technical.notEqual(previous, next)) {
        return false;
      }
      previous = next;
    }
    return true;
  }
  /** Set original number to biggest of provided arguments */
  max(...compare) {
    let result = this;
    for (let i = 0; i < compare.length; i++) {
      const after = technical.convert(compare[i]);
      if (isNaN(after[0])) {
        return this.#privateSet([NaN, NaN]);
      }
      if (technical.less(result, after)) {
        result = after;
      }
    }
    return this.#privateSet(result);
  }
  /** Set original number to smallest of provided arguments */
  min(...compare) {
    let result = this;
    for (let i = 0; i < compare.length; i++) {
      const after = technical.convert(compare[i]);
      if (isNaN(after[0])) {
        return this.#privateSet([NaN, NaN]);
      }
      if (technical.more(result, after)) {
        result = after;
      }
    }
    return this.#privateSet(result);
  }
  /** Returns formatted string, takes object as arqument
   * @param type "number" is default, "input" will make formatted number to be usable in Overlimit
   * @param padding should zeros be added past point, if below max digits. 'exponent' value will behave as true, but only after number turns to power version or above
   */
  format(settings = {}) {
    return technical.format(this, settings);
  }
  /** Returns value as Number, doesn't change original number */
  toNumber() {
    return Number(technical.turnString(this));
  }
  /** Same as .toNumber, but also converts Infinity (and NaN; can use replaceNaN before calling this function) to Number.MAX_VALUE */
  toSafeNumber() {
    const result = Number(technical.turnString(this));
    if (isFinite(result)) {
      return result;
    }
    return Number.MAX_VALUE * (result < 0 ? -1 : 1);
  }
  /** Returns value as String, doesn't change original number */
  toString() {
    return technical.turnString(this);
  }
  /** Returns value as Array, doesn't change original number */
  toArray() {
    return [this[0], this[1]];
  }
  /** Automatically called with JSON.stringify. It will call toString to preserve NaN and Infinity */
  toJSON() {
    return technical.turnString(this);
  }
}
const technical = {
  convert: (number) => {
    if (typeof number === "object" && number !== null) {
      return number;
    }
    if (typeof number !== "string") {
      number = `${number}`;
    }
    const index = number.indexOf("e");
    const result = index === -1 ? [Number(number), 0] : [Number(number.slice(0, index)), Number(number.slice(index + 1))];
    if (!isFinite(result[0]) || !isFinite(result[1])) {
      if (result[0] === 0 || result[1] === -Infinity) {
        return [0, 0];
      }
      if (isNaN(result[0]) || isNaN(result[1])) {
        return [NaN, NaN];
      }
      return [result[0] < 0 ? -Infinity : Infinity, Infinity];
    }
    const after = Math.abs(result[0]);
    if (after === 0) {
      return [0, 0];
    } else if (after < 1 || after >= 10) {
      const digits = Math.floor(Math.log10(after));
      result[0] /= 10 ** digits;
      result[1] += digits;
      if (Math.abs(result[0]) < 1) {
        result[0] *= 10;
        result[1]--;
      }
    }
    result[0] = Math.round(result[0] * 1e14) / 1e14;
    if (Math.abs(result[0]) === 10) {
      result[0] /= 10;
      result[1]++;
    }
    return result;
  },
  /* Number is readonly */
  turnString: (number) => number[1] === 0 || !isFinite(number[0]) ? `${number[0]}` : `${number[0]}e${number[1]}`,
  /* Right is readonly */
  add: (left, right) => {
    if (right[0] === 0) {
      return left;
    }
    if (left[0] === 0) {
      return [right[0], right[1]];
    }
    if (!isFinite(left[0]) || !isFinite(right[0])) {
      const check = left[0] + right[0];
      return isNaN(check) ? [NaN, NaN] : [check, Infinity];
    }
    const difference = left[1] - right[1];
    if (Math.abs(difference) >= 16) {
      return difference > 0 ? left : [right[0], right[1]];
    }
    if (difference === 0) {
      left[0] += right[0];
    } else if (difference > 0) {
      left[0] += right[0] / 10 ** difference;
    } else {
      left[0] = right[0] + left[0] * 10 ** difference;
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
  sub: (left, right) => technical.add(left, [-right[0], right[1]]),
  /* Right is readonly */
  mult: (left, right) => {
    if (left[0] === 0 || right[0] === 0) {
      return [0, 0];
    }
    left[1] += right[1];
    left[0] *= right[0];
    if (!isFinite(left[1])) {
      if (left[1] === -Infinity) {
        return [0, 0];
      }
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
  div: (left, right) => {
    if (right[0] === 0) {
      return [NaN, NaN];
    }
    if (left[0] === 0) {
      return [0, 0];
    }
    left[1] -= right[1];
    left[0] /= right[0];
    if (!isFinite(left[1])) {
      if (left[1] === -Infinity) {
        return [0, 0];
      }
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
  pow: (left, power) => {
    if (power === 0) {
      return left[0] === 0 || isNaN(left[0]) ? [NaN, NaN] : [1, 0];
    }
    if (left[0] === 0) {
      return power < 0 ? [NaN, NaN] : [0, 0];
    }
    if (!isFinite(power)) {
      if (left[1] === 0 && left[0] === 1 || left[0] < 0) {
        return left[0] === 1 ? [1, 0] : [NaN, NaN];
      }
      if (power === -Infinity && left[1] >= 0 || power === Infinity && left[1] < 0) {
        return [0, 0];
      }
      return isNaN(power) || isNaN(left[0]) ? [NaN, NaN] : [Infinity, Infinity];
    }
    const negative = left[0] < 0 ? Math.abs(power) % 2 : null;
    if (negative !== null) {
      if (Math.floor(power) !== power) {
        return [NaN, NaN];
      }
      left[0] *= -1;
    }
    const base10 = power * (Math.log10(left[0]) + left[1]);
    if (!isFinite(base10)) {
      if (base10 === -Infinity) {
        return [0, 0];
      }
      if (isNaN(left[0])) {
        return [NaN, NaN];
      }
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
    if (negative === 1) {
      left[0] *= -1;
    }
    return left;
  },
  log: (left, base) => {
    if (Math.abs(base) === 1 || left[0] === -1 && left[1] === 0) {
      return [NaN, NaN];
    }
    if (left[0] === 1 && left[1] === 0) {
      return [0, 0];
    }
    if (base === 0) {
      return [NaN, NaN];
    }
    if (left[0] === 0) {
      return isNaN(base) ? [NaN, NaN] : [Math.abs(base) > 1 ? -Infinity : Infinity, Infinity];
    }
    if (!isFinite(base)) {
      return [NaN, NaN];
    }
    if (!isFinite(left[0])) {
      if (isNaN(left[0]) || left[0] === -Infinity) {
        return [NaN, NaN];
      }
      return [Math.abs(base) < 1 ? -Infinity : Infinity, Infinity];
    }
    const negative = left[0] < 0;
    if (negative) {
      if (base > 0) {
        return [NaN, NaN];
      }
      left[0] *= -1;
    }
    const tooSmall = left[1] < 0;
    const base10 = Math.log10(Math.abs(Math.log10(left[0]) + left[1]));
    const target = Math.floor(base10);
    left[0] = 10 ** (base10 - target);
    left[1] = target;
    if (tooSmall) {
      left[0] *= -1;
    }
    if (base !== 10) {
      left[0] /= Math.log10(Math.abs(base));
      const after = Math.abs(left[0]);
      if (after < 1 || after >= 10) {
        const digits = Math.floor(Math.log10(after));
        left[0] /= 10 ** digits;
        left[1] += digits;
      }
    }
    if (base < 0 || negative) {
      if (left[1] < 0) {
        return [NaN, NaN];
      }
      const test = left[1] < 16 ? Math.abs(Math.round(left[0] * 1e14) / 10 ** (14 - left[1])) % 2 : 0;
      if (base < 0 && !negative) {
        if (test !== 0) {
          return [NaN, NaN];
        }
      } else {
        if (test !== 1) {
          return [NaN, NaN];
        }
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
  less: (left, right) => {
    if (left[0] === 0 || right[0] === 0 || left[1] === right[1]) {
      return left[0] < right[0];
    }
    if (left[0] > 0 && right[0] > 0) {
      return left[1] < right[1];
    }
    if (left[0] < 0 && right[0] > 0) {
      return true;
    }
    if (right[0] < 0 && left[0] > 0) {
      return false;
    }
    return left[1] > right[1];
  },
  /* Left and right are readonly */
  lessOrEqual: (left, right) => {
    if (left[0] === 0 || right[0] === 0 || left[1] === right[1]) {
      return left[0] <= right[0];
    }
    if (left[0] > 0 && right[0] > 0) {
      return left[1] < right[1];
    }
    if (left[0] < 0 && right[0] > 0) {
      return true;
    }
    if (right[0] < 0 && left[0] > 0) {
      return false;
    }
    return left[1] > right[1];
  },
  /* Left and right are readonly */
  more: (left, right) => {
    if (left[0] === 0 || right[0] === 0 || left[1] === right[1]) {
      return left[0] > right[0];
    }
    if (left[0] > 0 && right[0] > 0) {
      return left[1] > right[1];
    }
    if (left[0] < 0 && right[0] > 0) {
      return false;
    }
    if (right[0] < 0 && left[0] > 0) {
      return true;
    }
    return left[1] < right[1];
  },
  /* Left and right are readonly */
  moreOrEqual: (left, right) => {
    if (left[0] === 0 || right[0] === 0 || left[1] === right[1]) {
      return left[0] >= right[0];
    }
    if (left[0] > 0 && right[0] > 0) {
      return left[1] > right[1];
    }
    if (left[0] < 0 && right[0] > 0) {
      return false;
    }
    if (right[0] < 0 && left[0] > 0) {
      return true;
    }
    return left[1] < right[1];
  },
  /* Left and right are readonly */
  notEqual: (left, right) => {
    return left[1] !== right[1] || left[0] !== right[0];
  },
  trunc: (left) => {
    if (left[1] < 0) {
      return [0, 0];
    } else if (left[1] === 0) {
      left[0] = Math.trunc(left[0]);
    } else if (left[1] <= 14) {
      left[0] = Math.trunc(left[0] * 10 ** left[1]) / 10 ** left[1];
    }
    return left;
  },
  floor: (left) => {
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
  ceil: (left) => {
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
  round: (left) => {
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
  format: (left, settings) => {
    const [base, power] = left;
    if (!isFinite(base)) {
      return `${base}`;
    }
    const defaultSettings = Overlimit.settings.format;
    const type = settings.type ?? "number";
    let padding = settings.padding ?? defaultSettings.padding;
    const powerAbs = Math.abs(power);
    const bigPowerSettings = defaultSettings.bigPower;
    if (powerAbs >= bigPowerSettings.convert) {
      let exponent = Math.floor(Math.log10(powerAbs));
      const digits2 = Math.max(bigPowerSettings.maxDigits - Math.floor(Math.log10(exponent)), bigPowerSettings.minDigits);
      let mantissa2 = Math.round(power / 10 ** (exponent - digits2)) / 10 ** digits2;
      if (Math.abs(mantissa2) === 10) {
        mantissa2 /= 10;
        exponent++;
      }
      if (padding === "exponent") {
        padding = true;
      }
      const short = type !== "input" && bigPowerSettings.short;
      if (short) {
        mantissa2 = Math.abs(mantissa2);
      }
      const formated2 = padding ? mantissa2.toFixed(digits2) : `${mantissa2}`;
      if (type === "input") {
        return `${Math.trunc(base)}e${formated2}e${exponent}`;
      }
      return `${base < 0 ? "-" : ""}${short ? "" : "e"}${formated2.replace(".", defaultSettings.point)}${short ? `e${power < 0 ? "-" : ""}` : ""}e${exponent}`;
    }
    const powerSettings = defaultSettings.power;
    if (power >= powerSettings.convert[0] || power < powerSettings.convert[1]) {
      const digits2 = Math.max(powerSettings.maxDigits - Math.floor(Math.log10(powerAbs)), powerSettings.minDigits);
      let mantissa2 = Math.round(base * 10 ** digits2) / 10 ** digits2;
      let exponent = power;
      if (Math.abs(mantissa2) === 10) {
        mantissa2 /= 10;
        exponent++;
      }
      if (padding === "exponent") {
        padding = true;
      }
      const formated2 = padding ? mantissa2.toFixed(digits2) : `${mantissa2}`;
      return type === "input" ? `${formated2}e${exponent}` : `${formated2.replace(".", defaultSettings.point)}e${exponent}`;
    }
    const baseSettings = defaultSettings.base;
    const digits = power < 1 ? baseSettings.maxDigits : Math.max(baseSettings.maxDigits - power, baseSettings.minDigits);
    const mantissa = Math.round(base * 10 ** (digits + power)) / 10 ** digits;
    if (padding === "exponent") {
      padding = false;
    }
    let formated = padding ? mantissa.toFixed(digits) : `${mantissa}`;
    if (type === "input") {
      return formated;
    }
    let ending = "";
    const index = formated.indexOf(".");
    if (index !== -1) {
      ending = `${defaultSettings.point}${formated.slice(index + 1)}`;
      formated = formated.slice(0, index);
    }
    return `${mantissa >= 1e3 ? formated.replaceAll(/\B(?=(\d{3})+(?!\d))/g, defaultSettings.separator) : formated}${ending}`;
  }
};
