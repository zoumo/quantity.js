"use strict";
// Copyright 2016 Jim Zhang (jim.zoumo@gmail.com)
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// var BigNumber = require('bignumber.js')
var bignumber_js_1 = __importDefault(require("bignumber.js"));
// Formats
var DecimalExponent = "DecimalExponent";
exports.DecimalExponent = DecimalExponent;
var BinarySI = "BinarySI";
exports.BinarySI = BinarySI;
var DecimalSI = "DecimalSI";
exports.DecimalSI = DecimalSI;
var splitREString = "^([+-]?[0-9.]+)([eEinumkKMGTP]*[-+]?[0-9]*)$";
// errors
var ErrFormatWrong = "quantities must match the regular expression '" + splitREString + "'";
var ErrSuffix = "unable to parse quantity's suffix";
// // max int 9007199254740991
// var maxIntFactors = 15
// -----------------------------------------------------------------------
var Nano = -9;
var Micro = -6;
var Milli = -3;
var Kilo = 3;
var Mega = 6;
var Giga = 9;
var Tera = 12;
var Peta = 15;
var Exa = 18;
/**
 * bePair contains a base and exponent pair
 */
var bePair = /** @class */ (function () {
    function bePair(base, exponent) {
        this.base = undefined;
        this.exponent = undefined;
        this.base = base;
        this.exponent = exponent;
    }
    return bePair;
}());
/**
 * listSuffixer contains two mapping relationship
 * @class listSuffixer
 */
var listSuffixer = /** @class */ (function () {
    /**
     * @constructor listSuffixer
     */
    function listSuffixer() {
        this.suffixToBE = {};
        this.beToSuffix = {};
        /**
         * @property {Object} suffixToBE is the suffix to bePair mapping
         * @property {Object} beToSuffix is the bePair to suffix mapping
         */
        this.suffixToBE = {};
        this.beToSuffix = {};
    }
    /**
     * register a suffix and bePair mapping relationship
     *
     * @param {string} suffix
     * @param {bePair} bePair
     */
    listSuffixer.prototype.addSuffix = function (suffix, bePair) {
        this.suffixToBE[suffix] = bePair;
        this.beToSuffix[JSON.stringify(bePair)] = suffix;
    };
    /**
     * Find the bePair related to the given suffix,
     * if not, if boolean in returns will be false
     *
     * @param {string} suffix
     * @returns {[number, number, boolean]} if suffix is not registered, the return boolean will be false
     */
    listSuffixer.prototype.lookup = function (suffix) {
        if (!this.suffixToBE.hasOwnProperty(suffix)) {
            return [0, 0, false];
        }
        var pair = this.suffixToBE[suffix];
        return [pair.base, pair.exponent, true];
    };
    /**
     * construct a suffix related to the given bePair,
     * if not, the boolean in returns will be false
     *
     * @param {number} base
     * @param {number} exponent
     * @returns {[string, boolean]}
     */
    listSuffixer.prototype.construct = function (base, exponent) {
        var key = JSON.stringify(new bePair(base, exponent));
        if (!this.beToSuffix.hasOwnProperty(key)) {
            return ["", false];
        }
        var suffix = this.beToSuffix[key];
        return [suffix, true];
    };
    return listSuffixer;
}());
/**
 * suffixHandler help you to handle suffix and format
 * @class suffixHandler
 */
