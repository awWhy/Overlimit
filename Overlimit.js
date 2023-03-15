"use strict";
export const overlimit = {
  settings: {
    minDigits: 0,
    //When exponent is bigger than format.maxPower (1000 as default)
    format: {
      //Calling function with type === 'input', will ignore point and separator, also number never turned into 1ee2
      digits: [4, 2],
      //Digits past point [max, min]
      padding: true,
      //Will add missing digits past point
      //Max is used when when numbers like 0.0001 (exponent < 0)
      //For numbers with exponent of 3+ (before next convert), digits past point always 0
      //Min is used any other time
      //If sent object is missing max, then it will check min, before using default (this one's)
      power: [6, -3],
      //When convert into: example 1000000 > 1e6; [+, -]
      maxPower: 1e4,
      //When convert into: 1e2345 > 2.34ee3; [+, -] (power is never formated)
      point: ".",
      //What should be used instead of dot; example 1.21 > 1,21
      separator: ""
      //What should be used as a thousand separator; example 1200 > 1 200
    }
  },
  Limit: (number) => {
    const { technical } = overlimit;
    let result = technical.convert(number);
    return {
      plus: function(...numbers) {
        const array = technical.convertAll(numbers);
        for (let i = 0; i < array.length; i++) {
          result = technical.add(result, array[i]);
        }
        return this;
      },
      minus: function(...numbers) {
        const array = technical.convertAll(numbers);
        for (let i = 0; i < array.length; i++) {
          result = technical.sub(result, array[i]);
        }
        return this;
      },
      multiply: function(...numbers) {
        const array = technical.convertAll(numbers);
        for (let i = 0; i < array.length; i++) {
          result = technical.mult(result, array[i]);
        }
        return this;
      },
      divide: function(...numbers) {
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
        const array = technical.convertAll(compare);
        let allEqual = technical.equal(result, array[0]);
        for (let i = 1; i < array.length; i++) {
          allEqual && (allEqual = technical.equal(array[i - 1], array[i]));
        }
        return allEqual;
      },
      max: function(...compare) {
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
      toNumber: () => Number(technical.convertBack(result)),
      toString: () => technical.convertBack(result),
      toArray: () => technical.prepare(result)
    };
  },
  LimitAlt: {
    //Faster methods (?), because no need to convert in both directions
    abs: (number) => number[0] === "-" ? number.substring(1) : number,
    isNaN: (number) => number.includes("NaN"),
    isFinite: (number) => !number.includes("Infinity") && !number.includes("NaN"),
    clone: (number) => [number[0], number[1]]
  },
  /* Private functions */
  technical: {
    /* Main calculations */
    //No abs, isNaN, isFinite because they are too simple
    //No max, min instead on spot it will call comparison function (.more())
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
      if (Math.abs(difference) >= 14) {
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
      return left;
    },
    sub: (left, right) => {
      right[0] *= -1;
      return overlimit.technical.add(left, right);
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
      return left;
    },
    pow: (left, power) => {
      if (power === 0) {
        return left[0] === 0 || !isFinite(left[0]) ? [NaN, NaN] : [1, 0];
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
        const test = left[1] < 16 ? Math.abs(Math.round(left[0] * 1e14) / 10 ** (14 - left[1])) % 2 : (
          //Fix floats and find if even
          0
        );
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
      return left;
    },
    less: (left, right) => {
      left[0] = Math.round(left[0] * 1e14) / 1e14;
      right[0] = Math.round(right[0] * 1e14) / 1e14;
      if (Math.abs(left[0]) === 10) {
        left[0] = 1;
        left[1]++;
      }
      if (Math.abs(right[0]) === 10) {
        right[0] = 1;
        right[1]++;
      }
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
      left[0] = Math.round(left[0] * 1e14) / 1e14;
      right[0] = Math.round(right[0] * 1e14) / 1e14;
      if (Math.abs(left[0]) === 10) {
        left[0] = 1;
        left[1]++;
      }
      if (Math.abs(right[0]) === 10) {
        right[0] = 1;
        right[1]++;
      }
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
      left[0] = Math.round(left[0] * 1e14) / 1e14;
      right[0] = Math.round(right[0] * 1e14) / 1e14;
      if (Math.abs(left[0]) === 10) {
        left[0] = 1;
        left[1]++;
      }
      if (Math.abs(right[0]) === 10) {
        right[0] = 1;
        right[1]++;
      }
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
      left[0] = Math.round(left[0] * 1e14) / 1e14;
      right[0] = Math.round(right[0] * 1e14) / 1e14;
      if (Math.abs(left[0]) === 10) {
        left[0] = 1;
        left[1]++;
      }
      if (Math.abs(right[0]) === 10) {
        right[0] = 1;
        right[1]++;
      }
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
      left[0] = Math.round(left[0] * 1e14) / 1e14;
      right[0] = Math.round(right[0] * 1e14) / 1e14;
      if (Math.abs(left[0]) === 10) {
        left[0] = 1;
        left[1]++;
      }
      if (Math.abs(right[0]) === 10) {
        right[0] = 1;
        right[1]++;
      }
      return left[1] === right[1] ? left[0] === right[0] : false;
    },
    notEqual: (left, right) => {
      left[0] = Math.round(left[0] * 1e14) / 1e14;
      right[0] = Math.round(right[0] * 1e14) / 1e14;
      if (Math.abs(left[0]) === 10) {
        left[0] = 1;
        left[1]++;
      }
      if (Math.abs(right[0]) === 10) {
        right[0] = 1;
        right[1]++;
      }
      return left[1] !== right[1] ? true : left[0] !== right[0];
    },
    trunc: (left) => {
      left[0] = Math.round(left[0] * 1e14) / 1e14;
      if (Math.abs(left[0]) === 10) {
        left[0] = 1;
        left[1]++;
      }
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
      left[0] = Math.round(left[0] * 1e14) / 1e14;
      if (Math.abs(left[0]) === 10) {
        left[0] = 1;
        left[1]++;
      }
      if (left[1] < 0) {
        return [left[0] < 0 ? -1 : 0, 0];
      } else if (left[1] === 0) {
        left[0] = Math.floor(left[0]);
      } else if (left[1] <= 14) {
        left[0] = Math.floor(left[0] * 10 ** left[1]) / 10 ** left[1];
      }
      return left;
    },
    ceil: (left) => {
      left[0] = Math.round(left[0] * 1e14) / 1e14;
      if (Math.abs(left[0]) === 10) {
        left[0] = 1;
        left[1]++;
      }
      if (left[1] < 0) {
        return [left[0] < 0 ? 0 : 1, 0];
      } else if (left[1] === 0) {
        left[0] = Math.ceil(left[0]);
      } else if (left[1] <= 14) {
        left[0] = Math.ceil(left[0] * 10 ** left[1]) / 10 ** left[1];
      }
      return left;
    },
    round: (left) => {
      left[0] = Math.round(left[0] * 1e14) / 1e14;
      if (Math.abs(left[0]) === 10) {
        left[0] = 1;
        left[1]++;
      }
      if (left[1] < 0) {
        return [left[1] === -1 ? Math.round(left[0] / 10) : 0, 0];
      } else if (left[1] === 0) {
        left[0] = Math.round(left[0]);
      } else if (left[1] <= 14) {
        left[0] = Math.round(left[0] * 10 ** left[1]) / 10 ** left[1];
      }
      return left;
    },
    format: (left, settings) => {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      const [base, power] = left;
      if (!isFinite(base) || !isFinite(power)) {
        return overlimit.technical.convertBack(left);
      }
      const { format: setting } = overlimit.settings;
      if ((power >= setting.maxPower || power <= -setting.maxPower) && settings.type !== "input") {
        const digits2 = (_a = settings.minDigits) != null ? _a : setting.digits[1];
        let exponent = Math.floor(Math.log10(Math.abs(power)));
        let result = Math.abs(Math.round(power / 10 ** (exponent - digits2)) / 10 ** digits2);
        if (result === 10) {
          result = 1;
          exponent++;
        }
        if (base < 0) {
          result *= -1;
        }
        const formated2 = ((_b = settings.padding) != null ? _b : setting.padding) ? result.toFixed(digits2).replace(".", setting.point) : `${result}`.replace(".", setting.point);
        return `${formated2}e${power < 0 ? "-" : ""}e${exponent}`;
      }
      if (power >= setting.power[0] || power < setting.power[1]) {
        const digits2 = (_c = settings.minDigits) != null ? _c : setting.digits[1];
        let exponent = power;
        let result = Math.round(base * 10 ** digits2) / 10 ** digits2;
        if (Math.abs(result) === 10) {
          result = 1;
          exponent++;
        }
        if ((_d = settings.padding) != null ? _d : setting.padding) {
          result = result.toFixed(digits2);
        }
        return settings.type !== "input" ? `${`${result}`.replace(".", setting.point)}e${exponent}` : `${result}e${exponent}`;
      }
      const digits = power >= 3 ? 0 : power < 0 ? (_f = (_e = settings.maxDigits) != null ? _e : settings.minDigits) != null ? _f : setting.digits[0] : (_g = settings.minDigits) != null ? _g : setting.digits[1];
      let formated = Math.round(base * 10 ** (digits + power)) / 10 ** digits;
      formated = ((_h = settings.padding) != null ? _h : setting.padding) && digits > 0 ? formated.toFixed(digits) : `${formated}`;
      if (settings.type !== "input") {
        formated = power >= 3 ? formated.replace(/\B(?=(\d{3})+(?!\d))/g, setting.separator) : formated.replace(".", setting.point);
      }
      return formated;
    },
    /* Convertion functions */
    convert: (number) => {
      let result;
      if (typeof number !== "object" || number === null) {
        if (typeof number !== "string") {
          number = `${number}`;
        }
        const index = number.indexOf("e");
        result = index === -1 ? [Number(number), 0] : [Number(number.slice(0, index)), Number(number.slice(index + 1))];
      } else {
        result = [number[0], number[1]];
      }
      if (!isFinite(result[0])) {
        return isNaN(result[0]) ? [NaN, NaN] : [result[0], Infinity];
      }
      if (Math.floor(result[1]) !== result[1]) {
        result[0] *= 10 ** (result[1] - Math.floor(result[1]));
        result[1] = Math.floor(result[1]);
      }
      const after = Math.abs(result[0]);
      if (after === 0) {
        result[1] = 0;
      } else if (after < 1 || after >= 10) {
        const digits = Math.floor(Math.log10(after));
        result[0] /= 10 ** digits;
        result[1] += digits;
        if (Math.abs(result[0]) < 1) {
          result[0] *= 10;
          result[1]--;
        }
      }
      return result;
    },
    convertAll: (numbers) => {
      const result = [];
      const { convert } = overlimit.technical;
      for (let i = 0; i < numbers.length; i++) {
        result[i] = convert(numbers[i]);
      }
      return result;
    },
    prepare: (number) => {
      if (!isFinite(number[0]) || !isFinite(number[1])) {
        if (number[0] === 0 || number[1] === -Infinity) {
          return [0, 0];
        }
        if (isNaN(number[0]) || isNaN(number[1])) {
          return [NaN, NaN];
        }
        return [number[0] < 0 ? -Infinity : Infinity, Infinity];
      }
      number[0] = Math.round(number[0] * 1e14) / 1e14;
      if (Math.abs(number[0]) === 10) {
        number[0] = 1;
        number[1]++;
      }
      return number;
    },
    convertBack: (number) => {
      number = overlimit.technical.prepare(number);
      if (!isFinite(number[0])) {
        return `${number[0]}`;
      }
      if (Math.abs(number[1]) < 1e16) {
        return number[1] === 0 ? `${number[0]}` : `${number[0]}e${number[1]}`;
      }
      const exponent = Math.floor(Math.log10(number[1]));
      const result = Math.round(number[1] / 10 ** (exponent - 14)) / 1e14;
      return `${number[0]}e${result}e${exponent}`;
    }
  }
};
export const { Limit, LimitAlt } = overlimit;
export default Limit;
