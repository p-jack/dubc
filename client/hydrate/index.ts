const sym = Symbol("Hydrate")

/** A custom element that can be hydrated by a server for SSR. */
export interface Hydratable<S extends object> extends HTMLElement {
  /** Serializes this element's internal state to a JSON object. */
  serialize():S
  /** Sets this element's internal state to the given state. */
  deserialize(state:S):void
}

/** Extends the given class to make its instances Hydratable. */
export function Hydrate<S extends object,T extends HTMLElement>(cls:new()=>T):new()=>T&Hydratable<S> {
  // @ts-ignore
  return class extends cls {
    /* v8 ignore next */
    static get [sym]() { return true }
    serialize():S { throw new Error("unimplemented") }
    deserialize(_:S) { throw new Error("unimplemented") }
  } as unknown as new()=>T&Hydratable<S>
}

/** Returns true if the given element is Hydratable. */
export function hydratable(el:HTMLElement):el is Hydratable<object> {
  return sym in el.constructor
}