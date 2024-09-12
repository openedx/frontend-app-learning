// frontend-platform currently doesn't provide types... do it ourselves for i18n module at least.
// We can remove this in the future when we migrate to frontend-shell, or when frontend-platform gets types
// (whichever comes first).

declare module '@edx/frontend-platform/i18n' {
  // eslint-disable-next-line import/no-extraneous-dependencies
  import { injectIntl as _injectIntl } from 'react-intl';
  /** @deprecated Use useIntl() hook instead. */
  export const injectIntl: typeof _injectIntl;
  /** @deprecated Use useIntl() hook instead. */
  export const intlShape: any;

  // eslint-disable-next-line import/no-extraneous-dependencies
  export {
    createIntl,
    FormattedDate,
    FormattedTime,
    FormattedRelativeTime,
    FormattedNumber,
    FormattedPlural,
    FormattedMessage,
    defineMessages,
    IntlProvider,
    useIntl,
  } from 'react-intl';

  // Other exports from the i18n module:
  export const configure: any;
  export const getPrimaryLanguageSubtag: (code: string) => string;
  export const getLocale: (locale?: string) => string;
  export const getMessages: any;
  export const isRtl: (locale?: string) => boolean;
  export const handleRtl: any;
  export const mergeMessages: any;
  export const LOCALE_CHANGED: any;
  export const LOCALE_TOPIC: any;
  export const getCountryList: any;
  export const getCountryMessages: any;
  export const getLanguageList: any;
  export const getLanguageMessages: any;
}
