import { test, expect, describe } from "vitest"
import { QueryShadow, Result, queryable } from "./index"

function el(tag:keyof HTMLElementTagNameMap, id:string, text:string) {
  const r = document.createElement(tag)
  r.setAttribute("data-x", text)
  r.id = id
  return r
}

class C extends QueryShadow(HTMLElement) {

  constructor() {
    super()
    const sh = this.attachShadow({mode:"open"})
    sh.append(el("p", "p1", "A"))
    sh.append(el("p", "p2", "B"))
    sh.append(el("div", "div1", "A"))
  }

}
customElements.define("dubc-query-shadow-c", C)

class Bad extends QueryShadow(HTMLElement) {}
customElements.define("dubc-query-shadow-bad", Bad)


describe("all", () => {
  test("existing elements", () => {
    const c = new C()
    const all = c.all("p")
    expect(all.length).toBe(2)
    expect(all[0].getAttribute("data-x")).toBe("A")
    expect(all[1].getAttribute("data-x")).toBe("B")
  })
  test("no elements", () => {
    const c = new C()
    const all = c.all("h1")
    expect(all.length).toBe(0)
  })
  test("no shadow DOM", () => {
    const bad = new Bad()
    expect(() => bad.all("div")).toThrow("no shadow root to query")
  })
})

describe("byId", () => {
  test("no shadow DOM", () => {
    const bad = new Bad()
    expect(() => bad.byId("id1")).toThrow("no shadow root to query")
  })
  test("no match", () => {
    const c = new C()
    expect(() => c.byId("foo")).toThrow("no such ID: foo")
  })
  describe("as", () => {
    test("correct tag", () => {
      const c = new C()
      const r = c.byId("p2")
      const p = r.as("p")
      expect(p).toBeInstanceOf(HTMLParagraphElement)
      expect(p.getAttribute("data-x")).toBe("B")
    })
    test("incorrect tag", () => {
      const c = new C()
      const r = c.byId("p2")
      expect(() => r.as("div")).toThrow(`expected div but got p`)
    })
  })
  describe("cast", () => {
    test("correct class", () => {
      const c = new C()
      const r = c.byId("div1")
      const div = r.cast(HTMLDivElement)
      expect(div).toBeInstanceOf(HTMLDivElement)
      expect(div.getAttribute("data-x")).toBe("A")
    })
    test("incorrect class", () => {
      const c = new C()
      const r = c.byId("div1")
      expect(() => r.cast(HTMLPreElement)).toThrow(`expected HTMLPreElement but got HTMLDivElement`)
    })
  })
})

describe("only", () => {
  test("existing element", () => {
    const c = new C()
    const div = c.only("div")
    expect(div.getAttribute("data-x")).toBe("A")
  })
  test("no elements", () => {
    const c = new C()
    expect(() => c.only("h1")).toThrow("no such element: h1")
  })
  test("more than one element", () => {
    const c = new C()
    expect(() => c.only("p")).toThrow("more than one match: p")
  })
  test("no shadow DOM", () => {
    const bad = new Bad()
    expect(() => bad.only("div")).toThrow("no shadow root to query")
  })
})

describe("query", () => {
  test("no shadow DOM", () => {
    const bad = new Bad()
    expect(() => bad.query("div")).toThrow("no shadow root to query")
  })
  test("no match", () => {
    const c = new C()
    expect(() => c.query("h1")).toThrow("no match for selector: h1")
  })
  describe("as", () => {
    test("correct tag ", () => {
      const c = new C()
      const r = c.query(`[data-x="B"]`)
      const p = r.as("p")
      expect(p).toBeInstanceOf(HTMLParagraphElement)
      expect(p.getAttribute("data-x")).toBe("B")
    })
    test("incorrect tag", () => {
      const c = new C()
      const r = c.query(`[data-x="B"]`)
      expect(() => r.as("div")).toThrow(`expected div but got p`)
    })
  })
  describe("cast", () => {
    test("correct class", () => {
      const c = new C()
      const r = c.query("div")
      const div = r.cast(HTMLDivElement)
      expect(div).toBeInstanceOf(HTMLDivElement)
      expect(div.getAttribute("data-x")).toBe("A")
    })
    test("incorrect class", () => {
      const c = new C()
      const r = c.query("div")
      expect(() => r.cast(HTMLPreElement)).toThrow(`expected HTMLPreElement but got HTMLDivElement`)
    })
  })
})

describe("queryAll", () => {
  test("no shadow DOM", () => {
    const bad = new Bad()
    expect(() => bad.query("div")).toThrow("no shadow root to query")
  })
  test("tag", () => {
    const c = new C()
    const r = c.queryAll(`[data-x="A"]`)
    const p = r.tag("p")
    expect(p.length).toBe(1)
    expect(p[0].getAttribute("data-x")).toBe("A")
    const r2 = c.queryAll("h1")
    const p2 = r2.tag("p")
    expect(p2.length).toBe(0)
  })
  test("cls", () => {
    const c = new C()
    const r = c.queryAll(`[data-x="A"]`)
    const a = r.cls(HTMLDivElement)
    expect(a.length).toBe(1)
    expect(a[0].getAttribute("data-x")).toBe("A")
    const r2 = c.queryAll("p")
    const a2 = r2.cls(HTMLDivElement)
    expect(a2.length).toBe(0)
  })
})

test("extends custom class", () => {
  class C extends HTMLElement {
    get foo() { return "foo" }
  }
  class Q extends QueryShadow(C) {}
  customElements.define("dubc-query-shadow-q", Q)
  const q = new Q()
  expect(q.foo).toBe("foo")
  expect(queryable(q)).toBe(true)
})