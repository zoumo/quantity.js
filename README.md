# Quantity.js

quantity.js provides parser/operations for k8s quantity

It is based on [bignumber.js](https://github.com/MikeMcl/bignumber.js/)

# Load

For [Node.js](nodejs.org), the library is available from [npm](https://www.npmjs.com/) registry

```
$ npm install quantity.js
```

```
var quantity = require('quantity.js')
```

ES6

```
import * as quantity from "quantity.js"
```

# Use

```
parse = quantity.parseQuantity
x = parse("100Mi")

parse("0.5Mi").toString() // "512Ki"
parse("1024Ti").toString() // "1Pi"
parse("10241Mi").toString() // "10241Mi"

// add
x.add(parse("50Mi")) // "150Mi"
x.plus(parse("50Mi")) // "150Mi"

// minus
x.minus(parse("50Mi")) // "50Mi"
x.sub(parse("50Mi")) // "50Mi"

// div
x = parse("100")
x.div(parse("50")) // "2"
x.sub(parse("50Mi")) // "50Mi"

// mul
x = parse("2")
x.mul(parse("50")) // "100"
x.times(parse("50")) // "100"

// mod
x = parse("10")
x.mod(parse("3")) // "1"
```
