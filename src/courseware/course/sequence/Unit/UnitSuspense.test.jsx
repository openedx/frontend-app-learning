import { render, screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { useUnit } from '@src/courseware/data/apiHooks';
import { useModel } from '@src/generic/model-store';
import hooks from './hooks';
import { modelKeys } from './constants';

import UnitSuspense from './UnitSuspense';

jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  defineMessages: m => m,
}));

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  Suspense: 'Suspense',
}));

jest.mock('../honor-code', () => jest.fn(() => <div>HonorCode</div>));
jest.mock('../lock-paywall', () => jest.fn(() => <div>LockPaywall</div>));
jest.mock('@src/courseware/data/apiHooks', () => ({ useUnit: jest.fn() }));
jest.mock('@src/generic/model-store', () => ({ useModel: jest.fn() }));

jest.mock('./hooks', () => ({
  useShouldDisplayHonorCode: jest.fn(() => false),
}));

const mockModels = (enabled, containsContent) => {
  useUnit.mockReturnValue({ data: { containsContentTypeGatedContent: containsContent } });
  useModel.mockReturnValue({ contentTypeGatingEnabled: enabled });
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
    it('reads the unit from its sequence and the courseware metadata model', () => {
      render(<IntlProvider locale="en"><UnitSuspense {...props} /></IntlProvider>);
      expect(useUnit).toHaveBeenCalledWith('test-sequence-id', props.id);
      expect(useModel).toHaveBeenCalledWith(modelKeys.coursewareMeta, props.courseId);
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
        it('displays LockPaywall in Suspense wrapper with PageLoading fallback', () => {
          hooks.useShouldDisplayHonorCode.mockReturnValueOnce(false);
          render(<IntlProvider locale="en"><UnitSuspense {...props} /></IntlProvider>);
          const lockPaywall = screen.getByText('LockPaywall');
          expect(lockPaywall).toBeInTheDocument();
          const suspenseWrapper = lockPaywall.closest('suspense');
          expect(suspenseWrapper).toBeInTheDocument();
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
      it('displays HonorCode component in Suspense wrapper with PageLoading fallback if shouldDisplayHonorCode', () => {
        hooks.useShouldDisplayHonorCode.mockReturnValueOnce(true);
        render(<IntlProvider locale="en"><UnitSuspense {...props} /></IntlProvider>);
        const honorCode = screen.getByText('HonorCode');
        expect(honorCode).toBeInTheDocument();
        const suspenseWrapper = honorCode.closest('suspense');
        expect(suspenseWrapper).toBeInTheDocument();
      });
    });
  });
});
