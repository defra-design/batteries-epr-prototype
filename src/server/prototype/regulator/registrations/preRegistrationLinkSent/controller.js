import { format, parseISO } from 'date-fns'

import { paths } from '../../../../../config/paths.js'
import { prototypeRegulatorRegistrationsContent } from '../../../../../config/prototype-regulator-registrations-content.js'
import { basePageModel } from '../shared.js'
import {
  getPreRegistrationInvite,
  resendPreRegistrationInvite
} from '../store.js'

export const sentController = {
  get: {
    handler(_request, h) {
      const invite = getPreRegistrationInvite()

      // Nothing sent yet (e.g. after "Reset data"): back to the form
      if (!invite) {
        return h.redirect(paths.prototypeRegulatorPreRegistrationLink)
      }

      const pageContent =
        prototypeRegulatorRegistrationsContent.preRegistrationLinkSent

      return h.view(
        'prototype/regulator/registrations/preRegistrationLinkSent/view',
        {
          ...basePageModel(pageContent, { currentNav: 'registrations' }),
          breadcrumbs: [
            { text: 'NPWD', href: paths.prototypeRegulatorHome },
            {
              text: prototypeRegulatorRegistrationsContent.registrations
                .heading,
              href: paths.prototypeRegulatorRegistrations
            }
          ],
          contact: invite.email,
          linkSent: format(parseISO(invite.sentAt), 'd MMMM yyyy'),
          resendHref: paths.prototypeRegulatorPreRegistrationLinkResend,
          backHref: paths.prototypeRegulatorRegistrations
        }
      )
    }
  },

  resend: {
    handler(_request, h) {
      resendPreRegistrationInvite()
      return h.redirect(paths.prototypeRegulatorPreRegistrationLinkSent)
    }
  }
}
