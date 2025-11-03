# dubc-ds-tset

A set of values sorted using a weighted binary search tree.

## Constructor

```TypeScript
constructor(conf:Conf<T>, values:Iterable<T>)
```

To construct a `TSet`, you need a configuration object that supplies
a compare function.

You also can supply an iterable of initial values to populate the set.

Example:

```TypeScript
import { Conf, TSet } from "dubc-ds-tset"

const conf:Conf<string> = {
  compare: (k1,k2) => k1.localeCompare(k2),
}

const set = new TSet(conf, ["1", "2", "3"])
```

## Properties

### `.compare` O(1)

Returns the current function used to compare values. This property is
mutable: If you change it, the set will re-sort (and fire a notification
to any listeners that the set has changed.)

### `.first` O(log n)

Returns the first value in the set, or `undefined` if the set
is empty.

### `.i` O(1)

Returns an iterator over the values in the set.

### `.last` O(log n)

Returns the last value in the set, or `undefined` if the set
is empty.

### `.only` O(1)

Returns the only value in the set. If the set doesn't have
exactly one element, throws an `Error`.

### `.size` O(1)

Returns the number of values in the set.

## Methods

### `.add(value:T)` O(log n)

Adds a value to the set. Returns true if the value was not previously
in the set.

### `.addAll(i:Iterable<T>)` O(k * log n)

Adds many values to the set. Returns the number of values that were newly
added.

### `.after(v:T)` O(log n)

Returns the value strictly greater than the provided
value, or `undefined` if no such value exists in the set.

### `.at(index:number)` O(log n)

Returns the value at the specified index in the sort order.
Throws a `TypeError` if the index is out of bounds.

### `.before(v:T)` O(log n)

Returns the value strictly less than the provided
value, or `undefined` if no such value exists in the set.

### `.delete(v:T)` O(log n)

Removes the given value from the set. Returns true if the value
existed in the set and was removed.

### `.deleteAll(i:Iterable<T>)` O(k * log n)

Removes every value provided by the given iterable from the set.
Returns the number of values that were deleted.

### `.drop(f:(value:T)=>boolean)` O(n)

Safely removes all values that match the provided predicate
function from the set. Use this instead of calling `delete` from within
an iteration. Returns the number of values that were dropped.

### `.from(v:T)` O(log n)

Returns the value greater than or equal to the provided
value, or `undefined` if no such value exists in the set.

### `.has(v:T)` O(log n)

Returns true if the set contains the given value, or false if it doesn't.

### `.hasAll(i:Iterable<T>)` O(k * log n)

Returns true if the set contains every value produced by the given iterable,
or false if it doesn't.

### `.hear(f:(event:DSEvent<T>))` O(1)

Adds a listener to the set. Any time the set changes (and _only_ when
the set actually changes), the listener function will be called.

Returns a number that can be sent to `unhear` to stop receiving events.

### `.range(start:T, end:T, include?:Include)` O(1)

Returns an iterable iterator over a range of values in the set.

The optional third parameter specifies whether the range is inclusive
or exclusive, and must be one of the following four constants:

1. `IN_EX`: Start is inclusive, end is exclusive. This is the default.
2. `IN_IN`: Both start and end are inclusive.
3. `EX_IN`: Start is exclusive, end is inclusive.
4. `EX_EX`: Both start and end are exclusive.

### `.rank(v:T)` O(log n)

Returns the index of the given value in the set's sort order, or
`undefined` if the value is not in the set.

### `.replace(i:Iterable<T>)` O(k * log n)

Replaces the content of this set with new values.

### `.reversed()` O(1)

Returns an iterable iterator over the values in the set, in reverse
sort order.

### `.to(v:T)` O(log n)

Returns the value less than or equal to the provided
value, or `undefined` if no such value exists in the map.

### `.unhear(n:number)` O(1)

Removes the listener registered with the specified number.

## Operations by Kind

### Listeners

* `hear(eventHandler)` to get events when the set changes
* `unhear(n)` to stop listening for changes

### Iterators

* `TSet` itself is an iterable, so you can use it directly in `for...of`
* `i` to get an iterator 
* `range(start,end,include)` for partial iteration
* `reversed()` to iterate backwards

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

* `at(set)` to get the value at an set
* `rank(value)` to get the set of a value
* `size` to get the number of values

### Adding/Changing

* `set compare` to re-sort the set
* `add(value)` add a value to the set
* `addAll(values)` add many values to the set
* `replace(values)` clear the set then add many values

### Deleting

* `clear()` delete everything
* `delete(value)` delete a specific value
* `deleteAll(iterable)` delete many values
* `drop(predicate)` delete values that match a predicate
