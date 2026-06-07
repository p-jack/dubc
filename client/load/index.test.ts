import { test, expect, describe, beforeEach, afterEach } from "vitest"
import { Load, loadable, onLoad, reset } from "./index"

class C extends Load(HTMLElement) {

  constructor() {
    super()
    const sh = this.attachShadow({mode:"open"})
    const p = document.createElement("p")
    p.textContent = "loading..."
    sh.append(p)
    this.triggerLoad()
  }

  override async load() {
    await new Promise(r => setTimeout(r, 100))
    const p = document.createElement("p")
    p.textContent = "loaded!"
    this.shadowRoot!.replaceChildren(p)
  }
}
customElements.define("dubc-client-load-c", C)

class Bad extends Load(HTMLElement) {}
customElements.define("dubc-client-load-bad", Bad)

test("Load", async () => {
  const c = new C()
  expect(c.loading).not.toBeUndefined()
  await c.loading
  const p = c.shadowRoot!.querySelector("p")
  expect(p).not.toBeNull()
  expect(p!.textContent).toBe("loaded!")
})

test("loadable", () => {
  const c = new C()
  expect(loadable(c)).toBe(true)
  const p = document.createElement("p")
  expect(loadable(p)).toBe(false)
})

describe("onLoad", () => {
  let old = console.error
  let error = ""
  beforeEach(() => {
    error = ""
    console.error = (...args:any) => {
      error = args.map(x => String(x)).join("|")
    }
  })
  afterEach(() => {
    console.error = old
    reset()
  })
  test("logs error by default", async () => {
    const bad = new Bad()
    bad.triggerLoad()
    try {
      await bad.loading
      expect(false).toBe(true)
    } catch (e) {
      expect(e.message).toBe("unimplemented")
    }
    expect(error).toBe("Bad.load() error:|Error: unimplemented")
  })
  test("custom callback", async () => {
    let captured:HTMLElement = document.createElement("p")
    onLoad((el:HTMLElement) => {
      captured = el
    })
    const bad = new Bad()
    bad.triggerLoad()
    try {
      await bad.loading
      expect(false).toBe(true)
    } catch (e) {
      expect(e.message).toBe("unimplemented")
      expect(error).toBe("")
      expect(captured === bad).toBe(true)
    }
  })
})