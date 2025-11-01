# dubc-ds-test

Utility for testing observable data structures.

```bash
$ npm install -D dubc-ds-test
```

In your tests, you can use the `capture` function to quickly test
that your data structure is emitting the correct events.

The `capture` function takes two arguments, a keeper object for the
listener and the data structure you want to capture. The data
structure must be a subclass of the `Base` class from `dubc-ds-base`.

The `capture` function assigns a listener to the data structure that
simply records the events it fires. The iterables for `event.added.items`
and `event.deleted.items` are turned into arrays, so you can simply
use `toStrictEqual` to ensure the captured events are expected.

The `capture` function returns an object with three methods:

* `only`: This throws an error if there isn't exactly one recorded event.
Otherwise it returns the one event and clears the recorded list.
* `all`: This returns an array of all of the recorded events and clears
the recorded events.
* `clear`: This clears the recorded events without returning anything.

Example usage:

```TypeScript
import { capture } from "dubc-ds-test"

const K = {} // keeper object

let ds = new MyDS()
let c = capture(K, ds)
beforeEach(() => {
  ds = new MyDS([1, 2, 3, 4, 5])
  c = capture(K, ds)
  // eliminate the initial fire, which generally isn't interesting:
  c.clear()
})
test("clear", () => {
  ds.clear()
  expect(c.only()).toStrictEqual({cleared:5})
})
test("add", () => {
  ds.add(6)
  expect(c.only()).toStrictEqual({added:{items:[6], at:5}})
})
```

