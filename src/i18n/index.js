import { messages as footerMessages } from '@edx/frontend-component-footer';
import { messages as headerMessages } from '@edx/frontend-component-header';
import { messages as paragonMessages } from '@edx/paragon';

import arMessages from './messages/ar.json';
import frMessages from './messages/fr.json';
import es419Messages from './messages/es_419.json';
import zhcnMessages from './messages/zh_CN.json';
import ptMessages from './messages/pt.json';
import itMessages from './messages/it.json';
import ukMessages from './messages/uk.json';
import deMessages from './messages/de.json';
import ruMessages from './messages/ru.json';
import hiMessages from './messages/hi.json';
import faIRMessages from './messages/fa_IR.json';
import frCAMessages from './messages/fr_CA.json';
import dedeCAMessages from './messages/de_DE.json';
import ititCAMessages from './messages/it_IT.json';
import ptptCAMessages from './messages/pt_PT.json';
// no need to import en messages-- they are in the defaultMessage field

const appMessages = {
  ar: arMessages,
  'es-419': es419Messages,
  fr: frMessages,
  'zh-cn': zhcnMessages,
  pt: ptMessages,
  it: itMessages,
  de: deMessages,
  hi: hiMessages,
  'fa-ir': faIRMessages,
  'fr-ca': frCAMessages,
  ru: ruMessages,
  uk: ukMessages,
  'de-de': dedeCAMessages,
  'it-it': ititCAMessages,
  'pt-pt': ptptCAMessages,
};

export default [
  paragonMessages,
  appMessages,
  footerMessages,
  headerMessages,
];
