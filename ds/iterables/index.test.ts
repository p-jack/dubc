import { test, expect, describe, beforeEach } from "vitest"
import { filter, first, has, last, map, only, reduce } from "./index"

test("filter", () => {
  const i = filter([1, 2, 3, 4, 5, 6], x => x % 2 === 0)
  expect([...i]).toStrictEqual([2, 4, 6])
  expect([...i]).toStrictEqual([2, 4, 6])
})

test("first", () => {
  expect(first([1, 2, 3])).toStrictEqual(1)
  expect(first([])).toBeUndefined()
})

test("has", () => {
  const a = [1, 2, 3]
  for (const x of a) expect(has(a, x)).toStrictEqual(true)
  expect(has(a, 0)).toStrictEqual(false)
  expect(has(a, 4)).toStrictEqual(false)
})

test("last", () => {
  expect(last([1, 2, 3])).toStrictEqual(3)
  expect(last([])).toBeUndefined()
  expect(last(new Set([1, 2, 3]))).toStrictEqual(3)
  expect(last(new Set())).toBeUndefined()
})

test("map", () => {
  const i = map([1, 2, 3], x => String(x))
  expect([...i]).toStrictEqual(["1", "2", "3"])
  expect([...i]).toStrictEqual(["1", "2", "3"])
})

test("only", () => {
  expect(only([100])).toStrictEqual(100)
  expect(() => only([])).toThrow("no elements")
  expect(() => only([100, 200])).toThrow("more than one element")
})

test("reduce", () => {
  const sum = reduce([1, 2, 3, 4], 0, (a,x) => a + x)
  expect(sum).toStrictEqual(10)
})