import { Base } from "dubc-ds-base"
import { Pair, Pairs, forEach } from "dubc-ds-pairs"

export interface Include {
  start: boolean
  end: boolean
}

export const IN_IN = { start:true, end:true }
export const IN_EX = { start:true, end:false }
export const EX_IN = { start:false, end:true }
export const EX_EX = { start:false, end:false }

type N<K extends {},V> = Node<K,V>|undefined

class Node<K extends {},V> {

  weight = 1
  parent:N<K,V>
  left:N<K,V>
  right:N<K,V>

  constructor(readonly key:K, public value:V) {}

  private weigh() {
    this.weight = 1 + (this.left?.weight ?? 0) + (this.right?.weight ?? 0)
  }

  index() {
    let i = -1
    let node:N<K,V> = this
    let prev = node.right
    while (node) {
      if (node.right === prev) {
        i += node.left ? node.left.weight + 1 : 1
      }
      prev = node
      node = node.parent
    }
    return i
  }

  next() {
    let node:N<K,V> = this
    let child = node.right
    if (child !== undefined) while (child !== undefined) { node = child; child = child.left }
    else while (node !== undefined && node.right === child) { child = node; node = node.parent }
    return node
  }

  prev() {
    let node:N<K,V> = this
    let child = node.left
    if (child !== undefined) while (child !== undefined) { node = child; child = child.right }
    else while (node !== undefined && node.left === child) { child = node; node = node.parent }
    return node
  }

  rotateLeft() {
    let a = this
    let b = a.right
    let r = b?.left
    b!.parent = a.parent
    b!.left = a
    a.parent = b
    a.right = r
    if (r) r.parent = a
    a.weigh()
    b?.weigh()
    return b
  }

  rotateRight() {
    let a = this
    let b = a.left
    let l = b?.right
    b!.parent = a.parent
    b!.right = a  
    a.parent = b
    a.left = l
    if (l) l.parent = a
    a.weigh()
    b?.weigh()
    return b
  }

}

interface Op {
  readonly lset:boolean
  readonly rset:boolean
  readonly eset:boolean
  readonly eright:boolean
}

const EQ:Op = { lset:false, rset:false, eset:true,  eright:false }
//const EG:Op = { lset:false, rset:false, eset:true,  eright:true   }
const LT:Op = { lset:true,  rset:false, eset:false, eright:false }
const LE:Op = { lset:true,  rset:false, eset:true,  eright:true  }
const GT:Op = { lset:false, rset:true,  eset:false, eright:true  }
const GE:Op = { lset:false, rset:true,  eset:true,  eright:false }

export interface Conf<K extends {},V> {
  readonly unique:boolean
  readonly compare:(a:K,b:K)=>number
  readonly valueEq:(a:V,b:V)=>boolean
}

export class TMap<K extends {},V> extends Base<Pair<K,V>> {

  private root:N<K,V>
  private _compare:(a:K,b:K)=>number
  protected conf:Conf<K,V>

  constructor(input:Pairs<K,V>, c:Conf<K,V>) {
    super()
    this._compare = c.compare
    this.conf = c
    this.setAll(input)
  }

  static of<K extends {},V>(compare:(a:K,b:K)=>number, ...pairs:Pair<K,V>[]|[K,V][]) {
    const conf:Conf<K,V> = {compare, valueEq:Object.is, unique:true}
    return new TMap(pairs, conf)
  }

  toEmpty() {
    const conf2:Conf<K,V> = {
      unique:this.conf.unique,
      valueEq:this.conf.valueEq,
      compare:this._compare,
    }
    const r = new TMap(this, conf2)
    return r
  }

  get size() { return this.root?.weight ?? 0 }
  
  clear() {
    const sz = this.size
    this.root = undefined
    if (sz > 0) this.fire({cleared:sz})
  }

  replace(i:Pairs<K,V>) {
    const sz = this.size
    this.root = undefined
    forEach(i, (k,v) => { this.rawPut(k,v) })
    if (sz > 0) {
      if (this.root === undefined) this.fire({cleared:sz})
      else this.fire({cleared:sz, added:{items:this, at:0 }})
    } else if (this.root !== undefined) this.fire({added:{items:this, at:0 }})
  }

  drop(f:(pair:Pair<K,V>)=>boolean) {
    let n:N<K,V> = this.first as Node<K,V>
    let at = 0
    while (n !== undefined) {
      const x = n
      n = n.next()
      if (f(x)) {
        this.remove(x)
        this.fire({deleted:{items:[x], at:at}})
      } else at++
    }
  }

  get compare() { return this._compare }
  set compare(cmp:(a:K,b:K)=>number) {
    this._compare = cmp
    let n = this.first as Node<K,V>|undefined
    if (n === undefined) return
    this.root = undefined
    while (n !== undefined) {
      this.rawPut(n.key, n.value)
      n = n.next()
    }
    this.fire({cleared:this.size, added:{items:this, at:0}})
  }

  get keyEq() { return (a:K,b:K) => this._compare(a,b) === 0 }
  get unique() { return this.conf.unique }

  at(i:number):Pair<K,V> {
    let node = this.root
		let weight = this.size
    // if (i < 0) i += weight // TODO
    if (i < 0 || i >= weight) throw new TypeError("bounds")
    while (true) {
      const left = node?.left
      const lw = left?.weight ?? 0
      if (i > lw) {
        i -= lw + 1
				node = node?.right
      } else if (i < lw) {
        node = left
      } else break
    }
		return node!
  }

  get only():Pair<K,V> {
    if (this.size !== 1) throw new Error("size isn't 1")
    return this.root!
  }

  get first():Pair<K,V>|undefined {
    let current = this.root
    let previous:N<K,V>
    while (current) {
      previous = current
      current = current.left
    }
    return previous
  }

