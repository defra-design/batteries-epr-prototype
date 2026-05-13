import { content } from '../../config/content.js'
import { paths } from '../../config/paths.js'

export const publicRegisterSearchController = {
  handler(request, h) {
    const pageContent = content.publicRegisterSearch(request)

    return h.view('publicRegister/search', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      intro: pageContent.intro,
      searchLabel: pageContent.searchLabel,
      searchHint: pageContent.searchHint,
      searchAction: pageContent.searchAction,
      searchUrl: paths.publicRegisterSearch,
      detailUrlTemplate: paths.publicRegisterDetail
    })
  }
}

export const publicRegisterDetailController = {
  handler(request, h) {
    const pageContent = content.publicRegisterDetail(request)

    return h.view('publicRegister/detail', {
      pageTitle: pageContent.title,
      heading: pageContent.heading,
      bprn: request.params.bprn,
      searchUrl: paths.publicRegisterSearch
    })
  }
}
