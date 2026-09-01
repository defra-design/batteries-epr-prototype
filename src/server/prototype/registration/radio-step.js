import { createRadioStep } from '../radio-step.js'
import * as helpers from './shared.js'

export const createRadioStepController = (config) =>
  createRadioStep({ helpers, target: 'draft', ...config })
