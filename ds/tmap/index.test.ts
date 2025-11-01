import { test, expect, beforeEach, describe } from "vitest"
import { TMap, IN_IN, IN_EX, EX_IN, EX_EX } from "./index"
import { capture } from "dubc-ds-test"
import { Pair } from "dubc-ds-pairs"
import { DSEvent, Mod } from "dubc-ds-base";

const K = {};

type P = Pair<number,string>

function mod(mod:Mod<P>) {
  const m2:Mod<P> = {items:[...mod.items].map(x => { return { key: x.key, value: x.value } })}
  if (mod.at !== undefined) m2.at = mod.at
  return m2
}

function sane(e:DSEvent<P>) {
  const e2:DSEvent<P> = {}
  if (e.cleared !== undefined) e2.cleared = e.cleared
  if (e.deleted !== undefined) e2.deleted = mod(e.deleted)
  if (e.added !== undefined) e2.added = mod(e.added)
  return e2
}

function *map<T,R>(i:Iterable<T>, f:(x:T)=>R) {
  for (const x of i) {
    yield f(x)
  }
}

function compare(n1:number, n2:number) {
  return n1 - n2
}

interface Node<K extends {},V extends {}> extends Pair<K,V> {
  parent?:Node<K,V>
  left?:Node<K,V>
  right:Node<K,V>
  weight:number
}

function root<K extends {},V extends {}>(tree:TMap<K,V>) {
  let root:Node<K,V>|undefined
  for (const x of tree) {
    const n = x as Node<K,V>
    if (n.parent === undefined) {
      if (root !== undefined) throw new Error("too many roots")
      root = n
    }
  }
  return root
}

// function dump<K extends {},V extends {}>(node?:Node<K,V>, indent = "") {
//   if (node === undefined) return
//   console.log(indent + node?.key + ":" + node?.value + "/" + node?.weight)
//   dump(node.left, indent + " ")
//   dump(node.right, indent + " ")
// }

function check<K extends {},V extends {}>(node?:Node<K,V>) {
  if (node === undefined) return
  const lw = node.left?.weight ?? 0
  const rw = node.right?.weight ?? 0
  if (node.weight !== lw + rw + 1) throw new Error("wrong weight")
  if (rw * 5 + 2 < lw * 2) throw new Error("leaning to the left")
  if (lw * 5 + 2 < rw * 2) throw new Error("leaning to the right")
  check(node.left)
  check(node.right)
}

let tree = TMap.of(compare, {key:1,value:"1"})
let empty = tree
let c = capture(K, tree)
beforeEach(() => {
  tree = new TMap<number,string>([], { compare, valueEq:Object.is, unique:true })
  tree.hear(globalThis, () => { check(root(tree)) })
  c = capture(K, tree)
  empty = tree.toEmpty()
})

interface TestCase {
  name: string
  input: number[]
}

