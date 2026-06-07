# dubc-client-hydrate

Augments an `HTMLElement` subclass to make it hydratable by a
server for SSR.

Example usage:

```TypeScript
import { Hydrate } from "dubc-client-hydrate"

interface State {
  message: string
}

class MyElement extends Hydrate<State>(HTMLElement) {
  override serialize() { return this.#state }
  override deserialize(state:State) { this.state = #state }
}
customElements.define("my-element", MyElement)
```

To determine whether an element can be hydrated, a server can use
the `hydratable` type assertion:

```TypeScript
import { hydratable } from "dubc-client-hydrate"

const yes = new MyElement()
console.log(hydratable(yes)) // true
const no = document.createElement("p")
console.log(hydratable(no)) // false
```