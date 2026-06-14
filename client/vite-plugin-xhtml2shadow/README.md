# vite-plugin-xhtml2shadow

A vite plugin that parses XHTML files into JavaScript functions
that produce a shadow root with that HTML.

## Installation

You should install this plugin as a dev tool. To use the plugin, you
must also install the `dubc-client-global-css` package as a non-dev
dependecy:

```bash
npm i -D vite-plugin-xhtml2shadow
npm i dubc-client-global-css
```

## Example usage

You can now create web components that reference markup instead of
using cumbersome JavaScript APIs:

**login-form.xhtml**:
```xhtml
<form>
  <label>
    Email
    <input name="email" type="email" placeholder="Email"/>
  </label>
  <label>
    Password
    <input name="password" type="password" placeholder="Password"/>
  </label>
  <button type="submit">Submit</button>
</form>
<style>
form {
  display: flex;
  flex-flow: column nowrap;
}
/* ...and so on */
</style>
```

**login-form.ts**:
```TypeScript
import build from "./login-form.xhtml"

class LoginForm extends HTMLElement {

  constructor() {
    super()
    if (build(this)) return
    // other set up here
  }

  connectedCallback() {
    const submit = this.shadowRoot!.querySelector("button")!
    submit.onclick = () => {
      // perform login here
    }
  }
}
customElements.define("login-form", LoginForm)
```

## Stylesheets

Style elements are not added directly to the shadow root's HTML.
Instead, the style rules are added to a `CSSStyleSheet` singleton,
which the shadow root then adopts. This prevents the creation of
multiple duplicate style sheets if the component is created many times.

Additionally, you can set a global style sheet via the
`dubc-client-global-css` package's `setCSS` method:

```TypeScript
import { setCSS } from "dubc-client-global-css"
import css from "/src/global.css?raw"

const globalCSS = new CSSStyleSheet()
globalCSS.replaceSync(css)
setCSS(globalCSS)
```

Every shadow root created by this plugin will then adopt the global
style sheet, allowing you to re-use design across your entire app.

## XHTML notes

Why does this plugin use `.xhtml` files and not `.html` files? There
are two reasons.

First, `vite` already gives special handling to `.html` files, so
this plugin doesn't interfere with that.

Second, HTML5 doesn't allow self-closing tags for custom elements,
but XHTML does. If you're used to using frameworks like React,
you know that self-closing tags that represent self-contained components
make the markup much easier to read.

Since XHTML is XML, and XML doesn't support a lot of named entities,
you'll need to escape their unicode values instead. In practice this
issue only comes up with non-breaking spaces. Instead of using `&nbsp;`
like you would in HTML, use `&#x00A0;` instead.

Note that although you _author_ your markup as XHTML, the plugin
_produces_ JavaScript that creates HTML5 elements. The usage of xhtml
is simply for self-closing tags.

## Server-Side Rendering

If the passed-in element already has a shadow root, the functions
produced by this plugin do nothing, just return `true`. This is
done to support web components that were rendered by a server via
Declarative Shadow DOM. In your component's constructor, you can
check the result of the `build` function to exit early if the
element already has a shadow root.

## Viteness

This plugin is vite-specific because it relies on vite's ability to
import static assets as URLs. This is done for `href` and `src`
attributes that reference a relative URL. Doing so allows you to specify
an asset in your `/src` directory via its path, but the plugin will
output the correct hashed URL when building with vite.