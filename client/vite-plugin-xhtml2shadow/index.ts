import { type PluginOption } from "vite"
import { JSDOM } from "jsdom"
import CleanCSS from "clean-css"

export default function xhtml2shadow():PluginOption {
  return {
    name: "xhtml2shadow",
    transform: {
      filter: {
        id: /\.(xhtml)$/,
      },
      handler(src) {
        return {
          code: compile(src),
          map: null,
        }
      },
    },
  }
}

function compile(src:string) {
  const parser = new Parser(src)
  parser.go()
  let code = `import {getCSS} from "dubc-client-global-css";`
  code += parser.style.s
  code += parser.code.s
  code += "}"
  return code
}

class Parser {

  jsdom:JSDOM
  code = new SB("v")
  style = new SB("s")
  parsed:Document

  constructor(src:string) {
    src = "<div>" + src + "</div>"
    this.jsdom = new JSDOM()
    const parser = new this.jsdom.window.DOMParser()
    const parsed = parser.parseFromString(src, "application/xhtml+xml")
    const n = parsed.querySelector("parsererror")
    if (n !== null) {
      throw new Error(n.textContent!)
    }
    this.code.write(`export default function xhtml(el){`)
    this.code.write(`if(el.shadowRoot!==null)return;`)
    this.code.write(`const sh=el.attachShadow({mode:"open",delegatesFocus:true});`) // TODO, more options
    this.code.write(`sh.adoptedStyleSheets.push(getCSS());`)
    this.parsed = parsed
  }

  go() {
    for (const x of this.parsed.documentElement.childNodes) {
      const v = this.#node(x)
      if (v !== undefined) this.code.write(`sh.append(${v});`)
    }
  }

  #nodeId(node:Node) {
    if (node instanceof this.jsdom.window.Comment) return
    if (node instanceof this.jsdom.window.Text) return this.#text(node)
    if (node instanceof this.jsdom.window.Element) return this.#element(node)
  }

  #node(node:Node) {
    const id = this.#nodeId(node)
    if (id === undefined) return
    for (const x of node.childNodes) {
      const childId = this.#node(x)
      if (childId !== undefined) this.code.write(`${id}.append(${childId});`)
    }
    return id
  }

  #text(text:Text) {
    const s = text.textContent
    if (s === null) return
    if (s.trim() === "") return
    const v = this.code.next()
    this.code.write(`const ${v} = document.createTextNode(${esc(s)});`)
    return v
  }

  #element(el:Element) {
    if (el.tagName === "style") return this.#style(el)
    const tag = el.tagName.toLowerCase()
    const v = this.code.next()
    this.code.write(`const ${v}=document.createElement(${esc(tag)});`)
    for (const x of el.attributes) {
      let { name, value } = x
      if (name === "src" || name === "href") {
        if (value.startsWith(".") || value.startsWith("/")) {
          const imp = this.style.next()
          this.style.write(`import ${imp} from ${esc(value)};`)
          value = imp
        }
      } else {
        value = esc(value)
      }
      this.code.write(`${v}.setAttribute(${esc(name)}, ${value});`)
    }
    return v
  }

  #style(el:Element) {
    const v = this.style.next()
    const css = new CleanCSS().minify(el.textContent ?? "")
    this.style.write(`const ${v}=new CSSStyleSheet();`)
    this.style.write(`${v}.replaceSync(${esc(css.styles)});`)
    this.code.write(`sh.adoptedStyleSheets.push(${v});`)
  }
}


class SB {

  s:string = ""
  #id = 0

  next() {
    this.#id++
    return this.prefix + this.#id
  }

  constructor(readonly prefix:string) {}

  write(s:string) {
    this.s += s
  }
}

function esc(s:string) {
  return JSON.stringify(s)
}