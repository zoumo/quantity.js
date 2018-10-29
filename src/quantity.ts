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

// var BigNumber = require('bignumber.js')
import BigNumber from "bignumber.js"

// Formats
const DecimalExponent = "DecimalExponent"
const BinarySI = "BinarySI"
const DecimalSI = "DecimalSI"

const splitREString = "^([+-]?[0-9.]+)([eEinumkKMGTP]*[-+]?[0-9]*)$"

// errors
const ErrFormatWrong = "quantities must match the regular expression '" + splitREString + "'"
const ErrSuffix = "unable to parse quantity's suffix"

// // max int 9007199254740991
// var maxIntFactors = 15

// -----------------------------------------------------------------------

const Nano = -9
const Micro = -6
const Milli = -3
const Kilo = 3
const Mega = 6
const Giga = 9
const Tera = 12
const Peta = 15
const Exa = 18

/**
 * bePair contains a base and exponent pair
 */
class bePair {
    private base: number = 0
    private exponent: number = 0

    constructor(base: number, exponent: number) {
        this.base = base
        this.exponent = exponent
    }
}
/**
 * listSuffixer contains two mapping relationship
 * @class listSuffixer
 */
class listSuffixer {
    private suffixToBE: any = {}
    private beToSuffix: any = {}

    /**
     * @constructor listSuffixer
     */
    constructor() {
        /**
         * @property {Object} suffixToBE is the suffix to bePair mapping
         * @property {Object} beToSuffix is the bePair to suffix mapping
         */
        this.suffixToBE = {}
        this.beToSuffix = {}
    }

    /**
     * register a suffix and bePair mapping relationship
     *  
     * @param {string} suffix 
     * @param {bePair} bePair 
     */
    addSuffix(suffix: string, bePair: bePair) {
        this.suffixToBE[suffix] = bePair
        this.beToSuffix[JSON.stringify(bePair)] = suffix

    }

    /**
     * Find the bePair related to the given suffix,
     * if not, if boolean in returns will be false 
     * 
     * @param {string} suffix 
     * @returns {[number, number, boolean]} if suffix is not registered, the return boolean will be false
     */
    lookup(suffix: string): [number, number, boolean] {
        if (!this.suffixToBE.hasOwnProperty(suffix)) {
            return [0, 0, false]
        }
        let pair = this.suffixToBE[suffix]
        return [pair.base, pair.exponent, true]
    }

    /**
     * construct a suffix related to the given bePair,
     * if not, the boolean in returns will be false
     * 
     * @param {number} base 
     * @param {number} exponent 
     * @returns {[string, boolean]}
     */
    construct(base: number, exponent: number): [string, boolean] {
        let key = JSON.stringify(new bePair(base, exponent))
        if (!this.beToSuffix.hasOwnProperty(key)) {
            return ["", false]
        }
        let suffix = this.beToSuffix[key]
        return [suffix, true]
    }

}

/**
 * suffixHandler help you to handle suffix and format
 * @class suffixHandler
 */
class suffixHandler {
    public decSuffixes: listSuffixer = new listSuffixer()
    public binSuffixes: listSuffixer = new listSuffixer()

    /**
     * @constructor suffixHandler
     */
    constructor() {
        /**
         * @property {listSuffixer} decSuffixes DecimalSI suffix mapping
         * @property {listSuffixer} binSuffixes BinarySI suffix mapping
         */
        this.decSuffixes = new listSuffixer()
        this.binSuffixes = new listSuffixer()
    }

    /**
     * interpret a suffix to base, exponent, format 
     * 
     * @param {string} suffix 
     * @returns {[number, number, string, boolean]}
     */
    public interpret(suffix: string): [number, number, string, boolean] {
        let [b, e, ok] = this.decSuffixes.lookup(suffix)
        if (ok) {
            return [b, e, DecimalSI, true]
        }
        [b, e, ok] = this.binSuffixes.lookup(suffix)
        if (ok) {
            return [b, e, BinarySI, true]
        }

        if (suffix.length > 1 && (suffix.charAt(0) == "e" || suffix.charAt(0) == "E")) {
            let parsed = parseInt(suffix.slice(1))
            return [10, parsed, DecimalExponent, true]
        }

        return [0, 0, DecimalExponent, false]
    }

