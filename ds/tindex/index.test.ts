import { test, expect, describe, beforeEach } from "vitest"
import { TIndex, Conf } from "./index"
import { capture } from "dubc-ds-test"

const K = {}

interface User {
  id:string
  email:string
}

const compare = (k1:string,k2:string) => k1.localeCompare(k2)

const conf:Conf<string,User> = { compare, index: x => x.id }

let tree = new TIndex([], conf)
let c = capture(K, tree)

const user1 = {id:"1", email:"a@z.z"}
const user2 = {id:"2", email:"b@z.z"}
const user3 = {id:"3", email:"c@z.z"}
const userX = {id:"X", email:"x@z.z"}
const blank = {id:"", email:""}

beforeEach(() => {
  tree = new TIndex([user2, user3, user1], conf)
  c = capture(K, tree)
  expect(c.only()).toStrictEqual({
    added:{items:[user1, user2, user3], at:0}
  })
})

describe("add", () => {
  test("existing element", () => {
    expect(tree.add(user1)).toStrictEqual(false)
    expect([...tree]).toStrictEqual([user1, user2, user3])
    expect(tree.size).toStrictEqual(3)
    expect(c.all()).toStrictEqual([])
  })
  test("changing existing element", () => {
    expect(tree.add(user1)).toStrictEqual(false)
    const u = {id:"1", email:"11@z.z"}
    expect(tree.add(u)).toStrictEqual(true)
    expect([...tree]).toStrictEqual([u, user2, user3])
    expect(tree.size).toStrictEqual(3)
    expect(c.only()).toStrictEqual({
      deleted:{items:[user1], at:0},
      added:{items:[u], at:0},
    })
  })
  test("adding new element", () => {
    expect(tree.add(userX)).toStrictEqual(true)
    expect([...tree]).toStrictEqual([user1, user2, user3, userX])
    expect(tree.size).toStrictEqual(4)
    expect(c.only()).toStrictEqual({
      added:{items:[userX], at:3}
    })
  })
})

test("addAll", () => {
  expect(tree.addAll([user1, blank, userX])).toStrictEqual(2)
  expect(tree.size).toStrictEqual(5)
  expect([...tree]).toStrictEqual([blank, user1, user2, user3, userX])
  expect(c.all()).toStrictEqual([
    {added:{items:[blank], at:0}},
    {added:{items:[userX], at:4}},
  ])
})

test("after", () => {
  expect(tree.after(user1)).toStrictEqual(user2)
  expect(tree.after(user3)).toBeUndefined()
})

test("at", () => {
  expect(tree.at(0)).toBe(user1)
  expect(tree.at(1)).toBe(user2)
  expect(tree.at(2)).toBe(user3)
  expect(() => tree.at(4)).toThrowError()
})

test("before", () => {
  expect(tree.before(user3)).toStrictEqual(user2)
  expect(tree.before(blank)).toBeUndefined()
})

test("clear", () => {
  tree.clear()
  expect(tree.size).toStrictEqual(0)
  expect([...tree]).toStrictEqual([])
  expect(c.only()).toStrictEqual({cleared:3})
})

test("delete", () => {
  expect(tree.delete(userX)).toStrictEqual(false)
  expect(tree.delete(user2)).toStrictEqual(true)
  expect([...tree]).toStrictEqual([user1, user3])
  expect(c.only()).toStrictEqual({
    deleted:{items:[user2], at:1}
  })
})

test("deleteAll", () => {
  expect(tree.deleteAll([user1, user2])).toStrictEqual(2)
  expect(c.all()).toStrictEqual([
    {deleted:{items:[user1], at:0}},
    {deleted:{items:[user2], at:0}},
  ])
})

test("drop", () => {
  tree.drop(u => u.id === "X")
  expect(c.all()).toStrictEqual([])
  tree.drop(u => u.id === "2")
  expect(c.only()).toStrictEqual({
    deleted:{items:[user2], at:1}
  })
})

test("first", () => {
  expect(tree.first).toStrictEqual(user1)
})

test("from", () => {
  expect(tree.from(user1)).toStrictEqual(user1)
  expect(tree.from(userX)).toBeUndefined()
})

test("get", () => {
  expect(tree.get("1")).toStrictEqual(user1)
  expect(tree.get("2")).toStrictEqual(user2)
  expect(tree.get("3")).toStrictEqual(user3)
  expect(tree.get("4")).toBeUndefined()
})

test("has", () => {
  expect(tree.has(user1)).toStrictEqual(true)
  expect(tree.has(userX)).toStrictEqual(false)
})

test("hasAll", () => {
  expect(tree.hasAll([user3, user1, user2])).toStrictEqual(true)
  expect(tree.hasAll([user3, user1, user2, userX])).toStrictEqual(false)
})

test("iterator", () => {
  expect([...tree]).toStrictEqual([user1, user2, user3])
  expect([...tree]).toStrictEqual([user1, user2, user3])
})

test("last", () => {
  expect(tree.last).toStrictEqual(user3)
})

test("only", () => {
  expect(() => tree.only).toThrowError()
  tree = new TIndex([user1], conf)
  expect(tree.only).toStrictEqual(user1)
})

test("range", () => {
  expect([...tree.range(user1, user3)]).toStrictEqual([user1, user2])
})

test("rank", () => {
  expect(tree.rank(user1)).toBe(0)
  expect(tree.rank(user2)).toBe(1)
  expect(tree.rank(user3)).toBe(2)
})

test("replace", () => {
  tree.replace([blank, userX])
  expect(tree.size).toStrictEqual(2)
  expect([...tree]).toStrictEqual([blank, userX])
  expect(c.only()).toStrictEqual({
    cleared:3,
    added:{items:[blank, userX], at:0}
  })
})

test("reversed", () => {
  expect([...tree.reversed()]).toStrictEqual([user3, user2, user1])
})

test("size", () => {
  expect(tree.size).toStrictEqual(3)
})

test("to", () => {
  expect(tree.to(user3)).toStrictEqual(user3)
  expect(tree.to(blank)).toBeUndefined()
})

test("toEmpty", () => {
  tree.compare = (a,b) => b.localeCompare(a)
  expect(tree.toEmpty().compare).toBe(compare)
})