const cases:TestCase[] = [
  { name: "random1", input: [7, 6, 15, 5, 10, 9, 11, 13, 2, 8, 14, 3, 4, 1, 12] },
  { name: "random2", input: [12, 1, 4, 3, 14, 8, 2, 13, 11, 9, 10, 5, 15, 6, 7] },
  { name: "random3", input: [5, 14, 9, 13, 11, 8, 15, 6, 1, 2, 10, 7, 3, 4, 12] },
  { name: "random4", input: [5, 6, 12, 10, 2, 4, 7, 3, 13, 15, 1, 8, 9, 14, 11] },
  { name: "ascending", input: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] },
  { name: "descending", input: [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
]

describe("TMap", () => { for (const tc of cases) {
  test(tc.name + " init", () => {
    expect(tree.size).toBe(0)
    expect(tree.first).toBeUndefined()
    expect(tree.last).toBeUndefined()
    expect([...tree]).toStrictEqual([])
  })
  describe(tc.name, () => {
    beforeEach(() => {
      tree.clear()
      for (const k of tc.input) tree.set(k, String(k))
      c.clear()
    })
    test("after", () => {
      for (let k = 0; k <= 14; k++) expect(tree.after(k)?.key).toBe(k + 1)
      expect(tree.after(15)).toBeUndefined()
      expect(empty.after(1)).toBeUndefined()
    })
    test("at", () => {
      for (let k = 1; k <= 15; k++) {
        const entry = tree.at(k - 1)
        expect(entry?.key).toBe(k)
        expect(entry?.value).toBe(String(k))
      }
      expect(() => tree.at(-1)).toThrowError()
      expect(() => tree.at(15)).toThrowError()
      expect(() => tree.at(100)).toThrowError()
      expect(() => empty.at(0)).toThrowError()
    })
    test("before", () => {
      for (let k = 2; k <= 16; k++) expect(tree.before(k)?.key).toBe(k - 1)
      expect(tree.before(1)).toBeUndefined()
      expect(empty.before(1)).toBeUndefined()
    })
    test("compare", () => {
      tree.compare = (a:number,b:number) => b - a
      expect([...tree.keys]).toStrictEqual([15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1])
      expect(sane(c.only())).toStrictEqual({
        cleared: 15,
        added: { at:0, items:[
          { key:15, value:"15" },
          { key:14, value:"14" },
          { key:13, value:"13" },
          { key:12, value:"12" },
          { key:11, value:"11" },
          { key:10, value:"10" },
          { key:9, value:"9" },
          { key:8, value:"8" },
          { key:7, value:"7" },
          { key:6, value:"6" },
          { key:5, value:"5" },
          { key:4, value:"4" },
          { key:3, value:"3" },
          { key:2, value:"2" },
          { key:1, value:"1" },
        ]}
      })
      tree.clear()
      expect(sane(c.only())).toStrictEqual({cleared:15})
      tree.compare = compare
      expect(c.all()).toStrictEqual([])
    })
    test("drop", () => {
      empty.drop(pair => pair.key === 0)
      expect(c.all()).toStrictEqual([])
      tree.drop(pair => pair.key === 3)
      expect(sane(c.only())).toStrictEqual({deleted:{items:[{key:3, value:"3"}], at:2}})
    })
    test("first", () => {
      expect(tree.first?.key).toBe(1)
      expect(tree.first?.value).toBe("1")
    })
    test("from", () => {
      for (let k = 1; k <= 15; k++) expect(tree.from(k)?.key).toBe(k)
      expect(tree.from(0)?.key).toBe(1)
      expect(tree.from(16)).toBeUndefined()
      expect(empty.from(1)).toBeUndefined()  
    })
    test("get", () => {
      for (let i = 1; i <= 15; i++) {
        expect(tree.get(i)).toBe(String(i))
      }
    })
    test("has", () => {
      expect(tree.has(10)).toBe(true)
      expect(tree.has(10000)).toBe(false)
    })
    test("keyEq", () => {
      expect(tree.keyEq(1, 1)).toBe(true)
      expect(tree.keyEq(1, 2)).toBe(false)
    })
    test("last", () => {
      expect(tree.last?.key).toBe(15)
      expect(tree.last?.value).toBe("15")
    })
    test("only", () => {
      expect(() => { tree.only }).toThrowError()
    })
    test("put", () => {
      const r = tree.set(5, "FIVE")
      expect(r).toBe("5")
      expect(sane(c.only())).toStrictEqual({
        deleted: { items:[{key:5, value:"5"}], at:4},
        added: { items:[{key:5, value:"FIVE"}], at:4},
      })
      expect(tree.set(5, "FIVE")).toBe("FIVE")
      expect(c.all()).toStrictEqual([])
      expect(tree.get(5)).toBe("FIVE")
      expect(tree.size).toBe(15)
      expect(tree.set(5, "5")).toBe("FIVE")
      expect(sane(c.only())).toStrictEqual({
        deleted: { items:[{key:5, value:"FIVE"}], at:4},
        added: { items:[{key:5, value:"5"}], at:4},
      })
    })
    test("putAll", () => {
      expect(tree.setAll([[13.5,"13.5"]])).toBe(1)
      expect(sane(c.only())).toStrictEqual({
        added:{items:[{key:13.5,value:"13.5"}], at:13}
      })
      expect(tree.setAll([])).toBe(0)
      expect(c.all()).toStrictEqual([])
      tree.clear()
      expect(sane(c.only())).toStrictEqual({cleared:16})
      expect(tree.setAll([])).toBe(0)
      expect(c.all()).toStrictEqual([])
      expect(tree.setAll([[1,"1"],[2,"2"]])).toBe(2)
      expect(sane(c.only())).toStrictEqual({
        added:{items:[{key:1,value:"1"},{key:2,value:"2"}], at:0}
      })
    })
    describe("range", () => {
      test("IN_IN", () => {
        for (let start = 1; start <= 13; start++) {
          const range = map(tree.range(start, start + 2, IN_IN), x => x.key)
          expect([...range]).toStrictEqual([start, start + 1, start + 2])
        }
      })
      test("IN_EX", () => {
        for (let start = 1; start <= 12; start++) {
          const range = map(tree.range(start, start +3, IN_EX), x => x.key)
          expect([...range]).toStrictEqual([start, start + 1, start + 2])
        }
      })
      test("EX_IN", () => {
        for (let start = 1; start <= 12; start++) {
          const range = map(tree.range(start, start + 3, EX_IN), x => x.key)
          expect([...range]).toStrictEqual([start + 1, start + 2, start + 3])
        }
      })
      test("EX_EX", () => {
        for (let start = 1; start <= 12; start++) {
          const range = map(tree.range(start, start + 4, EX_EX), x => x.key)
          expect([...range]).toStrictEqual([start + 1, start + 2, start + 3])
        }
      })
    })
    test("rank", () => {
      for (let k = 1; k <= 15; k++) expect(tree.rank(k)).toBe(k - 1)
      expect(tree.rank(16)).toBeUndefined()
    })
    test("removeKey", () => {
      expect(tree.delete(17)).toBeUndefined()
      expect(c.all()).toStrictEqual([])
      expect(tree.size).toBe(15)
      let size = tree.size
      for (const k of tc.input) {
        const r = tree.rank(k)
        expect(tree.delete(k)).toBe(String(k))
        expect(sane(c.only())).toStrictEqual({
          deleted: { items:[{key:k, value:String(k)}], at:r},
        })
        size--
        expect(tree.size).toBe(size)
      }
      expect(tree.size).toBe(0)
    })
    test("replace", () => {
      tree.replace([[0, "0"], [10, "10"]])
      expect(sane(c.only())).toStrictEqual({
        cleared: 15,
        added: { items:[{key:0,value:"0"},{key:10,value:"10"}], at:0 }
      })
      tree.replace([])
      expect(sane(c.only())).toStrictEqual({cleared:2})
      tree.replace([])
      expect(c.all()).toStrictEqual([])
      tree.replace([[0, "0"], [10, "10"]])
      expect(sane(c.only())).toStrictEqual({
        added: { items:[{key:0,value:"0"},{key:10,value:"10"}], at:0 }
      })
    })
    test("reversed", () => {
      const reversed = [...tree.reversed()]
      const keys = reversed.map(x => x.key)
      const values = reversed.map(x => x.value)
      expect(keys).toStrictEqual([15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1])
      expect(values).toStrictEqual(["15", "14", "13", "12", "11", "10", "9", "8", "7", "6", "5", "4", "3", "2", "1"])
    })
    test("size", () => {
      expect(tree.size).toBe(15)
    })
    test("to", () => {
      for (let k = 1; k <= 15; k++) expect(tree.to(k)?.key).toBe(k)
      expect(tree.to(16)?.key).toBe(15)
      expect(tree.to(0)).toBeUndefined()
      expect(empty.to(1)).toBeUndefined()  
    })
    test("values", () => {
      expect([...tree.values]).toStrictEqual(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"])
    })
  })
}})

test("clear", () => {
  tree.set(1, "1")
  c.clear()
  tree.clear()
  expect(sane(c.only())).toStrictEqual({cleared:1})
  expect([...tree.reversed()]).toStrictEqual([])
})

test("only", () => {
  expect(() => { tree.only }).toThrowError()
  tree.set(1, "1")
  expect(tree.only.key).toBe(1)
  expect(tree.only.value).toBe("1")
  tree.set(2, "2")
  expect(() => { tree.only }).toThrowError()
})

test("non-unique", () => {
  const tree = new TMap<number,string>([], {compare, valueEq:Object.is, unique:false})
  tree.set(1, "1")
  tree.set(1, "1")
  expect([...tree.keys]).toStrictEqual([1, 1])
  expect(tree.has(1)).toBe(true)
})
