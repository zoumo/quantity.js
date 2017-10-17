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

import assert from "assert"
import * as Q from "../quantity.js"

describe("quantity suffixer", function() {
    let qs = Q.quantitySuffixer

    it('suffixer interpret', function() {
        // BinarySI
        assert.deepEqual(qs.interpret("Ki"), [2, 10, Q.BinarySI, true])
        assert.deepEqual(qs.interpret("Mi"), [2, 20, Q.BinarySI, true])
        assert.deepEqual(qs.interpret("Gi"), [2, 30, Q.BinarySI, true])
        assert.deepEqual(qs.interpret("Ti"), [2, 40, Q.BinarySI, true])
        assert.deepEqual(qs.interpret("Pi"), [2, 50, Q.BinarySI, true])
        assert.deepEqual(qs.interpret("Ei"), [2, 60, Q.BinarySI, true])
        // DecimalSI
        assert.deepEqual(qs.interpret("n"), [10, -9, Q.DecimalSI, true])
        assert.deepEqual(qs.interpret("u"), [10, -6, Q.DecimalSI, true])
        assert.deepEqual(qs.interpret("m"), [10, -3, Q.DecimalSI, true])
        assert.deepEqual(qs.interpret(""), [10, 0, Q.DecimalSI, true])
        assert.deepEqual(qs.interpret("k"), [10, 3, Q.DecimalSI, true])
        assert.deepEqual(qs.interpret("M"), [10, 6, Q.DecimalSI, true])
        assert.deepEqual(qs.interpret("G"), [10, 9, Q.DecimalSI, true])
        assert.deepEqual(qs.interpret("T"), [10, 12, Q.DecimalSI, true])
        assert.deepEqual(qs.interpret("P"), [10, 15, Q.DecimalSI, true])
        assert.deepEqual(qs.interpret("E"), [10, 18, Q.DecimalSI, true])
        // DecimalExponent
        assert.deepEqual(qs.interpret("e-10"), [10, -10, Q.DecimalExponent, true])
        assert.deepEqual(qs.interpret("e+10"), [10, 10, Q.DecimalExponent, true])
        assert.deepEqual(qs.interpret("e10"), [10, 10, Q.DecimalExponent, true])
        assert.deepEqual(qs.interpret("E10"), [10, 10, Q.DecimalExponent, true])
        // Error
        let ok;
        [, , , ok] = qs.interpret("x")
        assert.deepEqual(ok, false)
    })

    it("suffixer construct", function() {
        assert.equal(qs.construct(2, 10, Q.BinarySI)[0], "Ki")
        assert.equal(qs.construct(2, 20, Q.BinarySI)[0], "Mi")
        assert.equal(qs.construct(2, 30, Q.BinarySI)[0], "Gi")
        assert.equal(qs.construct(2, 40, Q.BinarySI)[0], "Ti")
        assert.equal(qs.construct(2, 50, Q.BinarySI)[0], "Pi")
        assert.equal(qs.construct(2, 60, Q.BinarySI)[0], "Ei")

        assert.equal(qs.construct(10, -9, Q.DecimalSI)[0], "n")
        assert.equal(qs.construct(10, -6, Q.DecimalSI)[0], "u")
        assert.equal(qs.construct(10, -3, Q.DecimalSI)[0], "m")
        assert.equal(qs.construct(10, -0, Q.DecimalSI)[0], "")
        assert.equal(qs.construct(10, 3, Q.DecimalSI)[0], "k")
        assert.equal(qs.construct(10, 6, Q.DecimalSI)[0], "M")
        assert.equal(qs.construct(10, 9, Q.DecimalSI)[0], "G")
        assert.equal(qs.construct(10, 12, Q.DecimalSI)[0], "T")
        assert.equal(qs.construct(10, 15, Q.DecimalSI)[0], "P")
        assert.equal(qs.construct(10, 18, Q.DecimalSI)[0], "E")

        assert.equal(qs.construct(10, 18, Q.DecimalExponent)[0], "e18")
        assert.equal(qs.construct(10, -3, Q.DecimalExponent)[0], "e-3")

    })
})

describe("parse quantity and toString", function() {
    let parse = Q.parseQuantity
    it("parse 0", function() {
        let q = parse("0")
        assert.equal(q.isZero(), true)
        assert.equal(q.toString(), "0")
    })

    it("parse BinarySI", function() {

        let q = parse("123Mi")
        assert.equal(q.toString(), "123Mi")

        q = parse("23Ki")
        assert.equal(q.toString(), "23Ki")

        q = parse("0.5Mi")
        assert.equal(q.toString(), "512Ki")

        // removeFactors 1024 Ti = 1 Pi
        q = parse("1024Ti")
        assert.equal(q.toString(), "1Pi")

        // Can not removeFactors
        q = parse("10241Pi")
        assert.equal(q.toString(), "10241Pi")

        q = parse("0Ki")
        assert.equal(q.toString(), "0")
    })

    it("parse DecimalSI", function() {
        let q = parse("1")
        assert.equal(q.toString(), "1")

        q = parse("0.5")
        assert.equal(q.toString(), "500m")

        q = parse("m")
        assert.equal(q.toString(), "0")

        q = parse("0.5m")
        assert.equal(q.toString(), "500u")

        q = parse("0.5n")
        assert.equal(q.toString(), "1n")

        // removeFactors 1024 Ti = 1 Pi
        q = parse("1k")
        assert.equal(q.toString(), "1k")

        // Can not removeFactors
        q = parse("10241Pi")
        assert.equal(q.toString(), "10241Pi")
    })

    it("parse DecimalExponent", function() {
        let q = parse("1e0")
        assert.equal(q.toString(), "1")

        q = parse("1.2e3")
        assert.equal(q.toString(), "1200")

        q = parse("0.5e-1")
        assert.equal(q.toString(), "50e-3")

        // roundup
        q = parse("0.5e-9")
        assert.equal(q.toString(), "1e-9")

        q = parse("1.2e-1")
        assert.equal(q.toString(), "120e-3")

        q = parse("0e0")
        assert.equal(q.toString(), "0")
    })

})

describe("operation", function() {
    let parse = Q.parseQuantity

    it("add", function() {
        assert.deepEqual(parse("100Mi").add(parse("50Mi")), parse("150Mi"))
        assert.deepEqual(parse("100Mi").plus(parse("50Mi")), parse("150Mi"))
    })

    it("minus", function() {
        assert.deepEqual(parse("100Mi").minus(parse("50Mi")), parse("50Mi"))
        assert.deepEqual(parse("100Mi").sub(parse("50Mi")), parse("50Mi"))
    })

    it("div", function() {
        assert.deepEqual(parse("100").div(parse("50")), parse("2"))
    })

    it("mul", function() {
        assert.deepEqual(parse("2").mul(parse("50")), parse("100"))
        assert.deepEqual(parse("2").times(parse("50")), parse("100"))
    })

    it("mod", function() {
        assert.deepEqual(parse("10").mod(parse("3")), parse("1"))
    })
})

describe("convert", function() {
    let parse = Q.parseQuantity

    it("no round", function() {
        assert.equal(parse("1.5Mi").convertTo("Mi").toString(), "1.5Mi")
        assert.equal(parse("1.5Mi").convertTo("Ki").toString(), "1536Ki")
    })
    
    it("round", function() {
        assert.equal(parse("1.5Mi").convertTo("Mi", 0).toString(), "2Mi")
        assert.equal(parse("500Mi").convertTo("Gi", 2).toString(), "0.49Gi")
    })
})
