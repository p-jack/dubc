import { beforeEach, expect, test } from "vitest"
import { capture } from "dubc-ds-test"
import { NSet } from "./index"

const K = {}

let set = NSet.of<string>()
let c = capture(K, set)
beforeEach(() => {
  set = NSet.of<string>()
  c = capture(K, set)
  c.clear()
})

function addDummyData() {
  set.addAll(["1", "2", "3"])
  c.clear()
}

test("add", () => {
  expect(set.add("1")).toStrictEqual(true)
  expect(c.only()).toStrictEqual({added:{items:["1"], at:0}})
  expect(set.size).toStrictEqual(1)
  expect([...set]).toStrictEqual(["1"])
  
  expect(set.add("1")).toStrictEqual(false)
  expect(c.all()).toStrictEqual([])
  expect(set.size).toStrictEqual(1)
  expect([...set]).toStrictEqual(["1"])

  expect(set.add("2")).toStrictEqual(true)
  expect(c.only()).toStrictEqual({added:{items:["2"], at:1}})
  expect(set.size).toStrictEqual(2)
  expect([...set]).toStrictEqual(["1", "2"])
})

test("addAll", () => {
  expect(set.addAll(["1", "2", "3"])).toStrictEqual(true)
  expect(c.all()).toStrictEqual([
    {added:{items:["1"], at:0}},
    {added:{items:["2"], at:1}},
    {added:{items:["3"], at:2}},
  ])
  expect(set.size).toStrictEqual(3)
  expect([...set]).toStrictEqual(["1", "2", "3"])

  expect(set.addAll(["1", "2", "3"])).toStrictEqual(false)
  expect(c.all()).toStrictEqual([])
  expect(set.size).toStrictEqual(3)
  expect([...set]).toStrictEqual(["1", "2", "3"])

  expect(set.addAll(["1", "A", "2", "B", "3"])).toStrictEqual(true)
  expect(c.all()).toStrictEqual([
    {added:{items:["A"], at:3}},
    {added:{items:["B"], at:4}},
  ])
  expect(set.size).toStrictEqual(5)
  expect([...set]).toStrictEqual(["1", "2", "3", "A", "B"])
})

test("clear", () => {
  addDummyData()

  expect(set.clear()).toStrictEqual(true)
  expect(c.only()).toStrictEqual({cleared:3})
  expect(set.size).toStrictEqual(0)
  expect([...set]).toStrictEqual([])

  expect(set.clear()).toStrictEqual(false)
  expect(c.all()).toStrictEqual([])
  expect(set.size).toStrictEqual(0)
  expect([...set]).toStrictEqual([])  
})

test("delete", () => {
  addDummyData()

  expect(set.delete("2")).toStrictEqual(true)
  expect(c.only()).toStrictEqual({deleted:{items:["2"]}})
  expect(set.size).toStrictEqual(2)
  expect([...set]).toStrictEqual(["1", "3"])

  expect(set.delete("2")).toStrictEqual(false)
  expect(c.all()).toStrictEqual([])
  expect(set.size).toStrictEqual(2)
  expect([...set]).toStrictEqual(["1", "3"])

  expect(set.delete("3")).toStrictEqual(true)
  expect(c.only()).toStrictEqual({deleted:{items:["3"]}})
  expect(set.size).toStrictEqual(1)
  expect([...set]).toStrictEqual(["1"])
})

test("deleteAll", () => {
  addDummyData()
  
  expect(set.deleteAll(["2", "3"])).toStrictEqual(true)
  expect(c.all()).toStrictEqual([
    {deleted:{items:["2"]}},
    {deleted:{items:["3"]}},
  ])
  expect(set.size).toStrictEqual(1)
  expect([...set]).toStrictEqual(["1"])

  expect(set.deleteAll(["2", "3"])).toStrictEqual(false)
  expect(c.all()).toStrictEqual([])
  expect(set.size).toStrictEqual(1)
  expect([...set]).toStrictEqual(["1"])

  expect(set.deleteAll(["1", "2", "3"])).toStrictEqual(true)
  expect(c.only()).toStrictEqual({deleted:{items:["1"]}})
  expect(set.size).toStrictEqual(0)
  expect([...set]).toStrictEqual([])
})

test("drop", () => {
  addDummyData()

  expect(set.drop(x => x === "2" || x === "3")).toStrictEqual(2)
  expect(c.all()).toStrictEqual([
    {deleted:{items:["2"], at:1}},
    {deleted:{items:["3"], at:2}},
  ])
  expect(set.size).toStrictEqual(1)
  expect([...set]).toStrictEqual(["1"])

  expect(set.drop(x => x === "2" || x === "3")).toStrictEqual(0)
  expect(c.all()).toStrictEqual([])
  expect(set.size).toStrictEqual(1)
  expect([...set]).toStrictEqual(["1"])

  expect(set.drop(x => x === "1")).toStrictEqual(1)
  expect(c.only()).toStrictEqual({deleted:{items:["1"], at:0}})
  expect(set.size).toStrictEqual(0)
  expect([...set]).toStrictEqual([])
})

test("has", () => {
  addDummyData()
  expect(set.has("1")).toStrictEqual(true)
  expect(set.has("2")).toStrictEqual(true)
  expect(set.has("3")).toStrictEqual(true)
  expect(set.has("Z")).toStrictEqual(false)
})

test("hasAll", () => {
  addDummyData()
  expect(set.hasAll(["1"])).toStrictEqual(true)
  expect(set.hasAll(["2"])).toStrictEqual(true)
  expect(set.hasAll(["3"])).toStrictEqual(true)
  expect(set.hasAll(["1", "2"])).toStrictEqual(true)
  expect(set.hasAll(["1", "3"])).toStrictEqual(true)
  expect(set.hasAll(["2", "1"])).toStrictEqual(true)
  expect(set.hasAll(["2", "3"])).toStrictEqual(true)
  expect(set.hasAll(["3", "1"])).toStrictEqual(true)
  expect(set.hasAll(["3", "2"])).toStrictEqual(true)
  expect(set.hasAll(["1", "2", "3"])).toStrictEqual(true)
  expect(set.hasAll(["1", "3", "2"])).toStrictEqual(true)
  expect(set.hasAll(["2", "1", "3"])).toStrictEqual(true)
  expect(set.hasAll(["2", "3", "1"])).toStrictEqual(true)
  expect(set.hasAll(["3", "1", "2"])).toStrictEqual(true)
  expect(set.hasAll(["3", "2", "1"])).toStrictEqual(true)
  expect(set.hasAll(["Z"])).toStrictEqual(false)
  expect(set.hasAll(["1", "2", "3", "Z"])).toStrictEqual(false)
})

test("replace", () => {
  set.replace(["1", "2", "3"])
  expect(c.only()).toStrictEqual({added:{items:["1", "2", "3"], at:0}})
  expect(set.size).toStrictEqual(3)
  expect([...set]).toStrictEqual(["1", "2", "3"])

  set.replace(["A", "B"])
  expect(c.only()).toStrictEqual({cleared:3, added:{items:["A", "B"], at:0}})
  expect(set.size).toStrictEqual(2)
  expect([...set]).toStrictEqual(["A", "B"])
})

test("toEmpty", () => {
  addDummyData()
  const empty = set.toEmpty()
  expect(empty.size).toStrictEqual(0)
  expect([...empty]).toStrictEqual([])
})