    /**
     * construct a suffix by given base, exponent and format
     * 
     * @param {number} base 
     * @param {number} exponent 
     * @param {string} format 
     * @returns {[string, boolean]}
     */
    public construct(base: number, exponent: number, format: string): [string, boolean] {
        switch (format) {
            case DecimalSI:
                return this.decSuffixes.construct(base, exponent)
            case BinarySI:
                return this.binSuffixes.construct(base, exponent)
            case DecimalExponent:
                if (base != 10) {
                    return ["", false]
                }

                if (exponent === 0) {
                    return ["", true]
                }
                return ["e" + exponent, true]
        }
        return ["", false]
    }

}

class fastLookup extends suffixHandler {

    constructor() {
        super()

        this.binSuffixes.addSuffix("Ki", new bePair(2, 10))
        this.binSuffixes.addSuffix("Mi", new bePair(2, 20))
        this.binSuffixes.addSuffix("Gi", new bePair(2, 30))
        this.binSuffixes.addSuffix("Ti", new bePair(2, 40))
        this.binSuffixes.addSuffix("Pi", new bePair(2, 50))
        this.binSuffixes.addSuffix("Ei", new bePair(2, 60))
        // Don't emit an error when trying to produce
        // a suffix for 2^0.
        this.decSuffixes.addSuffix("", new bePair(2, 0))

        this.decSuffixes.addSuffix("n", new bePair(10, Nano))
        this.decSuffixes.addSuffix("u", new bePair(10, Micro))
        this.decSuffixes.addSuffix("m", new bePair(10, Milli))
        this.decSuffixes.addSuffix("", new bePair(10, 0))
        this.decSuffixes.addSuffix("k", new bePair(10, Kilo))
        this.decSuffixes.addSuffix("M", new bePair(10, Mega))
        this.decSuffixes.addSuffix("G", new bePair(10, Giga))
        this.decSuffixes.addSuffix("T", new bePair(10, Tera))
        this.decSuffixes.addSuffix("P", new bePair(10, Peta))
        this.decSuffixes.addSuffix("E", new bePair(10, Exa))
    }

    /**
     * interpret a suffix to base, exponent, format 
     * 
     * @param {string} suffix 
     * @returns {[number, number, string, boolean]}
     */
    public interpret(suffix: string): [number, number, string, boolean] {
        switch (suffix) {
            case "":
                return [10, 0, DecimalSI, true]
            case "n":
                return [10, Nano, DecimalSI, true]
            case "u":
                return [10, Micro, DecimalSI, true]
            case "m":
                return [10, Milli, DecimalSI, true]
            case "k":
                return [10, Kilo, DecimalSI, true]
            case "M":
                return [10, Mega, DecimalSI, true]
            case "G":
                return [10, Giga, DecimalSI, true]
        }
        return super.interpret(suffix)
    }

}

/**
 * quantitySuffixer handles suffixes for all three formats that quantity can handle.
 */
const quantitySuffixer = new fastLookup()

// -----------------------------------------------------------

/**
 * Quantity extends BigNumber, rewrite the string function
 * @class Quantity
 */
class Quantity extends BigNumber {
    public format: string
    private digit: number | string | BigNumber | Quantity | null
    private suffix: string | null

    /**
     * 
     * @param {string} format must be DecimalExponent | DecimalSI | BinarySI
     * @param {number|string|BigNumber|Quantity} numberlike 
     * @param {number} base 
     */
    constructor(format: string, numberlike: number | string | BigNumber, base?: number) {
        super(numberlike, base)
        this.format = format
        this.digit = null
        this.suffix = null
    }

    sign() {
        return this.s
    }

