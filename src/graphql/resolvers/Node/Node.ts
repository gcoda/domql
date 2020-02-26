import NodeInterface from './NodeInterface'
import PQueue from 'p-queue'
import finder from '@medv/finder'
import { select, selectAll } from '@/graphql/resolvers/common/SelectResolver'
import { echo } from '@/graphql/resolvers/common/Echo'

const clickQueue = new PQueue({ concurrency: 1 })

export default {
  echo,
  select,
  selectAll,
  selector: (root, args, { document }) => {
    if (!root?.node) return null
    return finder(root?.node, {
      root: root?.node?.parentElement || document.body,
    })
  },
  selectors: (root, args, { document }) => {
    const {
      selector = '*',
      options: {
        fromRoot = false,
        optimizedMinLength = 2,
        seedMinLength = 1,
        tagName = true,
        idName = false,
      } = {},
    } = args || {}

    const allElements = root?.node?.querySelectorAll(selector)
    if (!allElements) {
      return null
    }
    const uniqSelectors: any[] = []
    for (let index = 0; index < allElements.length; index++) {
      //uniqSelectors
      const selector = finder(allElements[index], {
        root: fromRoot ? document.body : root?.node,
        optimizedMinLength,
        seedMinLength,
        tagName: () => tagName,
        idName: () => idName,
      })
      uniqSelectors.push(selector)
    }
    return uniqSelectors
  },
  attr: (root, { name = '' }) => root?.node?.getAttribute(name),
  text: root => {
    // console.log(root)
    return root?.node?.textContent
  },
  innerText: root => root?.node?.innerText,
  html: root => root?.node?.innerHTML,
  parent: root => ({
    __typename: 'Node',
    node: root?.node?.parentElement,
  }),
  next: root => ({
    __typename: 'Node',
    node: root?.node?.nextElementSibling,
  }),
  attributes: root =>
    !root?.node?.attributes
      ? null
      : Object.fromEntries(
          [...root.node.attributes].map(a => [a.name, a.value])
        ),
  classList: root => root?.node?.getAttribute('class')?.split(' '),

  click: async (root, { selector, waitForSelector, wait = 0.2 }) => {
    if (!root?.node) return null

    return clickQueue.add(async () => {
      if (selector) {
        root.node?.querySelector(selector)?.click()
      } else {
        root.node?.click()
      }
      if (waitForSelector) {
        let interval: null | NodeJS.Timeout = null
        let counter = 0
        await new Promise(resolve => {
          interval = setInterval(() => {
            counter++
            setTimeout(() => {
              const el = root?.node?.parentElement?.querySelector(
                waitForSelector
              )
              if (el || counter > 30) {
                resolve()
              }
            }, wait * 1000)
          }, 200)
        })
        if (interval) clearInterval(interval)
      }
      return { __typename: 'Node', node: root?.node }
    })
  },
  childNodes: (root, { selector }) =>
    !selector || !root?.node?.childNodes
      ? []
      : [...root.node.childNodes].map(node => root),
  scrollIntoView: (root, __, { document }) => {
    root?.node?.scrollIntoView()
    return { document }
  },
  root: (_, __, { document }) => document,
} as NodeInterface