var suffixHandler = /** @class */ (function () {
    /**
     * @constructor suffixHandler
     */
    function suffixHandler() {
        this.decSuffixes = new listSuffixer();
        this.binSuffixes = new listSuffixer();
        /**
         * @property {listSuffixer} decSuffixes DecimalSI suffix mapping
         * @property {listSuffixer} binSuffixes BinarySI suffix mapping
         */
        this.decSuffixes = new listSuffixer();
        this.binSuffixes = new listSuffixer();
    }
    /**
     * interpret a suffix to base, exponent, format
     *
     * @param {string} suffix
     * @returns {[number, number, string, boolean]}
     */
    suffixHandler.prototype.interpret = function (suffix) {
        var _a;
        var _b = this.decSuffixes.lookup(suffix), b = _b[0], e = _b[1], ok = _b[2];
        if (ok) {
            return [b, e, DecimalSI, true];
        }
        _a = this.binSuffixes.lookup(suffix), b = _a[0], e = _a[1], ok = _a[2];
        if (ok) {
            return [b, e, BinarySI, true];
        }
        if (suffix.length > 1 && (suffix.charAt(0) == "e" || suffix.charAt(0) == "E")) {
            var parsed = parseInt(suffix.slice(1));
            return [10, parsed, DecimalExponent, true];
        }
        return [0, 0, DecimalExponent, false];
    };
    /**
     * construct a suffix by given base, exponent and format
     *
     * @param {number} base
     * @param {number} exponent
     * @param {string} format
     * @returns {[string, boolean]}
     */
    suffixHandler.prototype.construct = function (base, exponent, format) {
        switch (format) {
            case DecimalSI:
                return this.decSuffixes.construct(base, exponent);
            case BinarySI:
                return this.binSuffixes.construct(base, exponent);
            case DecimalExponent:
                if (base != 10) {
                    return ["", false];
                }
                if (exponent === 0) {
                    return ["", true];
                }
                return ["e" + exponent, true];
        }
        return ["", false];
    };
    return suffixHandler;
}());
var fastLookup = /** @class */ (function (_super) {
    __extends(fastLookup, _super);
    function fastLookup() {
        var _this = _super.call(this) || this;
        _this.binSuffixes.addSuffix("Ki", new bePair(2, 10));
        _this.binSuffixes.addSuffix("Mi", new bePair(2, 20));
        _this.binSuffixes.addSuffix("Gi", new bePair(2, 30));
        _this.binSuffixes.addSuffix("Ti", new bePair(2, 40));
        _this.binSuffixes.addSuffix("Pi", new bePair(2, 50));
        _this.binSuffixes.addSuffix("Ei", new bePair(2, 60));
        // Don't emit an error when trying to produce
        // a suffix for 2^0.
        _this.decSuffixes.addSuffix("", new bePair(2, 0));
        _this.decSuffixes.addSuffix("n", new bePair(10, Nano));
        _this.decSuffixes.addSuffix("u", new bePair(10, Micro));
        _this.decSuffixes.addSuffix("m", new bePair(10, Milli));
        _this.decSuffixes.addSuffix("", new bePair(10, 0));
        _this.decSuffixes.addSuffix("k", new bePair(10, Kilo));
        _this.decSuffixes.addSuffix("M", new bePair(10, Mega));
        _this.decSuffixes.addSuffix("G", new bePair(10, Giga));
        _this.decSuffixes.addSuffix("T", new bePair(10, Tera));
        _this.decSuffixes.addSuffix("P", new bePair(10, Peta));
        _this.decSuffixes.addSuffix("E", new bePair(10, Exa));
        return _this;
    }
    /**
     * interpret a suffix to base, exponent, format
     *
     * @param {string} suffix
     * @returns {[number, number, string, boolean]}
     */
    fastLookup.prototype.interpret = function (suffix) {
        switch (suffix) {
            case "":
                return [10, 0, DecimalSI, true];
            case "n":
                return [10, Nano, DecimalSI, true];
            case "u":
                return [10, Micro, DecimalSI, true];
            case "m":
                return [10, Milli, DecimalSI, true];
            case "k":
                return [10, Kilo, DecimalSI, true];
            case "M":
                return [10, Mega, DecimalSI, true];
            case "G":
                return [10, Giga, DecimalSI, true];
        }
        return _super.prototype.interpret.call(this, suffix);
    };
    return fastLookup;
}(suffixHandler));
/**
 * quantitySuffixer handles suffixes for all three formats that quantity can handle.
 */
var quantitySuffixer = new fastLookup();
exports.quantitySuffixer = quantitySuffixer;
// -----------------------------------------------------------
/**
 * Quantity extends BigNumber, rewrite the string function
 * @class Quantity
 */
