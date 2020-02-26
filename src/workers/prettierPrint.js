import { EventEmitter } from 'events'
const prettyEmitter = new EventEmitter()

let PrettierLoader = async () => ({})

if (!process.server) {
  PrettierLoader = () =>
    import(
      /* webpackChunkName: "prettier" */
      'worker-loader?name=w-pretty-worker.js!./prettier.js'
    )
}

let prettier = false
let counter = 1
async function print(
  code,
  lang = 'graphql',
  options = {
    printWidth: 10,
  }
) {
  if (process.server) return {}
  if (!prettier) {
    const PrettierWorker = await PrettierLoader()
    if (PrettierWorker.default) {
      prettier = new PrettierWorker.default()
      prettier.onmessage = message => {
        const { id, result } = JSON.parse(message.data)
        prettyEmitter.emit(id, result)
      }
    }
  }
  counter++
  prettier.postMessage(
    JSON.stringify({ data: { code, lang, options }, id: counter })
  )
  return new Promise((resolve, reject) => {
    prettyEmitter.once(counter, e => resolve(e))
    setTimeout(() => reject('Prettier Timeout'), 1500)
  })
}
export default print
