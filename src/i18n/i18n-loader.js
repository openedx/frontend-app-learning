/**
 * For each locale we want to support, react-intl needs 1) the locale-data, which includes
 * information about how to format numbers, handle plurals, etc., and 2) the translations, as an
 * object holding message id / translated string pairs.  A locale string and the messages object are
 * passed into the IntlProvider element that wraps your element hierarchy.
 *
 * Note that react-intl has no way of checking if the translations you give it actually have
 * anything to do with the locale you pass it; it will happily use whatever messages object you pass
 * in.  However, if the locale data for the locale you passed into the IntlProvider was not
 * correctly installed with addLocaleData, all of your translations will fall back to the default
 * (in our case English), *even if you gave IntlProvider the correct messages object for that
 * locale*.
 */

import { addLocaleData } from 'react-intl';
import Cookies from 'universal-cookie';

import arLocale from 'react-intl/locale-data/ar';
import enLocale from 'react-intl/locale-data/en';
import es419Locale from 'react-intl/locale-data/es';
import frLocale from 'react-intl/locale-data/fr';
import zhcnLocale from 'react-intl/locale-data/zh';

import COUNTRIES, { langs as countryLangs } from 'i18n-iso-countries';
import LANGUAGES, { langs as languageLangs } from '@cospired/i18n-iso-languages';

import arMessages from './messages/ar.json';
// no need to import en messages-- they are in the defaultMessage field
import es419Messages from './messages/es_419.json';
import frMessages from './messages/fr.json';
import zhcnMessages from './messages/zh_CN.json';

addLocaleData([...arLocale, ...enLocale, ...es419Locale, ...frLocale, ...zhcnLocale]);

// TODO: When we start dynamically loading translations only for the current locale, change this.
COUNTRIES.registerLocale(require('i18n-iso-countries/langs/ar.json'));
COUNTRIES.registerLocale(require('i18n-iso-countries/langs/en.json'));
COUNTRIES.registerLocale(require('i18n-iso-countries/langs/es.json'));
COUNTRIES.registerLocale(require('i18n-iso-countries/langs/fr.json'));
COUNTRIES.registerLocale(require('i18n-iso-countries/langs/zh.json'));

// TODO: When we start dynamically loading translations only for the current locale, change this.
// TODO: Also note that Arabic (ar) and Chinese (zh) are missing here.  That's because they're
// not implemented in this library.  If you read this and it's been a while, go check and see
// if that's changed!
LANGUAGES.registerLocale(require('@cospired/i18n-iso-languages/langs/en.json'));
LANGUAGES.registerLocale(require('@cospired/i18n-iso-languages/langs/es.json'));
LANGUAGES.registerLocale(require('@cospired/i18n-iso-languages/langs/fr.json'));

const messages = { // current fallback strategy is to use the first two letters of the locale code
  ar: arMessages,
  es: es419Messages,
  fr: frMessages,
  zh: zhcnMessages,
};

const cookies = new Cookies();

const getTwoLetterLanguageCode = code => code.substr(0, 2);

// Get the locale by setting priority. Skip if we don't support that language.
const getLocale = (localeStr) => {
  // 1. Explicit application request
  if (localeStr && messages[localeStr] !== undefined) {
    return localeStr;
  }
  // 2. User setting in cookie
  const cookieLangPref = cookies.get(process.env.LANGUAGE_PREFERENCE_COOKIE_NAME);
  if (cookieLangPref && messages[getTwoLetterLanguageCode(cookieLangPref)] !== undefined) {
    return getTwoLetterLanguageCode(cookieLangPref);
  }
  // 3. Browser language (default)
  return getTwoLetterLanguageCode(window.navigator.language);
};

const getMessages = (locale = getLocale()) => messages[locale];

const rtlLocales = ['ar', 'he', 'fa', 'ur'];
const isRtl = locale => rtlLocales.includes(locale);

const handleRtl = () => {
  if (isRtl(getLocale())) {
    document.getElementsByTagName('html')[0].setAttribute('dir', 'rtl');
    document.styleSheets[0].disabled = true;
  } else {
    document.styleSheets[1].disabled = true;
  }
};

/**
 * Provides a lookup table of country IDs to country names for the current locale.
 */
const getCountryMessages = (locale) => {
  const finalLocale = countryLangs().includes(locale) ? locale : 'en';

  return COUNTRIES.getNames(finalLocale);
};

/**
 * Provides a lookup table of language IDs to language names for the current locale.
 */
const getLanguageMessages = (locale) => {
  const finalLocale = languageLangs().includes(locale) ? locale : 'en';

  return LANGUAGES.getNames(finalLocale);
};

const sortFunction = (a, b) => {
  // If localeCompare exists, use that.  (Not supported in some older browsers)
  if (typeof String.prototype.localeCompare === 'function') {
    return a[1].localeCompare(b[1], getLocale());
  }
  if (a[1] === b[1]) {
    return 0;
  }
  // Otherwise make a best effort.
  return a[1] > b[1] ? 1 : -1;
};

/**
 * Provides a list of countries represented as objects of the following shape:
 *
 * {
 *   key, // The ID of the country
 *   name // The localized name of the country
 * }
 *
 * The list is sorted alphabetically in the current locale.
 * This is useful for select dropdowns primarily.
 */
const getCountryList = (locale) => {
  const countryMessages = getCountryMessages(locale);
  return Object.entries(countryMessages)
    .sort(sortFunction)
    .map(([code, name]) => ({ code, name }));
};

/**
 * Provides a list of languages represented as objects of the following shape:
 *
 * {
 *   key, // The ID of the language
 *   name // The localized name of the language
 * }
 *
 * The list is sorted alphabetically in the current locale.
 * This is useful for select dropdowns primarily.
 */
const getLanguageList = (locale) => {
  const languageMessages = getLanguageMessages(locale);
  return Object.entries(languageMessages)
    .sort(sortFunction)
    .map(([code, name]) => ({ code, name }));
};

export {
  getCountryList,
  getCountryMessages,
  getLanguageList,
  getLanguageMessages,
  getLocale,
  getMessages,
  handleRtl,
  isRtl,
};
