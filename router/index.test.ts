import { test, expect, describe, afterEach, beforeEach } from "vitest"
import { IPage, Page, Route, Rule, page, routeTo, router, rule, stop } from "./index"

let oldError = console.error
let captured:any[][] = []
let bad = false

beforeEach(() => {
  console.error = (...args:any[]) => captured.push(args)
})

afterEach(() => {
  stop()
  document.body.replaceChildren()
  console.error = oldError
  captured = []
  bad = false
})


class P1 extends Page(HTMLElement) {

  #reloads = 0

  constructor() {
    super()
    if (bad) throw new Error("bad")
  }

  override async reload() {
    this.#reloads++
    this.setAttribute("data-reloads", String(this.#reloads))
  }
}
customElements.define("dubc-router-p1", P1)

class P2 extends Page(HTMLElement) {}
customElements.define("dubc-router-p2", P2)

class P404 extends Page(HTMLElement) {}
customElements.define("dubc-router-p404", P404)
const p404 = async () => {return {pageClass:P404}}

const rules:Rule[] = [
  rule("/p1", async () => {return { pageClass:P1 }}),
  rule(path => path === "/p2", async () => {return {pageClass:P2}}),
]

function show(page:IPage) {
  document.body.replaceChildren(page)
  console.log("GNORD SHOWED", document.body.children.item(0)?.tagName)
}

test("page", () => {
  const x = new P1()
  expect(page(x)).toStrictEqual(true)
  const div = document.createElement("div")
  expect(page(div)).toStrictEqual(false)
})

describe("rule", () => {
  const provider = async () => { return { pageClass:P2 } }
  test("string path", () => {
    const r = rule("/foo", provider)
    const search = new URLSearchParams()
    expect(r.appliesTo("/foo", {})).toStrictEqual(true)
    expect(r.appliesTo("/bar", {})).toStrictEqual(false)
  })
  test("custom function", () => {
    const r = rule((path, search) => search["bar"] === "baz", provider)
    expect(r.appliesTo("/", {"bar":"baz"})).toStrictEqual(true)
    expect(r.appliesTo("/", {"bar":"fubar"})).toStrictEqual(false)
  })
})

describe("router", () => {
  test("only one", async () => {
    await router({rules, show, p404})
    try {
      await router({rules, show, p404})
      expect(true).toBe(false)
    } catch (e) {
      expect(e.message).toStrictEqual("router already active")
    }
  })
  test("immediately shows the current route", async () => {
    await router({rules, show, p404})
    expect(kid()?.tagName).toStrictEqual("DUBC-ROUTER-P404")
    expect(history.length).toStrictEqual(1)
  })
  test("routing", async () => {
    history.pushState(null, "", "/p1")
    await router({rules, show, p404})
    expect(kid()?.tagName).toStrictEqual("DUBC-ROUTER-P1")
    expect(history.length).toStrictEqual(2)
    await routeTo("/p2")
    expect(kid()?.tagName).toStrictEqual("DUBC-ROUTER-P2")
    expect(history.length).toStrictEqual(3)
    history.back()
    await new Promise(r => setTimeout(r, 1))
    expect(kid()?.tagName).toStrictEqual("DUBC-ROUTER-P1")
    expect(history.length).toStrictEqual(3)
    history.forward()
    await new Promise(r => setTimeout(r, 1))
    expect(kid()?.tagName).toStrictEqual("DUBC-ROUTER-P2")
    expect(history.length).toStrictEqual(3)
    bad = true
    history.back()
    await new Promise(r => setTimeout(r, 1))
    expect(captured.map(x => String(x))).toStrictEqual(["error routing,Error: bad"])
  })
  test("nop if no router", async () => {
    history.pushState(null, "", "/p1")
    expect(kid()).toBeNull()
    history.back()
    expect(kid()).toBeNull()
    try {
      await routeTo("/p2")
      expect(true).toBe(false)
    } catch (e) {
      expect(e.message).toStrictEqual("no active router")
    }
  })
  test("reload", async () => {
    history.pushState(null, "", "/p1")
    await router({rules, show, p404})
    expect(kid()?.tagName).toStrictEqual("DUBC-ROUTER-P1")
    await routeTo("/p1", {foo:"bar"})
    expect(kid()?.getAttribute("data-reloads")).toStrictEqual("1")
    history.back()
    await new Promise(r => setTimeout(r, 1))
    expect(kid()?.getAttribute("data-reloads")).toStrictEqual("2")
  })
  describe("massage", () => {
    test("promise", async () => {
      const massage = async (r:Route) => {
        return P404
      }
      history.pushState(null, "", "/p1")
      await router({rules, show, p404, massage})
      expect(document.body.children.item(0)?.tagName).toStrictEqual("DUBC-ROUTER-P404")
    })
  })



})

function kid() {
  return document.body.children.item(0)
}