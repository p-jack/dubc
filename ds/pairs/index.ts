export interface Pair<K extends {},V> {
  readonly key: K
  readonly value: V
}

export type Object<K extends {},V> = K extends string ? Record<string,V> : never
export type Pairs<K extends {},V> = Iterable<Pair<K,V>> | Iterable<[K,V]> | Object<K,V>

export function forEach<K extends {},V>(input:Pairs<K,V>, f:(k:K, v:V)=>void):number {
  let count = 0
  if (Symbol.iterator in input) {
    for (const x of input) {
      count++
      if (Array.isArray(x)) f(x[0], x[1])
      else f(x.key, x.value)
    }
    return count
  }
  for (const [k, v] of Object.entries(input)) {
    count++
    f(k as never, v)
  }
  return count
}
