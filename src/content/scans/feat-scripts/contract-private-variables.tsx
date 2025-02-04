import { createRoot } from 'react-dom/client'
import $ from 'jquery'

import { chromeEvent } from '@common/event'
import { GET_PRIVATE_VARIABLES } from '@common/constants'
import type {
  PrivateVariablesRes,
  PostPrivateVariablesParams
} from '@common/api/types'
import { pickAddress } from '@common/utils'

import { ReadContractAccordionItem } from '../components'

/** Show private variables */
const genContractPrivateVariables = async (chain: string) => {
  const readContractIframes = $('#readcontractiframe, #readproxycontractiframe')

  readContractIframes.each(function () {
    $(this).contents().find('body').css('height', 'fit-content')

    $(this).on('load', async () => {
      const isProxy = window.location.hash === '#readProxyContract'
      const mainAddress = pickAddress(window.location.pathname)
      const implAddress = pickAddress(
        $('#ContentPlaceHolder1_readProxyMessage').find('a').text()
      )
      if (!mainAddress || (isProxy && !implAddress)) return

      const params: PostPrivateVariablesParams = {
        chain: chain,
        address: mainAddress
      }

      if (isProxy) {
        params.implAddress = implAddress
      }

      const res = await chromeEvent.emit<
        typeof GET_PRIVATE_VARIABLES,
        PrivateVariablesRes
      >(GET_PRIVATE_VARIABLES, params)
      if (res?.success && res?.data) {
        const readContractAccordion = $(this)
          .contents()
          .find('#readContractAccordion')
        const lastIdx = readContractAccordion
          .children(':last-child')
          .find("a.btn[data-toggle='collapse']")
          .text()
          .split('.')[0]

        if (res.data.length) {
          const expandBtn = $(this).contents().find('a.expandCollapseAllButton')
          if (expandBtn.text().indexOf('Expand') !== -1) {
            expandBtn.bind('click', () => {
              setTimeout(() => {
                const iframeHeight = $(this).contents().find('body').height()
                if (iframeHeight) {
                  $(this).height(iframeHeight)
                }
              }, 1000)
            })
          }
        }

        res.data.forEach((item, index) => {
          const rootEl = document.createElement('div')
          readContractAccordion.append(rootEl)
          createRoot(rootEl).render(
            <ReadContractAccordionItem
              chain={chain}
              address={mainAddress}
              implAddress={implAddress}
              data={item}
              id={`accordion-${Number(lastIdx) + 1 + index}`}
            />
          )
        })
        requestIdleCallback(() => {
          const iframeHeight = $(this).contents().find('body').height()
          if (iframeHeight) {
            $(this).height(iframeHeight)
          }
        })
      }
    })
  })
}

export default genContractPrivateVariables
