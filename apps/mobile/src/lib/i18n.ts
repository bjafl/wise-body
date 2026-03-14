import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import enCommon from '@/locales/en/common.json'
import enUser from '@/locales/en/user.json'
import enEnergy from '@/locales/en/energy.json'
import nbCommon from '@/locales/nb/common.json'
import nbUser from '@/locales/nb/user.json'
import nbEnergy from '@/locales/nb/energy.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'nb'],
    defaultNS: 'common',
    resources: {
      en: { common: enCommon, user: enUser, energy: enEnergy },
      nb: { common: nbCommon, user: nbUser, energy: nbEnergy },
    },
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      cacheUserLanguage: true,
    },
  })

export default i18n
export type SupportedLocale = 'en' | 'nb'
