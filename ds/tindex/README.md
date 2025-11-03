# dubc-ds-tindex

A set of values sorted using a weighted binary search tree.
The values are sorted based on two functions: an _index_ function
that produces a key given a value, and a _compare_ function that
compares keys.

## Constructor

```TypeScript
constructor(conf:Conf<K,V>, values:Iterable<V>)
```

To construct a `TIndex`, you need a configuration object that supplies
the index and compare functions.

You also can supply an iterable of initial values to populate the index.

Example:

```TypeScript
import { Conf, TIndex } from "dubc-ds-tindex"

interface User {
  id: string
  email: string
}

const conf:Conf<User> = {
  index: user => user.id,
  compare: (k1,k2) => k1.localeCompare(k2),
}

const index = new TIndex(conf, [{id:"1", email:"fake@example.com"}])
```

## Properties

### `.compare` O(1)

Returns the current function used to compare keys. This property is
mutable: If you change it, the index will re-sort (and fire a notification
to any listeners that the index has changed.)

### `.first` O(log n)

Returns the first value in the index, or `undefined` if the index
is empty.

### `.i` O(1)

Returns an iterator over the values in the index.

### `.last` O(log n)

Returns the last value in the index, or `undefined` if the index
is empty.

### `.only` O(1)

Returns the only value in the index. If the index doesn't have
exactly one element, throws an `Error`.

### `.size` O(1)

Returns the number of values in the index.

## Methods

### `.add(value:V)` O(log n)

Adds a value to the index. Returns true if the index actually changed,
which can happen in one of two ways:

1. If the index does _not_ already contain a value whose key is the same
as the given value's, then the new value is added.
2. If the index _does_ have a value with the same key as the given value,
and the given value is a different value than the indexed value, then
the value is changed to the new one.

Returns false if the index contained a value with the same key, and it's
the same value as before.

Note that values are compared via `Object.is`, that is, by reference
for object types.

### `.addAll(i:Iterable<V>)` O(k * log n)

Adds many values to the index. Returns the number of values that were newly
added.

### `.after(v:V)` O(log n)

Returns the value strictly greater than the provided
value, or `undefined` if no such value exists in the index.

### `.at(index:number)` O(log n)

Returns the value at the specified index in the sort order.
Throws a `TypeError` if the index is out of bounds.

### `.before(v:V)` O(log n)

Returns the value strictly less than the provided
value, or `undefined` if no such value exists in the index.

### `.delete(v:V)` O(log n)

Removes the given value from the index. Returns true if the value
existed in the index and was removed.

### `.deleteAll(i:Iterable<V>)` O(k * log n)

Removes every value provided by the given iterable from the index.
Returns the number of values that were deleted.

### `.drop(f:(value:V)=>boolean)` O(n)

Safely removes all values that match the provided predicate
function from the index. Use this instead of calling `delete` from within
an iteration. Returns the number of values that were dropped.

### `.from(v:V)` O(log n)

Returns the value greater than or equal to the provided
value, or `undefined` if no such value exists in the index.

### `.get(k:K)` O(log n)

Returns the value for the given key, or `undefined` if no such key exists
in the index.

### `.has(v:V)` O(log n)

Returns true if the index contains the given value, or false if it doesn't.

### `.hasAll(i:Iterable<V>)` O(k * log n)

Returns true if the index contains every value produced by the given iterable,
or false if it doesn't.

### `.hear(f:(event:DSEvent<V>))` O(1)

Adds a listener to the index. Any time the index changes (and _only_ when
the index actually changes), the listener function will be called.

Returns a number that can be sent to `unhear` to stop receiving events.

### `.range(start:V, end:V, include?:Include)` O(1)

Returns an iterable iterator over a range of values in the index.

The optional third parameter specifies whether the range is inclusive
or exclusive, and must be one of the following four constants:

1. `IN_EX`: Start is inclusive, end is exclusive. This is the default.
2. `IN_IN`: Both start and end are inclusive.
3. `EX_IN`: Start is exclusive, end is inclusive.
4. `EX_EX`: Both start and end are exclusive.

### `.rank(v:V)` O(log n)

Returns the index of the given value in the index's sort order, or
`undefined` if the value is not in the index.

### `.replace(i:Iterable<V>)` O(k * log n)

Replaces the content of this index with new values.

### `.reversed()` O(1)

Returns an iterable iterator over the values in the index, in reverse
sort order.

### `.to(v:V)` O(log n)

Returns the value less than or equal to the provided
value, or `undefined` if no such value exists in the map.

### `.unhear(n:number)` O(1)

Removes the listener registered with the specified number.

## Operations by Kind

### Listeners

* `hear(eventHandler)` to get events when the index changes
* `unhear(n)` to stop listening for changes

### Iterators

* `TIndex` itself is an iterable, so you can use it directly in `for...of`
* `i` to get an iterator 
* `range(start,end,include)` for partial iteration
* `reversed()` to iterate backwards

### Keys

* `get(key)` to get the value for a key

### Values

* `has(value)` to determine if the key exists
* `hasAll(iterable)` to determin if all the keys exist
* `only` to get the only value

### Ordering

* `get compare` for the sort function

* `first` to get the first value
* `last` to get the last value

* `after(v)` to get the value > v
* `before(v)` to get the value < v
* `from(v)` to get the value >= v
* `to(v)` to get the value <= v

### Indices

* `at(index)` to get the value at an index
* `rank(value)` to get the index of a value
* `size` to get the number of values

### Adding/Changing

* `set compare` to re-sort the index
* `add(value)` add a value to the index
* `addAll(values)` add many values to the index
* `replace(values)` clear the index then add many values

### Deleting

* `clear()` delete everything
* `delete(value)` delete a specific value
* `deleteAll(iterable)` delete many values
* `drop(predicate)` delete values that match a predicate
