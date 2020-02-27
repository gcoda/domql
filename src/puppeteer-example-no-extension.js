const path = require('path')
const puppeteer = require('puppeteer-core')
const fs = require('fs')
const extensionPath = path.resolve(__dirname, '..', 'dist')
const contentScript = (() => {
  const jsDirPath = path.resolve(extensionPath, 'js')
  const jsDir = fs.readdirSync(jsDirPath)
  const contentScriptFileName = jsDir.find(f => f.startsWith('content-script'))
  return fs.readFileSync(
    path.resolve(jsDirPath, contentScriptFileName),
    'utf-8'
  )
})()

const gql = String.raw
const makeRequest = () => Promise.resolve(null)

const browserQuery = async () => {
  const browser = await puppeteer.launch({
    ignoreHTTPSErrors: true,
    headless: false, // extension are allowed only in the head-full mode
    args: [`--no-sandbox`],
    executablePath: '/usr/bin/google-chrome',
  })
  const page = await browser.newPage()
  await page.evaluateOnNewDocument(contentScript)
  await page.goto('https://news.ycombinator.com')
  const result = await page.evaluate(
    domQuery => makeRequest && makeRequest(domQuery),
    {
      query: gql`
        query PuppeteerNoExt {
          document {
            articles: selectAll(selector: "tr.athing")
              @output(name: "article", includeResult: true, forEach: true) {
              link: select(selector: ".storylink") {
                innerText @trim
                href: attr(name: "href")
              }
              info: next {
                score: select(selector: ".score") {
                  innerText @number
                }
                age: select(selector: ".age") {
                  innerText
                }
                comments: select(selector: ".subtext > a:last-of-type") {
                  innerText @number
                }
              }
            }
          }
        }
      `,
    }
  )

  console.dir(result, { depth: 8 })
  browser.close()
}
browserQuery({ concurrency: 3 })
