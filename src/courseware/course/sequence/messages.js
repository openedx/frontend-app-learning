import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'learn.loading.content.lock': {
    id: 'learn.loading.content.lock',
    defaultMessage: 'Loading locked content messaging...',
    description: 'Message shown when an interface about locked content is being loaded',
  },
  'learn.loading.honor.code': {
    id: 'learn.loading.honor.codk',
    defaultMessage: 'Loading honor code messaging...',
    description: 'Message shown when an interface about the honor code is being loaded',
  },
  'learn.loading.learning.sequence': {
    id: 'learn.loading.learning.sequence',
    defaultMessage: 'Loading learning sequence...',
    description: 'Message when learning sequence is being loaded',
  },
  'learn.course.load.failure': {
    id: 'learn.course.load.failure',
    defaultMessage: 'There was an error loading this course.',
    description: 'Message when a course fails to load',
  },
  'learn.sequence.no.content': {
    id: 'learn.sequence.no.content',
    defaultMessage: 'There is no content here.',
    description: 'Message shown when there is no content to show a user inside a learning sequence.',
  },
  'learn.header.h2.placeholder': {
    id: 'learn.header.h2.placeholder',
    defaultMessage: 'Level 2 headings may be created by course providers in the future.',
    description: 'Message spoken by a screenreader indicating that the h2 tag is a placeholder.',

  },
});

export default messages;
