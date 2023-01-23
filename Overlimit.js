"use strict";
(() => {
  // Overlimit.ts
  var overlimit = {
    settings: {
      maxDigits: 12,
      //How many digits should be preserved when turning number into a string
      minDigits: 0,
      //When exponent is bigger than 1000 (format.maxPower)
      format: {
        //Calling function with type === 'input', will ignore point and separator, also number never turned into 1ee2
        digits: [4, 2],
        //Digits past point [max, min]
        //padding: true, //Will add missing digits at numbers bigger than 1e6 (1.00e6)
        power: [6, -3],
        //When convert into: example 1000000 > 1e6; [+, -]
        maxPower: [1e3, -1e3],
        //When convert into: 1e2345 > 2ee3; [+, -] (power is never formated)
        point: ".",
        //What should be used instead of dot; example 1.21 > 1,21
        separator: ""
        //What should be as a thousand separator; example 1200 > 1 200
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
        less: (compare) => technical.less(result, technical.convert(compare)),
        lessOrEqual: (compare) => technical.lessOrEqual(result, technical.convert(compare)),
        more: (compare) => technical.more(result, technical.convert(compare)),
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
            if (technical.less(result, array[i])) {
              result = array[i];
            }
          }
          return this;
        },
        min: function(...compare) {
          const array = technical.convertAll(compare);
          for (let i = 0; i < array.length; i++) {
            if (technical.more(result, array[i])) {
              result = array[i];
            }
          }
          return this;
        },
        format: (digits = null, type = "number") => technical.format(result, digits, type),
        get: () => technical.convertBack(result),
        noConvert: () => technical.fixFloats(result)
      };
    },
    LimitAlt: {
      plus: (...numbers) => {
        const { technical } = overlimit;
        const array = technical.convertAll(numbers);
        let result = technical.add(array[0], array[1]);
        for (let i = 2; i < array.length; i++) {
          result = technical.add(result, array[i]);
        }
        return technical.convertBack(result);
      },
      minus: (...numbers) => {
        const { technical } = overlimit;
        const array = technical.convertAll(numbers);
        let result = technical.sub(array[0], array[1]);
        for (let i = 2; i < array.length; i++) {
          result = technical.sub(result, array[i]);
        }
        return technical.convertBack(result);
      },
      multiply: (...numbers) => {
        const { technical } = overlimit;
        const array = technical.convertAll(numbers);
        let result = technical.mult(array[0], array[1]);
        for (let i = 2; i < array.length; i++) {
          result = technical.mult(result, array[i]);
        }
        return technical.convertBack(result);
      },
      divide: (...numbers) => {
        const { technical } = overlimit;
        const array = technical.convertAll(numbers);
        let result = technical.div(array[0], array[1]);
        for (let i = 2; i < array.length; i++) {
          result = technical.div(result, array[i]);
        }
        return technical.convertBack(result);
      },
      power: (number, power) => {
        const { technical } = overlimit;
        return technical.convertBack(technical.pow(technical.convert(number), power));
      },
      log: (number, base = 2.718281828459045) => {
        const { technical } = overlimit;
        return technical.convertBack(technical.log(technical.convert(number), base));
      },
      //Fastest method (?), because no need to convert in both directions
      abs: (number) => number[0] === "-" ? number.substring(1) : number,
      isNaN: (number) => number.includes("NaN"),
      isFinite: (number) => number.includes("Infinity"),
      less: (first, second) => {
        const { technical } = overlimit;
        return technical.less(technical.convert(first), technical.convert(second));
      },
      lessOrEqual: (first, second) => {
        const { technical } = overlimit;
        return technical.lessOrEqual(technical.convert(first), technical.convert(second));
      },
      more: (first, second) => {
        const { technical } = overlimit;
        return technical.more(technical.convert(first), technical.convert(second));
      },
      moreOrEqual: (first, second) => {
        const { technical } = overlimit;
        return technical.moreOrEqual(technical.convert(first), technical.convert(second));
      },
      notEqual: (first, second) => {
        const { technical } = overlimit;
        return technical.notEqual(technical.convert(first), technical.convert(second));
      },
      equal: (...numbers) => {
        const { technical } = overlimit;
        const array = technical.convertAll(numbers);
        let result = technical.equal(array[0], array[1]);
        for (let i = 2; i < array.length; i++) {
          result && (result = technical.equal(array[i - 1], array[i]));
        }
        return result;
      },
      max: (...numbers) => {
        const { technical } = overlimit;
        const array = technical.convertAll(numbers);
        let result = technical.more(array[0], array[1]) ? array[0] : array[1];
        for (let i = 2; i < array.length; i++) {
          if (technical.less(result, array[i])) {
            result = array[i];
          }
        }
        return technical.convertBack(result);
      },
      min: (...numbers) => {
        const { technical } = overlimit;
        const array = technical.convertAll(numbers);
        let result = technical.less(array[0], array[1]) ? array[0] : array[1];
        for (let i = 2; i < array.length; i++) {
          if (technical.more(result, array[i])) {
            result = array[i];
          }
        }
        return technical.convertBack(result);
      },
      trunc: (number) => {
        const { technical } = overlimit;
        return technical.convertBack(technical.trunc(technical.convert(number)));
      },
      floor: (number) => {
        const { technical } = overlimit;
        return technical.convertBack(technical.floor(technical.convert(number)));
      },
      ceil: (number) => {
        const { technical } = overlimit;
        return technical.convertBack(technical.ceil(technical.convert(number)));
      },
      round: (number) => {
        const { technical } = overlimit;
        return technical.convertBack(technical.round(technical.convert(number)));
      },
      format: (number, digits = null, type = "number") => {
        const { technical } = overlimit;
        return technical.format(technical.convert(number), digits, type);
      }
    },
    /* Private functions */
    technical: {
      //Main calculations
      add: (left, right) => {
        const difference = left[1] - right[1];
        if (Math.abs(difference) >= overlimit.settings.maxDigits) {
          return difference > 0 ? left : right;
        } else {
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
            left[0] *= 10;
            left[1]--;
          }
          return left;
        }
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
          return [NaN, 0];
        } else if (left[0] === 0) {
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
          return [1, 0];
        } else if (left[0] === 0) {
          return [0, 0];
        } else {
          const negative = left[0] < 0 ? Math.abs(power) % 2 : null;
          if (negative !== null) {
            if (Math.floor(power) !== power) {
              return [NaN, 0];
            }
            left[0] *= -1;
          }
          if (!isFinite(power)) {
            if (power < 0) {
              return [0, 0];
            }
            if (isNaN(power)) {
              return [NaN, 0];
            }
            return [negative === 1 ? -Infinity : Infinity, 0];
          }
          const base10 = power * (Math.log10(left[0]) + left[1]);
          const target = Math.floor(base10);
          left[0] = 10 ** (base10 - target);
          left[1] = target;
          if (negative === 1) {
            left[0] *= -1;
          }
          return left;
        }
      },
      log: (left, base) => {
        const negative = left[0] < 0;
        if (!isFinite(base)) {
          return [isNaN(base) ? NaN : 0, 0];
        } else if (base === 0 || base === 1) {
          return [NaN, 0];
        } else if (left[0] <= 0) {
          if (left[0] === 0) {
            return [-Infinity, 0];
          }
          if (base > 0) {
            return [NaN, 0];
          }
          left[0] *= -1;
        } else if (left[0] === 1 && left[1] === 0) {
          return [0, 0];
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
            return [NaN, 0];
          }
          const test = left[1] < 16 ? Math.round(left[0] * 10 ** 14) / 10 ** (14 - left[1]) % 2 : (
            //First remove error from floats (while keeping floats) then find if even
            0
          );
          if (base < 0 && !negative) {
            if (test !== 0) {
              return [NaN, 0];
            }
          } else {
            if (test !== 1) {
              return [NaN, 0];
            }
          }
        }
        return left;
      },
      //abs, isNaN, isFinite are not there because used version is way too different
      less: (left, right) => {
        if (left[1] === right[1] || !isFinite(left[0]) || !isFinite(right[0])) {
          return left[0] < right[0];
        }
        if (left[0] >= 0 && right[0] >= 0) {
          return left[1] < right[1];
        }
        if (left[0] < 0 && right[0] >= 0) {
          return true;
        }
        if (right[0] < 0 && left[0] >= 0) {
          return false;
        }
        return left[1] > right[1];
      },
      lessOrEqual: (left, right) => {
        if (left[1] === right[1] || !isFinite(left[0]) || !isFinite(right[0])) {
          return left[0] <= right[0];
        }
        if (left[0] >= 0 && right[0] >= 0) {
          return left[1] < right[1];
        }
        if (left[0] < 0 && right[0] >= 0) {
          return true;
        }
        if (right[0] < 0 && left[0] >= 0) {
          return false;
        }
        return left[1] > right[1];
      },
      more: (left, right) => {
        if (left[1] === right[1] || !isFinite(left[0]) || !isFinite(right[0])) {
          return left[0] > right[0];
        }
        if (left[0] >= 0 && right[0] >= 0) {
          return left[1] > right[1];
        }
        if (left[0] < 0 && right[0] >= 0) {
          return false;
        }
        if (right[0] < 0 && left[0] >= 0) {
          return true;
        }
        return left[1] < right[1];
      },
      moreOrEqual: (left, right) => {
        if (left[1] === right[1] || !isFinite(left[0]) || !isFinite(right[0])) {
          return left[0] >= right[0];
        }
        if (left[0] >= 0 && right[0] >= 0) {
          return left[1] > right[1];
        }
        if (left[0] < 0 && right[0] >= 0) {
          return false;
        }
        if (right[0] < 0 && left[0] >= 0) {
          return true;
        }
        return left[1] > right[1];
      },
      equal: (left, right) => {
        if (!isFinite(left[0]) || !isFinite(right[0])) {
          return left[0] === right[0];
        }
        return left[1] === right[1] ? left[0] === right[0] : false;
      },
      notEqual: (left, right) => {
        if (!isFinite(left[0]) || !isFinite(right[0])) {
          return left[0] !== right[0];
        }
        return left[1] !== right[1] ? true : left[0] !== right[0];
      },
      //No max, min instead on spot it will call comparison function (.more())
      trunc: (left) => {
        if (left[1] < 0) {
          return [0, 0];
        } else if (left[1] === 0) {
          left[0] = Math.trunc(left[0]);
        } else if (left[1] <= 14) {
          left[0] = Math.trunc(Math.round(left[0] * 10 ** 14) / 10 ** (14 - left[1])) / 10 ** left[1];
        }
        return left;
      },
      floor: (left) => {
        if (left[1] < 0) {
          return [left[0] < 0 ? -1 : 0, 0];
        } else if (left[1] === 0) {
          left[0] = Math.floor(left[0]);
        } else if (left[1] <= 14) {
          left[0] = Math.floor(Math.round(left[0] * 10 ** 14) / 10 ** (14 - left[1])) / 10 ** left[1];
        }
        return left;
      },
      ceil: (left) => {
        if (left[1] < 0) {
          return [left[0] < 0 ? 0 : 1, 0];
        } else if (left[1] === 0) {
          left[0] = Math.ceil(left[0]);
        } else if (left[1] <= 14) {
          left[0] = Math.ceil(Math.round(left[0] * 10 ** 14) / 10 ** (14 - left[1])) / 10 ** left[1];
        }
        return left;
      },
      round: (left) => {
        if (left[1] < 0) {
          return [left[1] === -1 ? Math.round(left[0] / 10) : 0, 0];
        } else if (left[1] === 0) {
          left[0] = Math.round(left[0]);
        } else if (left[1] <= 14) {
          left[0] = Math.round(Math.round(left[0] * 10 ** 14) / 10 ** (14 - left[1])) / 10 ** left[1];
        }
        return left;
      },
      format: (left, digits, type) => {
        const [base, power] = left;
        if (!isFinite(base) || !isFinite(power)) {
          return overlimit.technical.convertBack(left);
        }
        const { format: settings } = overlimit.settings;
        if ((power >= settings.maxPower[0] || power < settings.maxPower[1]) && type !== "input") {
          if (digits === null) {
            digits = settings.digits[1];
          }
          let exponent = Math.floor(Math.log10(Math.abs(power)));
          let result = Math.abs(Math.round(power / 10 ** (exponent - digits)) / 10 ** digits);
          if (result >= 10) {
            result /= 10;
            exponent++;
          }
          if (base < 0) {
            result *= -1;
          }
          const formated2 = `${result}`.replace(".", settings.point);
          return `${formated2}e${power < 0 ? "-" : ""}e${exponent}`;
        }
        if (power >= settings.power[0] || power < settings.power[1]) {
          if (digits === null) {
            digits = settings.digits[1];
          }
          let formated2 = `${Math.round(base * 10 ** digits) / 10 ** digits}`;
          if (type !== "input") {
            formated2 = formated2.replace(".", settings.point);
          }
          return `${formated2}e${power}`;
        }
        if (digits === null) {
          digits = settings.digits[0];
        }
        if (power >= 3 && digits > 2) {
          digits = 2;
        }
        let formated = `${Math.round(base * 10 ** (digits + power)) / 10 ** digits}`;
        if (type !== "input") {
          formated = formated.replace(".", settings.point);
          if (power >= 3) {
            formated = formated.replace(/\B(?=(\d{3})+(?!\d))/g, settings.separator);
          }
        }
        return formated;
      },
      //Special functions
      convert: (number) => {
        let result;
        if (typeof number !== "object") {
          if (typeof number !== "string") {
            number = `${number}`;
          }
          const index = number.indexOf("e");
          result = index === -1 ? [Number(number), 0] : [Number(number.slice(0, index)), Number(number.slice(index + 1))];
        } else {
          result = number;
        }
        if (Math.floor(result[1]) !== result[1]) {
          result[0] *= 10 ** (result[1] - Math.floor(result[1]));
          result[1] = Math.floor(result[1]);
        }
        const after = Math.abs(result[0]);
        if (after === 0) {
          result[1] = 0;
        } else if (after < 1 || after >= 10 && isFinite(after)) {
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
      fixFloats: (number) => {
        if (!isFinite(number[0]) || !isFinite(number[1])) {
          if (number[0] === 0 || number[1] < 0 && !isFinite(number[1])) {
            return [0, 0];
          }
          return [isNaN(number[0]) || isNaN(number[1]) ? NaN : number[0] < 0 ? -Infinity : Infinity, 0];
        }
        const { settings } = overlimit;
        const digits = number[1] >= 0 ? number[1] >= settings.format.maxPower[0] ? settings.minDigits : settings.maxDigits : number[1] <= settings.format.maxPower[1] ? settings.minDigits : settings.maxDigits;
        number[0] = Math.round(number[0] * 10 ** digits) / 10 ** digits;
        return number;
      },
      convertBack: (number) => {
        number = overlimit.technical.fixFloats(number);
        if (Math.abs(number[1]) < 1e16) {
          return number[1] === 0 ? `${number[0]}` : `${number[0]}e${number[1]}`;
        }
        const exponent = Math.floor(Math.log10(number[1]));
        const result = Math.round(number[1] / 10 ** (exponent - 15)) / 1e15;
        return `${number[0]}e${result}e${exponent}`;
      }
    }
  };
  var { Limit, LimitAlt } = overlimit;
  var Overlimit_default = Limit;
})();
