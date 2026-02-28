import type enCommon from '@/locales/en/common.json'
import type enUser from '@/locales/en/user.json'
import type enEnergy from '@/locales/en/energy.json'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: {
      common: typeof enCommon
      user: typeof enUser
      energy: typeof enEnergy
    }
  }
}