    neg(): any {
        return new Quantity(this.format, super.neg());
    }

    minus(n: number | string | BigNumber, base?: number): any {
        return new Quantity(this.format, super.minus(n, base))
    }

    sub(n: number | string | BigNumber, base?: number): any {
        return new Quantity(this.format, super.sub(n, base))
    }

    add(n: number | string | BigNumber, base?: number): any {
        return new Quantity(this.format, super.add(n, base))
    }

    plus(n: number | string | BigNumber, base?: number): any {
        return new Quantity(this.format, super.plus(n, base))
    }

    div(n: number | string | BigNumber, base?: number): any {
        return new Quantity(this.format, super.div(n, base))
    }

    mul(n: number | string | BigNumber, base?: number): any {
        return new Quantity(this.format, super.mul(n, base))
    }

    times(n: number | string | BigNumber, base?: number): any {
        return new Quantity(this.format, super.times(n, base))
    }

    mod(n: number | string | BigNumber, base?: number): any {
        return new Quantity(this.format, super.mod(n, base))
    }

    modulo(n: number | string | BigNumber, base?: number): any {
        return new Quantity(this.format, super.modulo(n, base))
    }

    round(dp?: number, rm?: number): any {
        return new Quantity(this.format, super.round(dp, rm))
    }

    ceil(): any {
        return new Quantity(this.format, super.ceil())
    }

    floor(): any {
        return new Quantity(this.format, super.floor())
    }

    toPrecision(sd?: number, rm?: number): any {
        return new Quantity(this.format, super.toPrecision(sd, rm))
    }

    /**
     * Returns a string representing the value of this BigNumber in the base `10`
     */
    toString(): string {
        if (this.digit != null && this.suffix != null) {
            return this.digit.toString() + this.suffix
        }

        let result
        let times: number
        let base: number = 0
        let exponent: number = 0
        let scale: number = 0

        // roundup
        // 0.5n roundup to 1n
        let scaled = this.round(-Nano, 0)

        switch (this.format) {
            case BinarySI:
                [result, times] = removeFactors(scaled, 1024) // 2 ^ 10
                base = 2
                exponent = 10 * times
                break
            case DecimalSI:
            case DecimalExponent:
                // as scale
                // 1.23: precision=3, e=0 scale to 1230: precision=3, e=3, scale=-3
                // 0.5: precision=1, e=-1 scale to 500: precision=1, e=2, scale=-3
                let precision = scaled.precision()
                let e = scaled.e
                // e - precision < -1 means that need to rescale it
                // so will can get accurate suffix  
                if (e - precision < -1) {
                    while (e - precision - scale < -1) {
                        scale -= 3
                    }
                    scaled = scaled.mul(new BigNumber(10).pow(-scale))
                }
                [result, times] = removeFactors(scaled, 1000) // 10 ^ 3
                base = 10
                exponent = 3 * times + scale
                break
        }

        let [suffix, ok] = quantitySuffixer.construct(base, exponent, this.format)
        // result is BigNumber

        return (new BigNumber(result)).toString() + suffix
    }
    /**
     * Convert this quantity to a quantity with specific digit and suffix.
     * The digit is a BigNumber rounded by rounding mode `rm` to a maximum of `dp` decimal places
     * 
     * @param {string} suffix 
     * @param {number} [dp] If `dp` is omitted, or is `null` or `undefined`, the return quantity.digit is rounded to a whole number.
     * @param {number} [rm] If `rm` is omitted, or is `null` or `undefined`, `ROUNDING_MODE` is used.
     */
    convertTo(suffix: string, dp?: number, rm?: number) {
        let [base, exponent, format, ok] = quantitySuffixer.interpret(suffix)
        if (!ok) {
            throw ErrSuffix
        }

        // roundup
        // 0.5n roundup to 1n
        let scaled: any = this.round(-Nano)


        // get true number and rounded to precision significant digits
        let result = scaled.div(new BigNumber(base).pow(exponent))
        if (dp != null && dp >= 0) {
            result = result.round(dp, rm)
        }

        result.digit = new BigNumber(result)
        result.suffix = suffix
        result.format = format
        return result
    }
}

