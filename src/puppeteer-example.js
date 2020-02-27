const path = require('path')
const puppeteer = require('puppeteer-core')
const fs = require('fs')

const gql = String.raw
const extensionPath = path.resolve(__dirname, '..', 'dist')
const extensionName = 'DomQl'
const setConcurrency = () => undefined
const makeRequest = () => Promise.resolve(null)

const findBackgroundPage = async targets => {
  const extensionTarget = targets.find(
    ({ _targetInfo }) =>
      `${_targetInfo.title}`.toLowerCase() ===
        `${extensionName}`.toLowerCase() &&
      _targetInfo.type === 'background_page'
  )
  const page = await extensionTarget.page()
  if (!page) throw new Error('Background Page Not Found')
  return page
}

const browserQuery = async ({ concurrency = 3 } = {}) => {
  const browser = await puppeteer.launch({
    ignoreHTTPSErrors: true,
    headless: false, // extension are allowed only in the head-full mode
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      `--no-sandbox`,
    ],
    executablePath: '/usr/bin/google-chrome',
  })

  await browser.newPage()
  const targets = await browser.targets()
  const page = await findBackgroundPage(targets)
  if (!page) throw new Error('Background Page Not Found')

  await page.evaluate(
    concurrency => setConcurrency && setConcurrency(concurrency),
    concurrency
  )

  const result = await page.evaluate(
    domQuery => makeRequest && makeRequest(domQuery),
    {
      query: gql`
        query Puppeteer {
          document(location: "https://news.ycombinator.com") {
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

  const articles = result.data.document.articles

  // or use @output directive instead of data
  // const articles = result.outputs

  const contentQueries = articles
    // ! limit
    .slice(0, 15)
    //
    .map(article =>
      page.evaluate(domQuery => makeRequest && makeRequest(domQuery), {
        variables: {
          location: article.link.href,
          linkText: article.link.innerText,
          info: article.info,
        },
        query: gql`
          query MercuryParser(
            $location: String
            $info: JSON
            $linkText: String
          ) {
            document(location: $location, waitForSelector: "body") {
              linkLocation: echo(string: $location)
              linkText: echo(string: $linkText)
              info: echo(json: $info)
              mercury(contentType: markdown) {
                title
                lead_image_url
                content
              }
            }
          }
        `,
      })
    )
  const content = await Promise.all(contentQueries)
  fs.writeFileSync(
    path.resolve(__dirname, 'puppeteer-example.json'),
    JSON.stringify(content, null, 2)
  )
  console.dir(content, { depth: 8 })
  browser.close()
}
browserQuery({ concurrency: 3 })