  get last():Pair<K,V>|undefined {
    let current = this.root
    let previous:N<K,V>
    while (current) {
      previous = current
      current = current.right
    }
    return previous
  }

  *[Symbol.iterator]() {
    let n = this.first as N<K,V>
    while (n) {
      yield n
      n = n.next()
    }
  }

  private *keys2() {
    for (const x of this) yield x.key
  }

  get keys():Iterable<K> {
    return this.keys2()
  }

  private *values2() {
    for (const x of this) yield x.value
  }

  get values():Iterable<V> {
    return this.values2()
  }

  *reversed() {
    let n = this.last as N<K,V>
    while (n) {
      yield n as Pair<K,V>
      n = n.prev()
    }
  }

  *range(startKey:K, endKey:K, inc:Include = IN_EX) {
    const start = this.find(startKey, inc.start ? GE : GT)
    const cmp = this.compare
    if (inc.end) for (let n = start; n !== undefined && cmp(n.key, endKey) <= 0; n = n.next()) {
      yield n as Pair<K,V>
    } else for (let n = start; n !== undefined && cmp(n.key, endKey) < 0; n = n.next()) {
      yield n as Pair<K,V>
    }
  }

  private find(key:K, op:Op = EQ) {
    let node = this.root
    let ret:N<K,V>
    const unique = this.unique
    const cmp = this.compare
    while (node) {
      const c = cmp(node.key, key)
      if (c < 0) {
        if (op.lset) ret = node
        node = node.right
      } else if (c > 0) {
        if (op.rset) ret = node
        node = node.left
      } else {
        if (op.eset) {
          if (unique) return node
          else ret = node
        }
        node = op.eright ? node.right : node.left
      }
    }
    return ret
  }

  get(key:K):V|undefined { return this.find(key, EQ)?.value }
  has(key:K):boolean { return this.find(key, EQ) !== undefined }

  from(key:K):Pair<K,V>|undefined { return this.find(key, GE) }
  to(key:K):Pair<K,V>|undefined { return this.find(key, LE) }
  after(key:K):Pair<K,V>|undefined { return this.find(key, GT) }
  before(key:K):Pair<K,V>|undefined { return this.find(key, LT) }

  rank(key:K) {
    return this.find(key, EQ)?.index()
  }

  protected rawPut(key:K, value:V):{node:Node<K,V>,old?:V} {
    let previous:N<K,V> = undefined, node = this.root
    let unique = this.unique ? 0 : undefined
    let c = 0, cmp = this.compare
    while (node) {
      c = cmp(node.key, key)
      if (c === unique) {
        const old = node.value
        node.value = value
        return {node, old}
      }
      previous = node
      if (c <= 0) node = node.right
      else node = node.left
    }
    node = new Node(key, value)
    node.parent = previous
    if (previous === undefined) this.root = node
    else {
      if (c <= 0) previous.right = node
      else previous.left = node
      this.weigh(previous)
    }
    return {node,old:undefined}
  }

  set(key:K, value:V):V|undefined {
    const r = this.rawPut(key, value)
    if (r.old === undefined) {
      const at = r.node.index()
      this.fire({added:{items:[{key, value}], at}})
      return
    }
    if (this.conf.valueEq(r.old, value)) return r.old
    const at = r.node.index()
    this.fire({
      deleted:{items:[{key, value:r.old}], at},
      added:{items:[{key, value}], at}
    })
    return r.old
  }

  setAll(entries:Pairs<K,V>) {
    let sz = this.size
    if (sz > 0) {
      forEach(entries, (k,v) => { this.set(k,v) })
      return this.size - sz
    }
    forEach(entries, (k,v) => { this.rawPut(k,v) })
    const changed = this.size - sz
    if (changed > 0) this.fire({added:{items:this, at:0}})
    return changed
  }

  delete(key:K) {
    const node = this.find(key)
    if (node === undefined) return undefined
    const at = node.index()
    this.remove(node)
    this.fire({deleted:{items:[node as Pair<K,V>], at}})
    return node.value
  }

  private remove(node:Node<K,V>) {
    const p = node.parent
    let left = node.left, right = node.right
    let bal:N<K,V>
    let next:N<K,V>
    if (right === undefined) {
      bal = p
      next = left
      left = undefined
    } else if (right.left) {
      next = right
      while (next.left) { bal = next; next = next.left }
      const c = next.right
      bal!.left = c
      if (c) c.parent = bal
    } else {
      bal = right
      next = right
      right = undefined
    }
    if (p === undefined) this.root = next
    else if (p.left === node) p.left = next
    else p.right = next
    if (next) {
      next.parent = p
      if (left) { next.left = left, left.parent = next }
      if (right) { next.right = right, right.parent = next }
    }
    this.weigh(bal!)
  }

  private weigh(n:Node<K,V>) {
    let next:N<K,V> = n
    while (next) {
      let node:N<K,V> = next, orig:N<K,V> = next
      next = node.parent
      let left = node.left, right = node.right
      let lw = weight(left)
      let rw = weight(right)
      if (rw * 5 + 2 < lw * 2) {
        if (weight(left?.left) * 5 < lw * 2) node.left = left?.rotateLeft()
        node = node.rotateRight()
      } else if (lw * 5 + 2 < rw * 2) {
        if (weight(right?.right) * 5 < rw * 2) node.right = right?.rotateRight()
        node = node.rotateLeft()
      } else {
        node.weight = lw + rw + 1
        continue
      }
      if (next === undefined) this.root = node
      else if (next.left === orig) next.left = node
      else next.right = node
    }
  }

}

function weight(n:N<any,any>) {
  return n?.weight ?? 0
}
