const prettier = require('prettier/standalone')
const plugins = [require('prettier/parser-graphql')]
const print = ({
  code = 'query name { field }',
  options = { printWidth: 20 },
  lang = 'graphql',
}) => {
  let error = null
  let result = code
  try {
    result = prettier.format(code, {
      parser: lang,
      plugins,
      ...options,
    })
  } catch (e) {
    error = e
  }

  return {
    error,
    code: result,
  }
}

onmessage = function(e) {
  const body = JSON.parse(e.data)
  const { data, id } = body
  const result = print(data)
  this.setTimeout(() => {
    postMessage(JSON.stringify({ result, id }))
  }, 100)
}
