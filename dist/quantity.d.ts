import BigNumber from "bignumber.js";
declare const DecimalExponent = "DecimalExponent";
declare const BinarySI = "BinarySI";
declare const DecimalSI = "DecimalSI";
/**
 * suffixHandler help you to handle suffix and format
 * @class suffixHandler
 */
declare class suffixHandler {
    decSuffixes: any;
    binSuffixes: any;
    /**
     * @constructor suffixHandler
     */
    constructor();
    /**
     * interpret a suffix to base, exponent, format
     *
     * @param {string} suffix
     * @returns {[number, number, string, boolean]}
     */
    interpret(suffix: any): any[];
    /**
     * construct a suffix by given base, exponent and format
     *
     * @param {number} base
     * @param {number} exponent
     * @param {string} format
     * @returns {[string, boolean]}
     */
    construct(base: any, exponent: any, format: any): any;
}
declare class fastLookup extends suffixHandler {
    constructor();
    /**
     * interpret a suffix to base, exponent, format
     *
     * @param {string} suffix
     * @returns {[number, number, string, boolean]}
     */
    interpret(suffix: any): any[];
}
/**
 * quantitySuffixer handles suffixes for all three formats that quantity can handle.
 */
declare const quantitySuffixer: fastLookup;
/**
 * Quantity extends BigNumber, rewrite the string function
 * @class Quantity
 */
declare class Quantity extends BigNumber {
    format: any;
    digit: any;
    suffix: any;
    s: any;
    /**
     *
     * @param {string} format must be DecimalExponent | DecimalSI | BinarySI
     * @param {number|string|BigNumber|Quantity} numberlike
     * @param {number} base
     */
    constructor(format: any, numberlike: any, base: any);
    sign(): any;
    neg(): any;
    minus(n: any, base: any): any;
    sub(n: any, base: any): any;
    add(n: any, base: any): any;
    plus(n: any, base: any): any;
    div(n: any, base: any): any;
    mul(n: any, base: any): any;
    times(n: any, base: any): any;
    mod(n: any, base: any): any;
    modulo(n: any, base: any): any;
    round(dp: any, rm: any): any;
    ceil(): any;
    floor(): any;
    toPrecision(sd: any, rm: any): any;
    /**
     * Returns a string representing the value of this BigNumber in the base `10`
     */
    toString(): any;
    /**
     * Convert this quantity to a quantity with specific digit and suffix.
     * The digit is a BigNumber rounded by rounding mode `rm` to a maximum of `dp` decimal places
     *
     * @param {string} suffix
     * @param {number} [dp] If `dp` is omitted, or is `null` or `undefined`, the return quantity.digit is rounded to a whole number.
     * @param {number} [rm] If `rm` is omitted, or is `null` or `undefined`, `ROUNDING_MODE` is used.
     */
    convertTo(suffix: any, dp: any, rm: any): any;
}
/**
 * parse string to Quantity
 *
 * @param {string} str
 * @throws {ErrFormatWrong} if quantity format is not match "^([+-]?[0-9.]+)([eEinumkKMGTP]*[-+]?[0-9]*)$"
 * @throws {ErrSuffix} if suffix is not registered
 * @returns {Quantity}
 */
declare function parseQuantity(str: string): Quantity;
export { DecimalExponent, DecimalSI, BinarySI, parseQuantity, quantitySuffixer, Quantity };