function removeFactors(value: number | Quantity, base: number): [any, number] {
    let times = 0
    if (value instanceof Quantity) {
        let result = value
        let sign = result.sign()
        if (sign === -1) {
            result = result.neg()
        }

        // value 3 * 1024 ^ 2  base 1024
        // times = 2
        // result 3
        while (result.gte(base) && result.mod(base).isZero()) {
            times++
            result = result.div(base)
        }

        if (sign === -1) {
            result = result.neg()
        }

        return [result, times]
    } else {
        let result = value
        let neg = result < 0
        if (neg) {
            result = -result
        }

        while (result >= base && result % base == 0) {
            times++
            result /= base
        }

        if (neg) {
            result = -result
        }
        return [result, times]
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
function parseQuantityString(str: string): [boolean, string, string, string, string] {
    let positive = true
    let pos = 0
    let end = str.length
    let num = "0"
    let value = ""
    let denom = ""
    let suffix = ""
    // handle leading sign
    if (pos < end) {
        switch (str.charAt(0)) {
            case "-":
                positive = false
                pos++
                break
            case "+":
                pos++
                break
        }
    }

    // strip leading zeros
    Zeroes:
    for (let i = pos; ; i++) {
        if (i >= end) {
            num = "0"
            value = num
            return [positive, value, num, denom, suffix]
        }

        switch (str.charAt(i)) {
            case "0":
                pos++
                break
            default:
                break Zeroes
        }

    }

    // extract the numerator
    Num:
    for (let i = pos; ; i++) {
        if (i >= end) {
            num = str.slice(pos, end)
            value = str.slice(0, end)
            return [positive, value, num, denom, suffix]
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
                break
            default:
                num = str.slice(pos, i)
                pos = i
                break Num
        }
    }

    // if we stripped all numerator positions, always return 0
    if (num.length === 0) {
        num = "0"
    }

    if (pos < end && str.charAt(pos) == ".") {
        pos++

        Denom:
        for (let i = pos; ; i++) {
            if (i >= end) {
                denom = str.slice(pos, end)
                value = str.slice(0, end)
                return [positive, value, num, denom, suffix]
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
                    break
                default:
                    denom = str.slice(pos, i)
                    pos = i
                    break Denom
            }
        }
    }

    value = str.slice(0, pos)
    if (value.length == 0) {
        value = "0"
    }

    let suffixStart = pos
    for (let i = pos; ; i++) {
        if (i >= end) {
            suffix = str.slice(suffixStart, end)
            return [positive, value, num, denom, suffix]
        }

        if (!str.charAt(i).match(/[eEinumkKMGTP]/i)) {
            pos = i
            break
        }
    }

    if (pos < end) {
        switch (str.charAt(pos)) {
            case "-":
            case "+":
                pos++
                break
        }
    }

    Suffix:
    for (let i = pos; ; i++) {
        if (i >= end) {
            suffix = str.slice(suffixStart, end)
            return [positive, value, num, denom, suffix]
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
                break
            default:
                break Suffix
        }
    }

    throw ErrFormatWrong
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
function parseQuantity(str: string): Quantity {
    if (str.length === 0) {
        throw ErrFormatWrong
    }

    if (str == "0") {
        return new Quantity(DecimalSI, 0)
    }

    let [positive, value, num, denom, suf] = parseQuantityString(str)
    let [base, exponent, format, ok] = quantitySuffixer.interpret(suf)
    if (!ok) {
        throw ErrSuffix
    }

    let big = new BigNumber(value)
    big = big.mul(new BigNumber(base).pow(exponent))

    return new Quantity(format, big)
}

export {
    DecimalExponent,
    DecimalSI,
    BinarySI,
    parseQuantity,
    quantitySuffixer,
    Quantity
}
