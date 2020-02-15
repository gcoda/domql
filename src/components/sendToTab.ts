type DomQuery = {
  query: string
  variables?: { [k: string]: any }
}
export const sendToActiveTab = ({ query, variables }: DomQuery) => {
  return new Promise(resolve => {
    browser.windows.getCurrent().then(currentWindow => {
      const windowId = currentWindow.id
      browser.tabs.query({ active: true, windowId }).then(tab => {
        const tabId = tab[0]?.id
        try {
          if (tabId) {
            browser.tabs.sendMessage(tabId, { query, variables }).then(result =>
              result
                ? resolve({ ...result, tabId, windowId })
                : resolve({
                    data: null,
                    errors: [{ message: 'no result' }],
                    tabId,
                    windowId,
                  })
            )
          }
        } catch (e) {
          resolve({ data: null, errors: [{ message: e.message }] })
        }
      })
    })
  })
}