var Quantity = /** @class */ (function (_super) {
    __extends(Quantity, _super);
    /**
     *
     * @param {string} format must be DecimalExponent | DecimalSI | BinarySI
     * @param {number|string|BigNumber|Quantity} numberlike
     * @param {number} base
     */
    function Quantity(format, numberlike, base) {
        var _this = _super.call(this, numberlike, base) || this;
        _this.format = {};
        _this.digit = null;
        _this.suffix = null;
        _this.s = null;
        _this.format = format;
        _this.digit = null;
        _this.suffix = null;
        return _this;
    }
    Quantity.prototype.sign = function () {
        return this.s;
    };
    Quantity.prototype.neg = function () {
        return new Quantity(this.format, _super.prototype.neg.call(this), null);
    };
    Quantity.prototype.minus = function (n, base) {
        return new Quantity(this.format, _super.prototype.minus.call(this, n, base), null);
    };
    Quantity.prototype.sub = function (n, base) {
        return new Quantity(this.format, _super.prototype.sub.call(this, n, base), null);
    };
    Quantity.prototype.add = function (n, base) {
        return new Quantity(this.format, _super.prototype.add.call(this, n, base), null);
    };
    Quantity.prototype.plus = function (n, base) {
        return new Quantity(this.format, _super.prototype.plus.call(this, n, base), null);
    };
    Quantity.prototype.div = function (n, base) {
        return new Quantity(this.format, _super.prototype.div.call(this, n, base), null);
    };
    Quantity.prototype.mul = function (n, base) {
        return new Quantity(this.format, _super.prototype.mul.call(this, n, base), null);
    };
    Quantity.prototype.times = function (n, base) {
        return new Quantity(this.format, _super.prototype.times.call(this, n, base), null);
    };
    Quantity.prototype.mod = function (n, base) {
        return new Quantity(this.format, _super.prototype.mod.call(this, n, base), null);
    };
    Quantity.prototype.modulo = function (n, base) {
        return new Quantity(this.format, _super.prototype.modulo.call(this, n, base), null);
    };
    Quantity.prototype.round = function (dp, rm) {
        return new Quantity(this.format, _super.prototype.round.call(this, dp, rm), null);
    };
    Quantity.prototype.ceil = function () {
        return new Quantity(this.format, _super.prototype.ceil.call(this), null);
    };
    Quantity.prototype.floor = function () {
        return new Quantity(this.format, _super.prototype.floor.call(this), null);
    };
    Quantity.prototype.toPrecision = function (sd, rm) {
        return new Quantity(this.format, _super.prototype.toPrecision.call(this, sd, rm), null);
    };
    /**
     * Returns a string representing the value of this BigNumber in the base `10`
     */
    Quantity.prototype.toString = function () {
        var _a, _b;
        if (this.digit != null && this.suffix != null) {
            return this.digit.toString() + this.suffix;
        }
        var result;
        var times;
        var base;
        var exponent;
        var scale = 0;
        // roundup
        // 0.5n roundup to 1n
        var scaled = this.round(-Nano, 0);
        switch (this.format) {
            case BinarySI:
                _a = removeFactors(scaled, 1024), result = _a[0], times = _a[1]; // 2 ^ 10
                base = 2;
                exponent = 10 * times;
                break;
            case DecimalSI:
            case DecimalExponent:
                // as scale
                // 1.23: precision=3, e=0 scale to 1230: precision=3, e=3, scale=-3
                // 0.5: precision=1, e=-1 scale to 500: precision=1, e=2, scale=-3
                var precision = scaled.precision();
                var e = scaled.e;
                // e - precision < -1 means that need to rescale it
                // so will can get accurate suffix  
                if (e - precision < -1) {
                    while (e - precision - scale < -1) {
                        scale -= 3;
                    }
                    scaled = scaled.mul(new bignumber_js_1.default(10).pow(-scale));
                }
                _b = removeFactors(scaled, 1000), result = _b[0], times = _b[1]; // 10 ^ 3
                base = 10;
                exponent = 3 * times + scale;
                break;
        }
        var _c = quantitySuffixer.construct(base, exponent, this.format), suffix = _c[0], ok = _c[1];
        // result is BigNumber
        return (new bignumber_js_1.default(result)).toString() + suffix;
    };
    /**
     * Convert this quantity to a quantity with specific digit and suffix.
     * The digit is a BigNumber rounded by rounding mode `rm` to a maximum of `dp` decimal places
     *
     * @param {string} suffix
     * @param {number} [dp] If `dp` is omitted, or is `null` or `undefined`, the return quantity.digit is rounded to a whole number.
     * @param {number} [rm] If `rm` is omitted, or is `null` or `undefined`, `ROUNDING_MODE` is used.
     */
    Quantity.prototype.convertTo = function (suffix, dp, rm) {
        var _a = quantitySuffixer.interpret(suffix), base = _a[0], exponent = _a[1], format = _a[2], ok = _a[3];
        if (!ok) {
            throw ErrSuffix;
        }
        // roundup
        // 0.5n roundup to 1n
        var scaled = this.round(-Nano, null);
        // get true number and rounded to precision significant digits
        var result = scaled.div(new bignumber_js_1.default(base).pow(exponent));
        if (dp != null && dp >= 0) {
            result = result.round(dp, rm);
        }
        result.digit = new bignumber_js_1.default(result);
        result.suffix = suffix;
        result.format = format;
        return result;
    };
    return Quantity;
}(bignumber_js_1.default));
exports.Quantity = Quantity;
function removeFactors(value, base) {
    var times = 0;
    if (value instanceof Quantity) {
        var result = value;
        var sign = result.sign();
        if (sign === -1) {
            result = result.neg();
        }
        // value 3 * 1024 ^ 2  base 1024
        // times = 2
        // result 3
        while (result.gte(base) && result.mod(base, null).isZero()) {
            times++;
            result = result.div(base);
        }
        if (sign === -1) {
            result = result.neg();
        }
        return [result, times];
    }
    else {
        var result = value;
        var neg = result < 0;
        if (neg) {
            result = -result;
        }
        while (result >= base && result % base == 0) {
            times++;
            result /= base;
        }
        if (neg) {
            result = -result;
        }
        return [result, times];
    }
}
// -----------------------------------------------------------
/**
 * parse quantity string to positive, value, num, denom, suffix
 * example: a string 10.25Mi will be parsed to [true, 10.25, 10, 25, Mi]
 *
 * @param {string} str
 * @throws {ErrFormatWrong}
 * @returns {[boolean, string, string, string, string]}
 */
