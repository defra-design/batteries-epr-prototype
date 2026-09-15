import { paths } from '../../../../../../config/paths.js'
import { prototypeComplianceSchemeContent } from '../../../../../../config/prototype-compliance-scheme-content.js'
import {
  actionWithReturn,
  basePageModel,
  buildHydrationPayload,
  buildStepPayload,
  errorListToMap,
  flashStepErrors,
  readStepErrors,
  returnUrlFromRequest
} from '../shared.js'

const STEP_ID = 'dateJoined'

const pad2 = (value) => String(value).padStart(2, '0')

const validateDate = (payload) => {
  const day = payload['dateJoined-day']?.trim()
  const month = payload['dateJoined-month']?.trim()
  const year = payload['dateJoined-year']?.trim()

  if (!day || !month || !year) return 'required'

  const d = Number(day)
  const m = Number(month)
  const y = Number(year)
  if (!Number.isInteger(d) || !Number.isInteger(m) || !Number.isInteger(y)) {
    return 'invalid'
  }

  const date = new Date(Date.UTC(y, m - 1, d))
  const isRealDate =
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  if (!isRealDate) return 'invalid'

  const now = new Date()
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  )
  if (date > today) return 'future'

  return null
}

const renderView = (h, pageContent, action, viewModel) =>
  h.view('prototype/complianceScheme/membersList/addMember/dateJoined/view', {
    ...basePageModel(pageContent),
    errorTitle: pageContent.error.title,
    action,
    backLink: paths.prototypeMembersListAddMemberTonnage,
    ...viewModel
  })

export const dateJoinedController = {
  get: {
    handler(request, h) {
      const pageContent =
        prototypeComplianceSchemeContent.membersList.addMember.dateJoined
      const { errors, values } = readStepErrors(request, STEP_ID)
      const returnUrl = returnUrlFromRequest(request)

      return renderView(
        h,
        pageContent,
        actionWithReturn(
          paths.prototypeMembersListAddMemberDateJoined,
          returnUrl
        ),
        {
          errorSummary: errors || [],
          errors: errorListToMap(errors),
          formValues: values || {},
          pagePayload: buildHydrationPayload(STEP_ID, {
            skipHydration: !!errors
          })
        }
      )
    }
  },

  post: {
    handler(request, h) {
      const pageContent =
        prototypeComplianceSchemeContent.membersList.addMember.dateJoined
      const returnUrl = returnUrlFromRequest(request)
      const errorKey = validateDate(request.payload)

      if (errorKey) {
        const list = [
          { text: pageContent.error[errorKey], href: '#dateJoined-day' }
        ]
        flashStepErrors(request, STEP_ID, list, request.payload)
        return h.redirect(
          actionWithReturn(
            paths.prototypeMembersListAddMemberDateJoined,
            returnUrl
          )
        )
      }

      const day = pad2(request.payload['dateJoined-day'].trim())
      const month = pad2(request.payload['dateJoined-month'].trim())
      const year = request.payload['dateJoined-year'].trim()

      return renderView(
        h,
        pageContent,
        actionWithReturn(
          paths.prototypeMembersListAddMemberDateJoined,
          returnUrl
        ),
        {
          errorSummary: [],
          errors: {},
          formValues: request.payload,
          pagePayload: buildStepPayload(
            STEP_ID,
            'draft',
            { dateJoinedIso: `${year}-${month}-${day}` },
            returnUrl
          )
        }
      )
    }
  }
}
