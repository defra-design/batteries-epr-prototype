import { statusCodes } from '../common/constants/status-codes.js'

export const healthController = (_request, h) => {
  return h.response({ status: 'OK' }).code(statusCodes.ok)
}
