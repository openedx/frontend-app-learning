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
// no need to import en messages-- they are in the defaultMessage field

const messages = {
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
};

export default messages;
