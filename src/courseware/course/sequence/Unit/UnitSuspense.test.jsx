import { render, screen } from '@testing-library/react';
import { IntlProvider } from '@openedx/frontend-base';

import { useCoursewareMetadata, useUnit } from '@src/courseware/data/apiHooks';
import hooks from './hooks';

import UnitSuspense from './UnitSuspense';

jest.mock('@openedx/frontend-base', () => ({
  ...jest.requireActual('@openedx/frontend-base'),
  defineMessages: m => m,
}));

jest.mock('../honor-code', () => jest.fn(() => <div>HonorCode</div>));
jest.mock('../lock-paywall', () => jest.fn(() => <div>LockPaywall</div>));
jest.mock('@src/courseware/data/apiHooks', () => ({ useCoursewareMetadata: jest.fn(), useUnit: jest.fn() }));

jest.mock('./hooks', () => ({
  useShouldDisplayHonorCode: jest.fn(() => false),
}));

const mockModels = (enabled, containsContent) => {
  useUnit.mockReturnValue({ data: { containsContentTypeGatedContent: containsContent } });
  useCoursewareMetadata.mockReturnValue({ data: { contentTypeGatingEnabled: enabled } });
};

const props = {
  courseId: 'test-course-id',
  sequenceId: 'test-sequence-id',
  id: 'test-id',
};

describe('UnitSuspense component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockModels(false, false);
  });
  describe('behavior', () => {
    it('reads the unit from its sequence and the courseware metadata query', () => {
      render(<IntlProvider locale="en"><UnitSuspense {...props} /></IntlProvider>);
      expect(useUnit).toHaveBeenCalledWith('test-sequence-id', props.id);
      expect(useCoursewareMetadata).toHaveBeenCalledWith(props.courseId, { enabled: false });
    });
  });
  describe('output', () => {
    describe('LockPaywall', () => {
      const testNoPaywall = () => {
        it('does not display LockPaywall', () => {
          render(<IntlProvider locale="en"><UnitSuspense {...props} /></IntlProvider>);
          const lockPaywall = screen.queryByText('LockPaywall');
          expect(lockPaywall).toBeNull();
        });
      };
      describe('gating not enabled', () => { testNoPaywall(); });
      describe('gating enabled, but no gated content included', () => {
        beforeEach(() => { mockModels(true, false); });
        testNoPaywall();
      });
      describe('gating enabled, gated content included', () => {
        beforeEach(() => { mockModels(true, true); });
        it('displays LockPaywall', () => {
          hooks.useShouldDisplayHonorCode.mockReturnValueOnce(false);
          render(<IntlProvider locale="en"><UnitSuspense {...props} /></IntlProvider>);
          expect(screen.getByText('LockPaywall')).toBeInTheDocument();
        });
      });
    });
    describe('HonorCode', () => {
      it('does not display HonorCode if useShouldDisplayHonorCode => false', () => {
        hooks.useShouldDisplayHonorCode.mockReturnValueOnce(false);
        render(<IntlProvider locale="en"><UnitSuspense {...props} /></IntlProvider>);
        const honorCode = screen.queryByText('HonorCode');
        expect(honorCode).toBeNull();
      });
      it('displays HonorCode if shouldDisplayHonorCode', () => {
        hooks.useShouldDisplayHonorCode.mockReturnValueOnce(true);
        render(<IntlProvider locale="en"><UnitSuspense {...props} /></IntlProvider>);
        expect(screen.getByText('HonorCode')).toBeInTheDocument();
      });
    });
  });
});