function parseQuantityString(str) {
    var positive = true;
    var pos = 0;
    var end = str.length;
    var num = "0";
    var value = "";
    var denom = "";
    var suffix = "";
    // handle leading sign
    if (pos < end) {
        switch (str.charAt(0)) {
            case "-":
                positive = false;
                pos++;
                break;
            case "+":
                pos++;
                break;
        }
    }
    // strip leading zeros
    Zeroes: for (var i = pos;; i++) {
        if (i >= end) {
            num = "0";
            value = num;
            return [positive, value, num, denom, suffix];
        }
        switch (str.charAt(i)) {
            case "0":
                pos++;
                break;
            default:
                break Zeroes;
        }
    }
    // extract the numerator
    Num: for (var i = pos;; i++) {
        if (i >= end) {
            num = str.slice(pos, end);
            value = str.slice(0, end);
            return [positive, value, num, denom, suffix];
        }
        switch (str.charAt(i)) {
            case "0":
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
            case "8":
            case "9":
                break;
            default:
                num = str.slice(pos, i);
                pos = i;
                break Num;
        }
    }
    // if we stripped all numerator positions, always return 0
    if (num.length === 0) {
        num = "0";
    }
    if (pos < end && str.charAt(pos) == ".") {
        pos++;
        Denom: for (var i = pos;; i++) {
            if (i >= end) {
                denom = str.slice(pos, end);
                value = str.slice(0, end);
                return [positive, value, num, denom, suffix];
            }
            switch (str.charAt(i)) {
                case "0":
                case "1":
                case "2":
                case "3":
                case "4":
                case "5":
                case "6":
                case "7":
                case "8":
                case "9":
                    break;
                default:
                    denom = str.slice(pos, i);
                    pos = i;
                    break Denom;
            }
        }
    }
    value = str.slice(0, pos);
    if (value.length == 0) {
        value = "0";
    }
    var suffixStart = pos;
    for (var i = pos;; i++) {
        if (i >= end) {
            suffix = str.slice(suffixStart, end);
            return [positive, value, num, denom, suffix];
        }
        if (!str.charAt(i).match(/[eEinumkKMGTP]/i)) {
            pos = i;
            break;
        }
    }
    if (pos < end) {
        switch (str.charAt(pos)) {
            case "-":
            case "+":
                pos++;
                break;
        }
    }
    Suffix: for (var i = pos;; i++) {
        if (i >= end) {
            suffix = str.slice(suffixStart, end);
            return [positive, value, num, denom, suffix];
        }
        switch (str.charAt(i)) {
            case "0":
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
            case "8":
            case "9":
                break;
            default:
                break Suffix;
        }
    }
    throw ErrFormatWrong;
}
// 
// 
/**
 * parse string to Quantity
 *
 * @param {string} str
 * @throws {ErrFormatWrong} if quantity format is not match "^([+-]?[0-9.]+)([eEinumkKMGTP]*[-+]?[0-9]*)$"
 * @throws {ErrSuffix} if suffix is not registered
 * @returns {Quantity}
 */
function parseQuantity(str) {
    if (str.length === 0) {
        throw ErrFormatWrong;
    }
    if (str == "0") {
        return new Quantity(DecimalSI, 0, null);
    }
    var _a = parseQuantityString(str), positive = _a[0], value = _a[1], num = _a[2], denom = _a[3], suf = _a[4];
    var _b = quantitySuffixer.interpret(suf), base = _b[0], exponent = _b[1], format = _b[2], ok = _b[3];
    if (!ok) {
        throw ErrSuffix;
    }
    var big = new bignumber_js_1.default(value);
    big = big.mul(new bignumber_js_1.default(base).pow(exponent));
    return new Quantity(format, big, null);
}
exports.parseQuantity = parseQuantity;
