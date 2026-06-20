import { Load, type Loadable } from "dubc-client-load"

export interface IPage extends Loadable {
  reload():Promise<void>
}

const sym = Symbol("Page")

export function Page<T extends HTMLElement>(cls:new()=>T):new()=>T&IPage {
  // @ts-ignore
  return class extends Load(cls) {
    /* v8 ignore next */
    static get [sym]() { return true }

    /* v8 ignore next */
    reload() {}

  } as unknown as new()=>T&IPage
}

export function page(el:HTMLElement):el is IPage {
  return sym in el.constructor
}

export interface Provider {
  pageClass:new()=>IPage
}

export interface Rule {
  appliesTo:(path:string, qs:Record<string,string>)=>boolean
  provider:()=>Promise<Provider>
}

export function rule(appliesTo:string|((path:string, qs:Record<string,string>)=>boolean), provider:()=>Promise<Provider>):Rule {
  const orig = appliesTo
  if (typeof appliesTo === "string") appliesTo = x => x === orig
  return { appliesTo, provider }
}

export interface Route {
  path: string
  qs: Record<string,string>
}

export interface Options {
  rules: Rule[]
  show: (page:IPage)=>void
  p404: ()=>Promise<Provider>
  massage?: (route:Route)=>Route|Promise<new()=>IPage>
}

interface Active {
  rules: Rule[]
  show: (page:IPage)=>void
  massage: (route:Route)=>Route|Promise<new()=>IPage>
  p404: ()=>Promise<Provider>
  current?:{
    page:IPage
    pathAndQS:string
  }
}

let active:Active|undefined

const handler = () => {
  goTo(location.pathname, location.search, false).catch((e:unknown) => {
    console.error("error routing", e)
  })
}

export async function router(options:Options) {
  if (active !== undefined) throw new Error("router already active")
  window.addEventListener("popstate", handler)
  const { rules, show, p404 } = options
  const massage = options.massage ?? (r => r)
  active = { rules, show, massage, p404 }
  await goTo(location.pathname, location.search, false)
}

export function stop() {
  active = undefined
  window.removeEventListener("popstate", handler)
}

async function pageFor(route:Route) {
  const massaged = active!.massage(route)
  if (massaged instanceof Promise) {
    return await massaged
  } else {
    route = massaged
  }
  for (const x of active!.rules) {
    if (x.appliesTo(route.path, route.qs)) {
      return (await x.provider()).pageClass
    }
  }
  return (await active!.p404()).pageClass
}

async function goTo(path:string, qs:string, push:boolean) {
  const a = active!
  const pathAndQS = path + qs
  const search = new URLSearchParams(qs)
  const qsObj:Record<string,string> = {}
  for (const [k,v] of search) {
    qsObj[k] = v
  }
  const cls = await pageFor({path, qs:qsObj})
  if (cls === a.current?.page.constructor) {
    console.log("GNORD RELOAD!!!", push)
    if (push) history.pushState(null, "", pathAndQS)
    a.current.page.reload()
    a.current.pathAndQS = pathAndQS
    return
  }
  if (push) history.pushState(null, "", pathAndQS)
  const page = new cls()
  a.current = { page, pathAndQS }
  a.show(page)
}

function query(qs:Record<string,string>|undefined) {
  if (qs === undefined) return ""
  const search = new URLSearchParams()
  for (const k in qs) {
    search.append(k, qs[k]!)
  }
  return "?" + search.toString()
}

export async function routeTo(path:string, qs?:Record<string,string>) {
  if (active === undefined) throw new Error("no active router")
  const q = query(qs)
  await goTo(path, q, true)
}