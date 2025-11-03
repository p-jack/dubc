# dubc-ds-deque

An observable deque (doubly-linked list.)

## Constructor

```TypeScript
constructor()
```

Creates an empty deque. To pre-populate a deque, you can use the static
`of` method:

```TypeScript
import { Deque } from "dubc-ds-deque"

const d = Deque.of("1", "2", "3")
```

## Properties

### `.first` O(log n)

Returns the first value in the deque, or `undefined` if the deque
is empty.

### `.i` O(1)

Returns an iterator over the values in the deque.

### `.last` O(log n)

Returns the last value in the deque, or `undefined` if the deque
is empty.

### `.only` O(1)

Returns the only value in the deque. If the deque doesn't have
exactly one element, throws an `Error`.

### `.size` O(1)

Returns the number of values in the deque.

## Methods

### `.clear()` O(1)

Removes all values from the deque.

### `.hear(f:(event:DSEvent<T>))` O(1)

Adds a listener to the deque. Any time the deque changes (and _only_ when
the deque actually changes), the listener function will be called.

Returns a number that can be sent to `unhear` to stop receiving events.

### `.pop()`

Removes the last value from the deque and returns it.
Returns `undefined` if the deque is empty.

### `.push(value:T)` O(1)

Adds a value to the end of the deque.

### `.replace(i:Iterable<T>)` O(k)

Replaces the content of this deque with new values.

### `.reversed()` O(1)

Returns an iterable iterator over the values in the deque, in reverse
sort order.

### `.shift()` O(1)

Removes the first value from the deque and returns it.
Returns `undefined` if the deque is empty.

### `.unhear(n:number)` O(1)

Removes the listener registered with the specified number.

### `.unshift(v:T)` O(1)

Adds a value to the beginning of the deque.

## Operations by Kind

### Listeners

* `hear(eventHandler)` get events when the deque changes
* `unhear(n)` stop listening for changes

### Iterators

* `Deque` itself is an iterable, so you can use it directly in `for...of`
* `i` to get an iterator 
* `reversed()` to iterate backwards

### Values

* `first` get the first value
* `last` get the last value
* `only` get the only value
* `size` get the number of values

### Changing

* `pop` remove the last value
* `push` add a value to the end
* `shift` remove the first value
* `unshift` add a value to the beginning

### Bulk

* `clear` remove all values
* `replace(values)` clear the deque then add many values
