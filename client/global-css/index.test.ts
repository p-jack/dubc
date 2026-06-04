import { test, expect, describe } from "vitest"
import { getCSS, setCSS } from "./index"

test("empty by default", () => {
  const css = getCSS()
  expect(css.cssRules.length).toBe(0)
})

test("get/set", () => {
  const css1 = new CSSStyleSheet()
  css1.replaceSync("div { width:100% }")
  setCSS(css1)
  const css2 = getCSS()
  expect(css2 === css1).toBe(true)
  expect(css2.cssRules.length).toBe(1)
  expect(css2.cssRules.item(0)!.cssText).toBe("div { width: 100%; }")
})