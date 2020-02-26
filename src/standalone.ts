import Ajv from 'ajv'
import { browserQuery, BrowserQueryOptions } from './browserQuery'
import { cache } from './standaloneOperationCache'
import { getStep, flowInit, StepArgs } from './standaloneSteps'
// const gql = String.raw
type Json =
  | string
  | number
  | null
  | undefined
  | Json[]
  | { [key: string]: Json }

type JsonObject = { [key: string]: Json }
type ValidateArgs = {
  schema: JsonObject
  data: JsonObject
}
const validateJson = ({ schema, data }: ValidateArgs) => {
  let dataCopy = {}
  const errors: Array<{ message: string }> = []
  try {
    dataCopy = JSON.parse(JSON.stringify(data))
  } catch (e) {
    errors.push({ message: e.message })
    //
  }
  const ajv = new Ajv({ useDefaults: true, coerceTypes: 'array' })
  var valid = ajv.validate(schema, dataCopy)
  if (!valid || errors.length) {
    return {
      errors: ajv.errors
        ? [...ajv.errors.map(e => ({ message: `${e.message}` })), ...errors]
        : errors,
      dataCopy,
    }
  } else {
    return { errors: null, dataCopy }
  }
}

const operations = async (options?: BrowserQueryOptions) => {
  const { domQl, close: closeBrowser } = await browserQuery(options)
  return {
    validateJson: ({ data, schema }) => {
      const { dataCopy, errors } = validateJson({ data, schema })
      if (!errors?.length) return Promise.resolve(dataCopy)
      else return Promise.resolve()
    },
    domQl: (args: StepArgs) =>
      domQl({
        query: args.query,
        variables: args.variables,
      }),
    closeBrowser,
  } as { [k: string]: (args: StepArgs) => Promise<any> }
}

import crypto from 'crypto'
import { startProxy } from './proxy'

const hash = (...args: any) =>
  crypto
    .createHash('sha1')
    .update(JSON.stringify(args))
    .digest('hex')

const startStepper = async (
  options?: BrowserQueryOptions & {
    reportStep?: (name: string, args: StepArgs) => void
  }
) => {
  const ops = await operations(options)
  const executeStep = async (name: string, args: StepArgs) => {
    if (options?.reportStep) {
      options?.reportStep(name, args)
    }
    const step = getStep(name)

    if (step) {
      const stepMeta = {
        name: step.operation || 'customFn',
        args: { ...step.args, ...args },
        flow: 'debug',
        step: name,
      }

      const cachedResult = await cache.get(stepMeta)
      let result = cachedResult?.data
      if (!cachedResult) {
        if (step.operation) {
          result = await ops[step.operation](stepMeta.args)
        } else if (step.fn) {
          result = await step.fn(stepMeta.args)
        }
      }
      if (result) {
        if (result?.errors) console.log(name, result?.errors)
        else await cache.put({ ...stepMeta, data: result })

        if (Array.isArray(result)) {
          result.forEach(r => step.output.forEach(next => executeStep(next, r)))
        } else {
          step.output.forEach(next => result && executeStep(next, result))
        }
      }
      return result
    }
  }
  return { executeStep }
}

async function main() {
  const { proxyServer } = await startProxy({ port: 8008 })
  const { executeStep } = await startStepper({
    proxyServer,
    concurrency: 2,
    ignoreHTTPSErrors: true,
    // reportStep: (name, { data }) => console.log(name, !!data),
    // blockResourceTypes: ['image', 'stylesheet', 'font', 'script'],
  })
  // console.log(proxyServer)
  // process.exit()
  const initResult = await executeStep(flowInit.name, flowInit.args)
  console.dir({ initResult }, { depth: 8 })
}
main()
