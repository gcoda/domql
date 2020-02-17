import { Target, launch, Page } from 'puppeteer-core'
import * as path from 'path'
import { readFileSync } from 'fs'
const testQuery = readFileSync(
  path.resolve(__dirname, '../src', 'puppeteer.gql'),
  'utf-8'
)
const gql = String.raw
const extensionPath = path.resolve(__dirname, '../dist')
const extensionName = 'DomQl'
import { MakeRequest } from './background'
// import { flow } from './testFlow'
const makeRequest: MakeRequest = () => Promise.resolve(null)

const pageLogger = (page?: null | Page) => {
  if (page) {
    page
      .on('console', message =>
        console.log(
          `${message
            .type()
            .substr(0, 3)
            .toUpperCase()} ${message.text()}`
        )
      )
      .on('pageerror', ({ message }) => console.log(message))
      .on('response', response =>
        console.log(`${response.status()} ${response.url()}`)
      )
      .on('requestfailed', request => console.log(`FAILED ${request.url()}`))
  }
}
export const browserCtx = async () => {}
;(async () => {
  const browser = await launch({
    headless: false, // extension are allowed only in the head-full mode
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      `--no-sandbox`,
    ],
    executablePath: '/usr/bin/google-chrome',
  })
  await browser.newPage() // const dummy =
  const targets = await browser.targets()
  const extensionTarget: undefined | Target = targets.find(
    ({ _targetInfo }: any) =>
      `${_targetInfo.title}`.toLowerCase() ===
        `${extensionName}`.toLowerCase() &&
      _targetInfo.type === 'background_page'
  )

  const page = await extensionTarget?.page()
  pageLogger(page)
  if (page) {
    browser.on('targetchanged', t => t.page().then(pageLogger))

    const dimensions = await page.evaluate(testQuery => {
      return makeRequest({
        backgroundQuery: true,
        location: 'https://news.ycombinator.com',
        query: testQuery,
        variables: {},
      })
    }, testQuery)
    // browser. // await page.close()
    console.dir(dimensions, { depth: 8 })
  }
  setTimeout(() => {
    // browser.close()
  }, 500)
})()
