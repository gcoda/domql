interface ContextInit {
  req?: any
  request?: any
  outputs?: any[]
}
export const context = (init?: ContextInit) => {
  return {
    document,
    outputs: init?.outputs,
    output: (message: any) => {
      init?.outputs?.push(message)
    },
    waitCheckInterval: 100,
    beforeUnload: (info: any) => {
      // pass rest of query in case of navigation to new document ?
    },
  }
}
export type Context = ReturnType<typeof context>
