# dubc-ds-base

Provides the base class for observable data structures.

## DSEvent

The data structures provided by `dubc-ds` are _observable_, meaning they
can broadcast changes made to them to interested parties. Such changes
are represented by the `DSEvent` interface, which consists of three fields:

* `cleared`: If the entire data structure is emptied of elements, this field
is set to the number of items in the data structure that were cleared. In that case, `removed` will not be present. This field will contain the number 0
when you add a listener to a data structure that's empty.
* `removed`: An iterable of elements that were removed, as well as the
index they were removed from (if the data structure is indexed.)
* `added`: An iterable of elements that were added, as well as the index
they were added at (if the data structure is indexed.) If you add th

It is possible for both `removed` and `added` to be present in the same
event. In that case, a listener should process the `removed` iterable
first, and then process the `added` iterable.

It's also possible for both `cleared` and `added` to be present in the
same event. That occurs during bulk operations that necessarily alter
the entire data structure, such as sorting an array.

## Implementing an Observable Data Structure

Here's a simple example of an observable data structure that's just
a thin wrapper around the native `Set` class:

```TypeScript
import { Base } from "dubc-ds-base"

export class MySet extends Base {

  private set = new Set<number>()

  get size() {
    // We just return the native set's size.
    return this.set.size
  }

  [Symbol.iterator]() {
    // We can also just use the native set's iterators.
    return this.set[Symbol.iterator]()
  }

  add(n:number) {
    // An observable data structure should NEVER fire
    // an event if the data structure didn't actually change.
    if (this.set.has(n)) return
    // Make the change.
    this.set.add(n)
    // Fire the event to notify observers about the change.
    // Since we know the native set will append the new element
    // to the end of the iteration order, we can set the `at`
    // field of the event.
    this.fire({added:{items:[n], at:set.size - 1}})
  }

  delete(n:number) {
    // Again, NEVER fire an event if we didn't change anything.
    if (!this.set.has(n)) return
    // Make the change.
    this.set.delete(n)
    // Fire the event. Note that we don't set the `at` field here,
    // because we don't know it. That's OK!
    this.fire({removed:{items:[n]}})
  }

  clear() {
    // Yet again, NEVER fire an event if there's no actual change.
    const sz = this.set.size
    if (sz === 0) return
    // Make the change.
    this.set.clear()
    // Fire the event.
    this.fire({cleared:sz})
  }
}
```

The rule-of-thumb is that if you _can_ set the `at` field in an event,
then you _should_ set the `at` field for that event.