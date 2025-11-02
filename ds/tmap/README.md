# dubc-ds-tmap

A map (dictionary) of key/value pairs that is sorted using a weighted
binary search tree. 

Note that this data structure maps _arbitrary_ keys to _arbitrary_
values. When doing front-end development, that's usually not what
you actually need. Consider using `dubc-ds-tindex` instead, which
provides a dictionary where the keys are a function of the values.

## Constructor

```TypeScript
constructor(conf:Conf<K,V>, pairs:Pairs<K,V>)
```

To construct a `TMap`, you need a configuration object that supplies
three things:

1. A `compare` function that determines how to sort the keys in the map.
2. A `unique` flag that determines whether the map can contain duplicate keys.
3. A `valueEq` function that determines how values should be compared.

You also can supply initial key/value pairs to populate the map. The
pairs can be specified in three ways:

1. You can specify an iterable of objects with `key` and `value` fields;
2. Or an iterable of key/value tuples, where the first part of the tuple
   is the key and the second part of the tuplie is the value;
3. Or, if the keys are strings, you can use a plain JavaScript object.

If you want unique keys and can use `Object.is` for your `valueEq` function,
you can use the static `of` method to construct a `TMap` with variadic 
key/value pairs.

Example:

```TypeScript
import { Conf, TMap } from "dubc-ds-tmap"

const compare = (a:string, b:string) => a.localeCompare(b)

const conf:Conf<string,number> = {
  compare, unique:false, valueEq:Object.is,
}

// These five statements all do the same thing.
const map1 = new TMap(conf, [{key:"1", value:1}, {key:"2", value:2}])
const map2 = new TMap(conf, [["1", 1], ["2", 2]])
const map3 = new TMap(conf, {"1":1, "2":2})
const map4 = TMap.of(compare, {key:"1", value:1}, {key:"2", value:2})
const map5 = TMap.of(compare, ["1", 1], ["2", 2])
```

## Properties

### `.compare` O(1)

Returns the current function used to compare keys. This property is
mutable: If you change it, the map will re-sort (and fire a notification
to any listeners that the map has changed.)

### `.first` O(log n)

Returns the first key/value pair in the map, or `undefined` if the map
is empty.

### `.i` O(1)

Returns an iterator over the key/value pairs in the map. Each value
returned by the iterator will be an immutable object in the form `{key:k, value:v}`. (This property is inherited from `Base`.)

### `.last` O(log n)

Returns the last key/value pair in the map, or `undefined` if the map
is empty.

### `.only` O(1)

Returns the only key/value pair in the map. If the map doesn't have
exactly one element, throws an `Error`.

### `.size` O(1)

Returns the number of key/value pairs in the map.

## Methods

### `.after(k:K)` O(log n)

Returns the key/value pair whose key is strictly greater than the provided
key, or `undefined` if no such pair exists in the map.

### `.at(index:number)` O(log n)

Returns the key/value pair at the specified index in the sort order.
Throws a `TypeError` if the index is out of bounds.

### `.before(k:K)` O(log n)

Returns the key/value pair whose key is strictly less than the provided
key, or `undefined` if no such pair exists in the map.

### `.delete(k:K)` O(log n)

Removes the given key from the map. Returns the value that was mapped
to the key, or `undefined` if the key was not in the map.

### `.deleteAll(i:Iterable<K>)` O(k * log n)

Removes every key provided by the given iterable from the map.
Returns the number of pairs that were deleted.

### `.drop(f:(pair:Pair<K,V>)=>boolean)` O(n)

Safely removes all key/value pairs that match the provided predicate
function from the map. Use this instead of calling `delete` from within
an iteration. Returns the number of pairs that were dropped.

### `.from(k:K)` O(log n)

Returns the key/value pair whose key is greater than or equal to the provided
key, or `undefined` if no such pair exists in the map.

### `.get(k:K)` O(log n)

Returns the value for the given key, or `undefined` if no such key exists
in the map.

### `.has(k:K)` O(log n)

Returns true if the map contains the given key, or false if it doesn't.

### `.hasAll(i:Iterable<K>)` O(k * log n)

Returns true if the map contains every key produced by the given iterable,
or false if it doesn't.

### `.hear(f:(event:DSEvent<Pair<K,V>>))` O(1)

Adds a listener to the map. Any time the map changes (and _only_ when
the map actually changes), the listener function will be called.

Returns a number that can be sent to `unhear` to stop receiving events.

### `.keys()` O(1)

Returns an iterable iterator over the keys in the map.

### `.range(start:K, end:K, include?:Include)` O(1)

Returns an iterable iterator over a range of keys in the map. The 
iterator will produce key/value pairs.

The optional third parameter specifies whether the range is inclusive
or exclusive, and must be one of the following four constants:

1. `IN_EX`: Start is inclusive, end is exclusive. This is the default.
2. `IN_IN`: Both start and end are inclusive.
3. `EX_IN`: Start is exclusive, end is inclusive.
4. `EX_EX`: Both start and end are exclusive.

### `.rank(k:K)` O(log n)

Returns the index of the given key in the map's sort order, or
`undefined` if the key is not in the map.

### `.replace(pairs:Pairs<K,V>)` O(k * log n)

Replaces the content of this map with new key/value pairs.

The provided pairs can be in one of the three forms accepted by
`TMap`'s constructor (objects with key and value fields, tuples of
keys and values, or, for string keys, a JavaScript object.)

### `.reversed()` O(1)

Returns an iterable iterator over the pairs in the map, in reverse
sort order.

### `.set(key:K, value:V)` O(log n)

Adds a pair to the map.

If the map uses unique keys and the key already exists in the map,
then `set` will replace the value for that key and return the old key.

Otherwise, `set` will add a new pair to the map and return `undefined`.

### `.setAll(pairs:Pairs<K,V>)` O(k * log n)

Adds many pairs to the map. Returns the number of pairs that were newly
added. (The number returned does not include any keys that were 
already in a unique map.)

The provided pairs can be in one of the three forms accepted by
`TMap`'s constructor (objects with key and value fields, tuples of
keys and values, or, for string keys, a JavaScript object.)

### `.unhear(n:number)` O(1)

Removes the listener registered with the specified number.

### `.values()` O(1)

Returns an iterable iterator over the values in the map.

## Operations by Kind

### Listeners

* `hear(eventHandler)` to get events when the map changes
* `unhear(n)` to stop listening for changes

### Iterators

* `TMap` itself is an iterable, so you can use it directly in `for...of`
* `i` to get an iterator 
* `keys()` if you just want the keys
* `range(start,end,include)` for partial iteration
* `reversed()` to iterate backwards
* `values()` if you just want the values

### Keys

* `get(key)` to get the value for a key
* `has(key)` to determine if the key exists
* `hasAll(iterable)` to determin if all the keys exist
* `only` to get the only pair

### Ordering

* `get compare` for the sort function

* `first` to get the first pair
* `last` to get the last pair

* `after(key)` to get the pair > key
* `before(key)` to get the pair < key
* `from(key)` to get the pair >= key
* `to(key)` to get the pair <= key

### Indices

* `at(index)` to get the key at an index
* `rank(key)` to get the index of a key
* `size` to get the number of pairs

### Adding/Changing

* `set compare` to re-sort the map
* `set(key,value)` add a pair to the map
* `setAll(pairs)` add many pairs to the map
* `replace(pairs)` clear the map then add many pairs

### Deleting

* `clear()` delete everything
* `delete(key)` delete a specific key
* `deleteAll(iterable)` delete many keys
* `drop(predicate)` delete pairs that match a predicate
