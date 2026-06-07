import { test, expect, describe } from "vitest"
import { Hydrate, hydratable } from "./index"

interface State {
  s:string
  n:number
}

class C extends Hydrate(HTMLElement) {

  constructor(public s?:string, public n?:number) {
    super()
  }

  serialize() {
    return { s:"1", n:2 }
  }

  deserialize(state:State) {
    this.s = state.s
    this.n = state.n
  }

}
customElements.define("dubc-hydrate-c", C)

test("Hydrate", () => {
  const c = new C("1", 2)
  const state = c.serialize()
  expect(state.s).toBe("1")
  expect(state.n).toBe(2)
  c.deserialize({s:"11", n:22})
  expect(c.s).toBe("11")
  expect(c.n).toBe(22)
  expect(hydratable(c)).toBe(true)
})

test("hydratable", () => {
  const c = new C("1", 2)
  expect(hydratable(c)).toBe(true)
  const p = document.createElement("p")
  expect(hydratable(p)).toBe(false)
})

class Bad extends Hydrate(HTMLElement) {}
customElements.define("dubc-hydrate-bad", Bad)

test("default behavior", () => {
  const bad = new Bad()
  expect(() => bad.serialize()).toThrow("unimplemented")
  expect(() => bad.deserialize({})).toThrow("unimplemented")
})