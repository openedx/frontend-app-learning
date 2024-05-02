import React from 'react';

import { formatMessage, shallow } from '@edx/react-unit-test-utils';

import { useModel } from '@src/generic/model-store';
import PageLoading from '@src/generic/PageLoading';

import messages from '../messages';
import HonorCode from '../honor-code';
import LockPaywall from '../lock-paywall';
import hooks from './hooks';
import { modelKeys } from './constants';

import UnitSuspense from './UnitSuspense';

jest.mock('@edx/frontend-platform/i18n', () => ({
  defineMessages: m => m,
  useIntl: () => ({ formatMessage: jest.requireActual('@edx/react-unit-test-utils').formatMessage }),
}));

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  Suspense: 'Suspense',
}));

jest.mock('../honor-code', () => 'HonorCode');
jest.mock('../lock-paywall', () => 'LockPaywall');
jest.mock('@src/generic/model-store', () => ({ useModel: jest.fn() }));
jest.mock('@src/generic/PageLoading', () => 'PageLoading');

jest.mock('./hooks', () => ({
  useShouldDisplayHonorCode: jest.fn(() => false),
}));

const mockModels = (enabled, containsContent) => {
  useModel.mockImplementation((key) => (
    key === modelKeys.units
      ? { containsContentTypeGatedContent: containsContent }
      : { contentTypeGatingEnabled: enabled }
  ));
};

const props = {
  courseId: 'test-course-id',
  id: 'test-id',
};

let el;
describe('UnitSuspense component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockModels(false, false);
  });
  describe('behavior', () => {
    it('initializes models', () => {
      el = shallow(<UnitSuspense {...props} />);
      const { calls } = useModel.mock;
      const [unitCall] = calls.filter(call => call[0] === modelKeys.units);
      const [metaCall] = calls.filter(call => call[0] === modelKeys.coursewareMeta);
      expect(unitCall[1]).toEqual(props.id);
      expect(metaCall[1]).toEqual(props.courseId);
    });
  });
  describe('output', () => {
    describe('LockPaywall', () => {
      const testNoPaywall = () => {
        it('does not display LockPaywall', () => {
          el = shallow(<UnitSuspense {...props} />);
          expect(el.instance.findByType(LockPaywall).length).toEqual(0);
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
          el = shallow(<UnitSuspense {...props} />);
          const [component] = el.instance.findByType(LockPaywall);
          expect(component.parent.type).toEqual('PluginSlot');
          expect(component.parent.parent.type).toEqual('Suspense');
          expect(component.parent.parent.props.fallback)
            .toEqual(<PageLoading srMessage={formatMessage(messages.loadingLockedContent)} />);
          expect(component.props.courseId).toEqual(props.courseId);
        });
      });
    });
    describe('HonorCode', () => {
      it('does not display HonorCode if useShouldDisplayHonorCode => false', () => {
        hooks.useShouldDisplayHonorCode.mockReturnValueOnce(false);
        el = shallow(<UnitSuspense {...props} />);
        expect(el.instance.findByType(HonorCode).length).toEqual(0);
      });
      it('displays HonorCode component in Suspense wrapper with PageLoading fallback if shouldDisplayHonorCode', () => {
        hooks.useShouldDisplayHonorCode.mockReturnValueOnce(true);
        el = shallow(<UnitSuspense {...props} />);
        const [component] = el.instance.findByType(HonorCode);
        expect(component.parent.type).toEqual('Suspense');
        expect(component.parent.props.fallback)
          .toEqual(<PageLoading srMessage={formatMessage(messages.loadingHonorCode)} />);
        expect(component.props.courseId).toEqual(props.courseId);
      });
    });
  });
});
