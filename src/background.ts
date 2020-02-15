// fetch('http://news.ycombinator.com').then(console.log)
browser.runtime.onMessage.addListener(
  async (
    request: any,
    sender: any
    // sendResponse: (message: any) => void
  ) => {
    console.log({ request }, sender)
    if (request.newBackgroundQuery) {
      const newTab = await browser.tabs.create({
        active: false,
        url: 'https://google.com',
      })
      console.log({ newTab })

      browser.tabs.executeScript(newTab.id, {
        file: 'js/content-script.js',
        runAt: 'document_start',
      })
      setTimeout(async () => {
        if (newTab.id) {
          const test = browser.tabs
            .sendMessage(newTab.id, {
              query: `query test { __typename }`,
            })
            .then(console.log)
            .catch(console.log)
          //   console.log(test)
        }
      }, 1000)
    }
  }
)
/*
 */
