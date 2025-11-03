import { test, expect, describe, beforeEach } from "vitest"
import { TSet, Conf } from "./index"
import { capture } from "dubc-ds-test"

const K = {}

const compare = (k1:string,k2:string) => k1.localeCompare(k2)

let tree = TSet.of<string>(compare, "1", "2", "3")
let c = capture(K, tree)

beforeEach(() => {
  tree = TSet.of<string>(compare, "2", "3", "1")
  c = capture(K, tree)
  expect(c.only()).toStrictEqual({
    added:{items:["1", "2", "3"], at:0}
  })
})

describe("add", () => {
  test("existing element", () => {
    expect(tree.add("1")).toStrictEqual(false)
    expect([...tree]).toStrictEqual(["1", "2", "3"])
    expect(tree.size).toStrictEqual(3)
    expect(c.all()).toStrictEqual([])
  })
  test("adding new element", () => {
    expect(tree.add("X")).toStrictEqual(true)
    expect([...tree]).toStrictEqual(["1", "2", "3", "X"])
    expect(tree.size).toStrictEqual(4)
    expect(c.only()).toStrictEqual({
      added:{items:["X"], at:3}
    })
  })
})

test("addAll", () => {
  expect(tree.addAll(["1", "", "X"])).toStrictEqual(2)
  expect(tree.size).toStrictEqual(5)
  expect([...tree]).toStrictEqual(["", "1", "2", "3", "X"])
  expect(c.all()).toStrictEqual([
    {added:{items:[""], at:0}},
    {added:{items:["X"], at:4}},
  ])
})

test("after", () => {
  expect(tree.after("1")).toStrictEqual("2")
  expect(tree.after("3")).toBeUndefined()
})

test("at", () => {
  expect(tree.at(0)).toBe("1")
  expect(tree.at(1)).toBe("2")
  expect(tree.at(2)).toBe("3")
  expect(() => tree.at(4)).toThrowError()
})

test("before", () => {
  expect(tree.before("3")).toStrictEqual("2")
  expect(tree.before("")).toBeUndefined()
})

test("clear", () => {
  tree.clear()
  expect(tree.size).toStrictEqual(0)
  expect([...tree]).toStrictEqual([])
  expect(c.only()).toStrictEqual({cleared:3})
})

test("delete", () => {
  expect(tree.delete("X")).toStrictEqual(false)
  expect(tree.delete("2")).toStrictEqual(true)
  expect([...tree]).toStrictEqual(["1", "3"])
  expect(c.only()).toStrictEqual({
    deleted:{items:["2"], at:1}
  })
})

test("deleteAll", () => {
  expect(tree.deleteAll(["1", "2"])).toStrictEqual(2)
  expect(c.all()).toStrictEqual([
    {deleted:{items:["1"], at:0}},
    {deleted:{items:["2"], at:0}},
  ])
})

test("drop", () => {
  tree.drop(s => s === "X")
  expect(c.all()).toStrictEqual([])
  tree.drop(s => s === "2")
  expect(c.only()).toStrictEqual({
    deleted:{items:["2"], at:1}
  })
})

test("first", () => {
  expect(tree.first).toStrictEqual("1")
})

test("from", () => {
  expect(tree.from("1")).toStrictEqual("1")
  expect(tree.from("X")).toBeUndefined()
})

test("has", () => {
  expect(tree.has("1")).toStrictEqual(true)
  expect(tree.has("X")).toStrictEqual(false)
})

test("hasAll", () => {
  expect(tree.hasAll(["3", "1", "2"])).toStrictEqual(true)
  expect(tree.hasAll(["3", "1", "2", "X"])).toStrictEqual(false)
})

test("iterator", () => {
  expect([...tree]).toStrictEqual(["1", "2", "3"])
  expect([...tree]).toStrictEqual(["1", "2", "3"])
})

test("last", () => {
  expect(tree.last).toStrictEqual("3")
})

test("only", () => {
  expect(() => tree.only).toThrowError()
  tree = new TSet(["1"], {compare})
  expect(tree.only).toStrictEqual("1")
})

test("range", () => {
  expect([...tree.range("1", "3")]).toStrictEqual(["1", "2"])
})

test("rank", () => {
  expect(tree.rank("1")).toBe(0)
  expect(tree.rank("2")).toBe(1)
  expect(tree.rank("3")).toBe(2)
})

test("replace", () => {
  tree.replace(["", "X"])
  expect(tree.size).toStrictEqual(2)
  expect([...tree]).toStrictEqual(["", "X"])
  expect(c.only()).toStrictEqual({
    cleared:3,
    added:{items:["", "X"], at:0}
  })
})

test("reversed", () => {
  expect([...tree.reversed()]).toStrictEqual(["3", "2", "1"])
})

test("size", () => {
  expect(tree.size).toStrictEqual(3)
})

test("to", () => {
  expect(tree.to("3")).toStrictEqual("3")
  expect(tree.to("")).toBeUndefined()
})

test("toEmpty", () => {
  tree.compare = (a,b) => b.localeCompare(a)
  expect(tree.toEmpty().compare).toBe(compare)
})