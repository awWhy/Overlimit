"use strict";
const limitSettings = {
  //Export if need
  format: {
    //Calling function with type === 'input', will ignore point and separator, also number never turned into 1ee2
    digits: [0, 2, 4],
    //Digits past point (1.11) [min, power, max]; Decreases by 1 for every new digit
    //Do not use min setting more than 2, because numbers >= 1e3 will get incorectly converted
    //Power setting is for any number like 1.11e111
    padding: false,
    //Will add missing digits past point
    power: [6, -3],
    //When convert into: example 1000000 > 1e6; [+, -]
    maxPower: 1e4,
    //When convert into: 1e2345 > 2.34ee3; [+, -] (power never uses thousand separator)
    powerShort: true,
    //If maxPower is reached, should format type be 2.34ee3 (if true) or 1e2.34e3 (if false or input type)
    point: ".",
    //What should be used instead of dot; example 1.21 > 1,21
    separator: ""
    //What should be used as a thousand separator; example 1200 > 1 200
  }
};
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
  plus(...numbers) {
    if (numbers.length < 1) {
      return this;
    }
    const array = technical.convertAll(numbers);
    let result = [this[0], this[1]];
    for (let i = 0; i < array.length; i++) {
      result = technical.add(result, array[i]);
    }
    return this.#privateSet(result);
  }
  minus(...numbers) {
    if (numbers.length < 1) {
      return this;
    }
    const array = technical.convertAll(numbers);
    let result = [this[0], this[1]];
    for (let i = 0; i < array.length; i++) {
      result = technical.sub(result, array[i]);
    }
    return this.#privateSet(result);
  }
  multiply(...numbers) {
    if (numbers.length < 1) {
      return this;
    }
    const array = technical.convertAll(numbers);
    let result = [this[0], this[1]];
    for (let i = 0; i < array.length; i++) {
      result = technical.mult(result, array[i]);
    }
    return this.#privateSet(result);
  }
  divide(...numbers) {
    if (numbers.length < 1) {
      return this;
    }
    const array = technical.convertAll(numbers);
    let result = [this[0], this[1]];
    for (let i = 0; i < array.length; i++) {
      result = technical.div(result, array[i]);
    }
    return this.#privateSet(result);
  }
  power(power) {
    return this.#privateSet(technical.pow([this[0], this[1]], power));
  }
  log(base = 2.718281828459045) {
    return this.#privateSet(technical.log([this[0], this[1]], base));
  }
  abs() {
    this[0] = Math.abs(this[0]);
    return this;
  }
  trunc() {
    return this.#privateSet(technical.trunc([this[0], this[1]]));
  }
  floor() {
    return this.#privateSet(technical.floor([this[0], this[1]]));
  }
  ceil() {
    return this.#privateSet(technical.ceil([this[0], this[1]]));
  }
  round() {
    return this.#privateSet(technical.round([this[0], this[1]]));
  }
  isNaN() {
    return isNaN(this[0]) || isNaN(this[1]);
  }
  isFinite() {
    return isFinite(this[0]) && isFinite(this[1]);
  }
  //Type 'as unknown as [number, number]' is used to prevent type polution (since cloning is not required and Overlimit is just Array)
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
  equal(...compare) {
    if (compare.length < 1) {
      return true;
    }
    const array = technical.convertAll(compare);
    let allEqual = technical.equal(this, array[0]);
    for (let i = 1; i < array.length; i++) {
      if (!allEqual) {
        return false;
      }
      allEqual = technical.equal(array[i - 1], array[i]);
    }
    return allEqual;
  }
  max(...compare) {
    if (compare.length < 1) {
      return this;
    }
    const array = technical.convertAll(compare);
    let result = [this[0], this[1]];
    for (let i = 0; i < array.length; i++) {
      if (isNaN(array[i][0])) {
        return this.#privateSet([NaN, NaN]);
      }
      if (technical.less(result, array[i])) {
        result = array[i];
      }
    }
    return this.#privateSet(result);
  }
  min(...compare) {
    if (compare.length < 1) {
      return this;
    }
    const array = technical.convertAll(compare);
    let result = [this[0], this[1]];
    for (let i = 0; i < array.length; i++) {
      if (isNaN(array[i][0])) {
        return this.#privateSet([NaN, NaN]);
      }
      if (technical.more(result, array[i])) {
        result = array[i];
      }
    }
    return this.#privateSet(result);
  }
  format(settings = {}) {
    return technical.format(this, settings);
  }
  toNumber() {
    return Number(technical.turnString(this));
  }
  toString() {
    return technical.turnString(this);
  }
  toArray() {
    return technical.prepare([this[0], this[1]]);
  }
}
export const Limit = (number) => {
  let result = technical.convert(number);
  return {
    get mantissa() {
      return result[0];
    },
    get exponent() {
      return result[1];
    },
    plus: function(...numbers) {
      if (numbers.length < 1) {
        return this;
      }
      const array = technical.convertAll(numbers);
      for (let i = 0; i < array.length; i++) {
        result = technical.add(result, array[i]);
      }
      return this;
    },
    minus: function(...numbers) {
      if (numbers.length < 1) {
        return this;
      }
      const array = technical.convertAll(numbers);
      for (let i = 0; i < array.length; i++) {
        result = technical.sub(result, array[i]);
      }
      return this;
    },
    multiply: function(...numbers) {
      if (numbers.length < 1) {
        return this;
      }
      const array = technical.convertAll(numbers);
      for (let i = 0; i < array.length; i++) {
        result = technical.mult(result, array[i]);
      }
      return this;
    },
    divide: function(...numbers) {
      if (numbers.length < 1) {
        return this;
      }
      const array = technical.convertAll(numbers);
      for (let i = 0; i < array.length; i++) {
        result = technical.div(result, array[i]);
      }
      return this;
    },
    power: function(power) {
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
    isNaN: () => isNaN(result[0]) || isNaN(result[1]),
    isFinite: () => isFinite(result[0]) && isFinite(result[1]),
    lessThan: (compare) => technical.less(result, technical.convert(compare)),
    lessOrEqual: (compare) => technical.lessOrEqual(result, technical.convert(compare)),
    moreThan: (compare) => technical.more(result, technical.convert(compare)),
    moreOrEqual: (compare) => technical.moreOrEqual(result, technical.convert(compare)),
    notEqual: (compare) => technical.notEqual(result, technical.convert(compare)),
    equal: (...compare) => {
      if (compare.length < 1) {
        return true;
      }
      const array = technical.convertAll(compare);
      let allEqual = technical.equal(result, array[0]);
      for (let i = 1; i < array.length; i++) {
        if (!allEqual) {
          return false;
        }
        allEqual = technical.equal(array[i - 1], array[i]);
      }
      return allEqual;
    },
    max: function(...compare) {
      if (compare.length < 1) {
        return this;
      }
      const array = technical.convertAll(compare);
      for (let i = 0; i < array.length; i++) {
        if (isNaN(array[i][0])) {
          result = [NaN, NaN];
          break;
        }
        if (technical.less(result, array[i])) {
          result = array[i];
        }
      }
      return this;
    },
    min: function(...compare) {
      if (compare.length < 1) {
        return this;
      }
      const array = technical.convertAll(compare);
      for (let i = 0; i < array.length; i++) {
        if (isNaN(array[i][0])) {
          result = [NaN, NaN];
          break;
        }
        if (technical.more(result, array[i])) {
          result = array[i];
        }
      }
      return this;
    },
    format: (settings = {}) => technical.format(result, settings),
    toNumber: () => Number(technical.turnString(result)),
    toString: () => technical.turnString(result),
    toArray: () => technical.prepare(result),
    toLimit: () => new Overlimit(technical.prepare(result))
  };
};
export const LimitAlt = {
  //Deprecated
  sort: (toSort, descend = false) => {
    if (toSort.length < 2) {
      return;
    }
    const numbers = technical.convertAll(toSort);
    const compare = technical[descend ? "moreOrEqual" : "lessOrEqual"];
    let main = [[0]];
    initial:
      for (let i = 1; i < numbers.length; i++) {
        const target = main[main.length - 1];
        if (compare(numbers[i - 1], numbers[i])) {
          do {
            target.push(i);
            i++;
            if (i >= numbers.length) {
              break initial;
            }
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
    const merge = (array) => {
      if (array.length === 1) {
        return array[0];
      }
      let main2 = [];
      let i;
      for (i = 0; i < array.length - 1; i += 2) {
        main2.push([]);
        const target = main2[main2.length - 1];
        const first = array[i];
        const second = array[i + 1];
        let f = 0;
        let s = 0;
        while (f < first.length || s < second.length) {
          if (s >= second.length || f < first.length && compare(numbers[first[f]], numbers[second[s]])) {
            target.push(first[f]);
            f++;
          } else {
            target.push(second[s]);
            s++;
          }
        }
      }
      if (i === array.length - 1) {
        main2.push(array[i]);
      }
      main2 = merge(main2);
      return main2;
    };
    main = merge(main);
    const clone = toSort.slice(0);
    toSort.length = 0;
    for (let i = 0; i < clone.length; i++) {
      toSort.push(clone[main[i]]);
    }
  }
};
const technical = {
  convert: (number) => {
    let result;
    if (typeof number !== "object" || number === null) {
      if (typeof number !== "string") {
        number = `${number}`;
      }
      const index = number.indexOf("e");
      result = index === -1 ? [Number(number), 0] : [Number(number.slice(0, index)), Number(number.slice(index + 1))];
    } else {
      return [number[0], number[1]];
    }
    if (!isFinite(result[0])) {
      return isNaN(result[0]) ? [NaN, NaN] : [result[0], Infinity];
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
  convertAll: (numbers) => {
    const result = [];
    for (let i = 0; i < numbers.length; i++) {
      result[i] = technical.convert(numbers[i]);
    }
    return result;
  },
  prepare: (number) => {
    if (isFinite(number[0]) && isFinite(number[1])) {
      return number;
    }
    if (number[0] === 0 || number[1] === -Infinity) {
      return [0, 0];
    }
    if (isNaN(number[0]) || isNaN(number[1])) {
      return [NaN, NaN];
    }
    return [number[0] < 0 ? -Infinity : Infinity, Infinity];
  },
  turnString: (number) => {
    number = technical.prepare(number);
    if (!isFinite(number[0])) {
      return `${number[0]}`;
    }
    return number[1] === 0 ? `${number[0]}` : `${number[0]}e${number[1]}`;
  },
  /* Main calculations */
  //No abs, isNaN, isFinite because they are too simple
  //No max, min because it calls comparison function (.more()) instead
  add: (left, right) => {
    if (right[0] === 0) {
      return left;
    }
    if (left[0] === 0) {
      return right;
    }
    if (!isFinite(left[0]) || !isFinite(right[0])) {
      const check = left[0] + right[0];
      return isNaN(left[0]) || isNaN(right[0]) || isNaN(check) ? [NaN, NaN] : [check, Infinity];
    }
    const difference = left[1] - right[1];
    if (Math.abs(difference) > 15) {
      return difference > 0 ? left : right;
    }
    if (difference === 0) {
      left[0] += right[0];
    } else if (difference > 0) {
      left[0] += right[0] / 10 ** difference;
    } else {
      right[0] += left[0] / 10 ** -difference;
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
      left[0] /= 10;
      left[1]++;
    }
    return left;
  },
  sub: (left, right) => {
    right[0] *= -1;
    return technical.add(left, right);
  },
  mult: (left, right) => {
    if (left[0] === 0 || right[0] === 0) {
      return [0, 0];
    }
    left[1] += right[1];
    left[0] *= right[0];
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
  div: (left, right) => {
    if (right[0] === 0) {
      return [NaN, NaN];
    }
    if (left[0] === 0) {
      return [0, 0];
    }
    left[1] -= right[1];
    left[0] /= right[0];
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
      if (left[1] === 0 && (left[0] === 1 || left[0] === -1 && !isNaN(power))) {
        return [1, 0];
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
      if (isNaN(left[0])) {
        return [NaN, NaN];
      }
      if (base10 === -Infinity) {
        return [0, 0];
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
  equal: (left, right) => {
    return left[1] === right[1] && left[0] === right[0];
  },
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
  format: (left, settings) => {
    const [base, power] = left;
    if (!isFinite(base) || !isFinite(power)) {
      return technical.turnString(left);
    }
    const { format: setting } = limitSettings;
    if (power >= setting.maxPower || power <= -setting.maxPower) {
      const digits2 = settings.digits ?? setting.digits[1];
      let exponent = power;
      let mantissa2 = Math.round(base * 10 ** digits2) / 10 ** digits2;
      if (Math.abs(mantissa2) === 10) {
        mantissa2 /= 10;
        exponent++;
      }
      exponent = Math.floor(Math.log10(Math.abs(exponent)));
      let powerMantissa = Math.round(power / 10 ** (exponent - digits2)) / 10 ** digits2;
      if (Math.abs(powerMantissa) === 10) {
        powerMantissa /= 10;
        exponent++;
      }
      const formatedPower = settings.padding ?? setting.padding ? powerMantissa.toFixed(digits2) : `${powerMantissa}`;
      if (settings.type !== "input" && setting.powerShort) {
        powerMantissa = Math.abs(powerMantissa);
        if (base < 0) {
          powerMantissa *= -1;
        }
        return `${formatedPower.replace(".", setting.point)}e${power < 0 ? "-" : ""}e${exponent}`;
      }
      const formatedBase = settings.padding ?? setting.padding ? mantissa2.toFixed(digits2) : `${mantissa2}`;
      return settings.type === "input" ? `${formatedBase}e${formatedPower}e${exponent}` : `${formatedBase.replace(".", setting.point)}e${formatedPower.replace(".", setting.point)}e${exponent}`;
    }
    if (power >= setting.power[0] || power < setting.power[1]) {
      const digits2 = settings.digits ?? setting.digits[1];
      let exponent = power;
      let mantissa2 = Math.round(base * 10 ** digits2) / 10 ** digits2;
      if (Math.abs(mantissa2) === 10) {
        mantissa2 /= 10;
        exponent++;
      }
      const formated2 = settings.padding ?? setting.padding ? mantissa2.toFixed(digits2) : `${mantissa2}`;
      return settings.type === "input" ? `${formated2}e${exponent}` : `${formated2.replace(".", setting.point)}e${exponent}`;
    }
    const digits = settings.digits ?? Math.max(setting.digits[2] - Math.max(power, 0), setting.digits[0]);
    const mantissa = Math.round(base * 10 ** (digits + power)) / 10 ** digits;
    const formated = settings.padding ?? setting.padding ? mantissa.toFixed(digits) : `${mantissa}`;
    return settings.type === "input" ? formated : mantissa >= 1e3 ? formated.replace(".", setting.point).replaceAll(/\B(?=(\d{3})+(?!\d))/g, setting.separator) : formated.replace(".", setting.point);
  }
};
