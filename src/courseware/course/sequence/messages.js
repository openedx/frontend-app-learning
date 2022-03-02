import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  headerPlaceholder: {
    id: 'learn.header.h2.placeholder',
    defaultMessage: 'Level 2 headings may be created by course providers in the future.',
    description: 'Message spoken by a screenreader indicating that the h2 tag is a placeholder.',
  },
  loadFailure: {
    id: 'learn.course.load.failure',
    defaultMessage: 'There was an error loading this course.',
    description: 'Message when a course fails to load',
  },
  loadingHonorCode: {
    id: 'learn.loading.honor.codk',
    defaultMessage: 'Loading honor code messaging...',
    description: 'Message shown when an interface about the honor code is being loaded',
  },
  loadingLockedContent: {
    id: 'learn.loading.content.lock',
    defaultMessage: 'Loading locked content messaging...',
    description: 'Message shown when an interface about locked content is being loaded',
  },
  loadingSequence: {
    id: 'learn.loading.learning.sequence',
    defaultMessage: 'Loading learning sequence...',
    description: 'Message when learning sequence is being loaded',
  },
  noContent: {
    id: 'learn.sequence.no.content',
    defaultMessage: 'There is no content here.',
    description: 'Message shown when there is no content to show a user inside a learning sequence.',
  },
});

export default messages;
