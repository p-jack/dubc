import { test, expect, describe, beforeEach } from "vitest"
import { Deque } from "./index"
import { capture } from "dubc-ds-test"

const K = {}

let deque = Deque.of("1", "2", "3")
let empty = deque.toEmpty()
let c = capture(K, deque)
let emptyC = c

beforeEach(() => {
  deque = Deque.of("1", "2", "3")
  empty = deque.toEmpty()
  c = capture(K, deque)
  emptyC = capture(K, empty)
  expect(c.only()).toStrictEqual({
    added:{items:["1", "2", "3"], at:0}
  })
  expect(emptyC.only()).toStrictEqual({cleared:0})
})

describe("clear", () => {
  test("empty", () => {
    expect(empty.clear()).toStrictEqual(false)
    expect(emptyC.all().length).toStrictEqual(0)
    expect(empty.size).toBe(0)
    expect([...empty]).toStrictEqual([])
    expect([...empty.reversed()]).toStrictEqual([])
  })
  test("non-empty", () => {
    expect(deque.clear()).toStrictEqual(true)
    expect(c.only()).toStrictEqual({cleared:3})
    expect(deque.size).toStrictEqual(0)
    expect([...deque]).toStrictEqual([])
    expect([...deque.reversed()]).toStrictEqual([])  
  })
})

test("drop", () => {
  deque.push("4")
  deque.push("5")
  c.clear()
  expect(deque.drop(x => x === "1" || x === "3" || x === "5")).toStrictEqual(true)
  expect(c.all()).toStrictEqual([
    {deleted:{items:["1"], at:0}},
    {deleted:{items:["3"], at:1}},
    {deleted:{items:["5"], at:2}},
  ])
  expect(deque.size).toStrictEqual(2)
  expect([...deque]).toStrictEqual(["2", "4"])
  expect([...deque.reversed()]).toStrictEqual(["4", "2"])
})

test("first", () => {
  expect(deque.first).toStrictEqual("1")
  expect(empty.first).toBeUndefined()
})

test("last", () => {
  expect(deque.last).toStrictEqual("3")
  expect(empty.last).toBeUndefined()
})

test("only", () => {
  expect(() => deque.only).toThrowError()
  expect(() => empty.only).toThrowError()
  const d = Deque.of("A")
  expect(d.only).toStrictEqual("A")
})

test("pop", () => {
  expect(deque.pop()).toStrictEqual("3")
  expect(c.only()).toStrictEqual({deleted:{items:["3"], at:2}})
  expect(deque.size).toStrictEqual(2)
  expect([...deque]).toStrictEqual(["1", "2"])
  expect([...deque.reversed()]).toStrictEqual(["2", "1"])

  expect(deque.pop()).toStrictEqual("2")
  expect(c.only()).toStrictEqual({deleted:{items:["2"], at:1}})
  expect(deque.size).toStrictEqual(1)
  expect([...deque]).toStrictEqual(["1"])
  expect([...deque.reversed()]).toStrictEqual(["1"])

  expect(deque.pop()).toStrictEqual("1")
  expect(c.only()).toStrictEqual({deleted:{items:["1"], at:0}})
  expect(deque.size).toStrictEqual(0)
  expect([...deque]).toStrictEqual([])
  expect([...deque.reversed()]).toStrictEqual([])

  expect(deque.pop()).toBeUndefined()
  expect(c.all()).toStrictEqual([])
  expect(deque.size).toStrictEqual(0)
  expect([...deque]).toStrictEqual([])
  expect([...deque.reversed()]).toStrictEqual([])
})

test("push", () => {
  empty.push("A")
  expect(emptyC.only()).toStrictEqual({added:{items:["A"], at:0}})
  expect(empty.size).toStrictEqual(1)
  expect([...empty]).toStrictEqual(["A"])
  expect([...empty.reversed()]).toStrictEqual(["A"])

  deque.push("4")
  expect(c.only()).toStrictEqual({added:{items:["4"], at:3}})
  expect(deque.size).toStrictEqual(4)
  expect([...deque]).toStrictEqual(["1", "2", "3", "4"])
  expect([...deque.reversed()]).toStrictEqual(["4", "3", "2", "1"])
})

describe("replace", () => {
  test("empty with empty", () => {
    expect(empty.replace([])).toStrictEqual(false)
    expect(emptyC.all().length).toStrictEqual(0)
    expect(empty.size).toStrictEqual(0)
    expect([...empty]).toStrictEqual([])
    expect([...empty.reversed()]).toStrictEqual([])
  })
  test("empty with non-empty", () => {
    expect(empty.replace(["11", "22"])).toStrictEqual(true)
    expect(emptyC.only()).toStrictEqual({added:{items:["11", "22"], at:0}})
    expect([...empty]).toStrictEqual(["11", "22"])
    expect([...empty.reversed()]).toStrictEqual(["22", "11"])
    expect(empty.size).toStrictEqual(2)
  })
  test("non-empty with empty", () => {
    expect(deque.replace([])).toStrictEqual(true)
    expect(c.only()).toStrictEqual({cleared:3})
    expect(deque.size).toStrictEqual(0)
    expect([...deque]).toStrictEqual([])
    expect([...deque.reversed()]).toStrictEqual([])
  })
  test("non-empty with non-empty", () => {
    expect(deque.replace(["A", "B", "C", "D"])).toStrictEqual(true)
    expect(c.only()).toStrictEqual({cleared:3, added:{items:["A", "B", "C", "D"], at:0}})
    expect(deque.size).toStrictEqual(4)
    expect([...deque]).toStrictEqual(["A", "B", "C", "D"])
    expect([...deque.reversed()]).toStrictEqual(["D", "C", "B", "A"])
  })
})

test("shift", () => {
  expect(deque.shift()).toStrictEqual("1")
  expect(c.only()).toStrictEqual({deleted:{items:["1"], at:0}})
  expect(deque.size).toStrictEqual(2)
  expect([...deque]).toStrictEqual(["2", "3"])
  expect([...deque.reversed()]).toStrictEqual(["3", "2"])

  expect(deque.shift()).toStrictEqual("2")
  expect(c.only()).toStrictEqual({deleted:{items:["2"], at:0}})
  expect(deque.size).toStrictEqual(1)
  expect([...deque]).toStrictEqual(["3"])
  expect([...deque.reversed()]).toStrictEqual(["3"])

  expect(deque.shift()).toStrictEqual("3")
  expect(c.only()).toStrictEqual({deleted:{items:["3"], at:0}})
  expect(deque.size).toStrictEqual(0)
  expect([...deque]).toStrictEqual([])
  expect([...deque.reversed()]).toStrictEqual([])

  expect(deque.shift()).toBeUndefined()
  expect(c.all()).toStrictEqual([])
  expect(deque.size).toStrictEqual(0)
  expect([...deque]).toStrictEqual([])
  expect([...deque.reversed()]).toStrictEqual([])
})

test("unshift", () => {
  empty.unshift("A")
  expect(emptyC.only()).toStrictEqual({added:{items:["A"], at:0}})
  expect(empty.size).toStrictEqual(1)
  expect([...empty]).toStrictEqual(["A"])
  expect([...empty.reversed()]).toStrictEqual(["A"])

  deque.unshift("0")
  expect(c.only()).toStrictEqual({added:{items:["0"], at:0}})
  expect(deque.size).toStrictEqual(4)
  expect([...deque]).toStrictEqual(["0", "1", "2", "3"])
  expect([...deque.reversed()]).toStrictEqual(["3", "2", "1", "0"])
})
