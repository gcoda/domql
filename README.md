# DomQL

# TODO

## Cookies

[ ] - document.cookie
[ ] - document.allCookies

[SO](https://stackoverflow.com/questions/4003823/javascript-getcookie-functions)
[js-cookie](https://github.com/js-cookie/js-cookie)

## maybe

- localStorage ?
- sessionStorage ?
  `document.defaultView.sessionStorage`
- getSelection

## Fetch

fetch within tab or document. With access to cookies

[ ] - document.fetch

## clicks and fetch after document

like `@client` in apollo-client.

1. remove click fields, resolve document.
2. iterate clicks, with resolved document.
3. merge

# TODO: More Directives

`@validate` return null if something wrong inside field, maybe push to global errors, or `validationErrors`

```json
{
  "data": {},
  "errors": null,
  "validationErrors": [
    { "path": "document.select.select.attr", "message": "does not exist" }
  ]
}
```

# TODO: codegen for `dom-server`

And maybe realtime something in browser/popup for flow-steps

### Project setup

```
yarn
```

### Compiles and hot-reloads for development

```
yarn serve
```

### Compiles and minifies for production

```
yarn build
```
