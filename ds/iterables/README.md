# dubc-ds-iterables

A library of utility functions for iterables.

## Functions

### `filter`

Filters an iterable with a predicate function.

In this example, the set is filtered for even numbers:

```TypeScript
const set = new Set([1, 2, 3, 4])
filter(set, x => x % 2 === 0)
```

Note that unlike `Array.filter`, the return of this module's `filter`
function is an iterable; no additional storage is allocated. Changes
to the given iterable will be reflected in the returned iterable.

### `first`

Returns the first element in an iterable.

```TypeScript
const set = new Set([100, 200, 300])
first(set) // 100

const empty = new Set([])
first(empty) // undefined
```

### `has`

Returns true if the iterable has the given element.

```TypeScript
const i = map(new Set([1, 2, 3]), x => String(x))
has(i, "2") // true
has(i, "4") // false
```

### `iterable`

Converts a generator function into an iterable.

Generator functions already implement the Iterable interface,
but that iterable can only be used once:

```TypeScript
*function seq() {
  for (let i = 0; i < 4; i++) yield i
}

const i:Iterable<number> = seq()
[...i] // [0, 1, 2, 3]
[...i] // [] /* it was only usable once! */

const i2 = iterable(seq)
[...i2] // [0, 1, 2, 3]
[...i2] // [0, 1, 2, 3]  /* usable multiple times! */
```

### `map`

Maps an interable over a function.

This examples converts the set of integers into an iterable of strings:

```TypeScript
const set = new Set([1, 2, 3])
const m = map(set, x => String(x))
[...m] // ["1", "2", "3"]
```

### `last`

Returns the first element in an iterable.

```TypeScript
const set = new Set([100, 200, 300])
last(set) // 300

const empty = new Set([])
last(empty) // undefined
```

### `map`

Note that unlike `Array.map`, the return of this module's `map`
function is an iterable; no additional storage is allocated. Changes
to the given iterable will be reflected in the returned iterable.

### `only`

Returns the only element of an iterable. Throws an error if the
iterable doesn't have exactly one element.

```TypeScript
const set = new Set([100, 200, 300])
only(set) // Error: more than one element

const empty = new Set([])
only(empty) // Error: no elements

const one = new Set([100])
only(one) // 100
```

### `reduce`

Reduces an iterable to a single value. This is similar to `Array.reduce`,
it just works on arbitrary iterables instead of only arrays.

```TypeScript
const set = new Set([1, 2, 3, 4])
const sum = reduce(set, 0, (a,x) => a + x) // 10
```
