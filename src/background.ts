// new WebSocket...
browser.runtime.onMessage.addListener(async (request: any, sender: any) => {
  if (request.backgroundQuery && request.location) {
    const newTab = await browser.tabs.create({
      active: false,
      url: request.location,
    })
    const tabId = newTab.id
    const windowId = newTab.windowId

    return !tabId
      ? { data: null, errors: [{ message: 'Error when creating new tab' }] }
      : browser.tabs
          .executeScript(tabId, {
            file: 'js/content-script.js',
            runAt: 'document_start',
          })
          .then(() =>
            browser.tabs
              .sendMessage(tabId, { ...request, tabId, windowId })
              .then(result => ({ ...result, tabId, windowId }))
              .catch(e => ({ data: null, errors: [{ message: e.message }] }))
          )
          .then(result => {
            browser.tabs.remove(tabId)
            return result
          })
  }
})
/*
 */
