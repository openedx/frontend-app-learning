import { renderHook, screen } from '@testing-library/react';
import { useLocation } from 'react-router-dom';

import { renderStandalone, standalonePath } from '@src/tests/render';
import {
  CourseParamsProvider, useCourseId, useIsPreview, useSequenceId, useTargetUserId, useUnitId,
} from '.';

const courseId = 'course-v1:edX+DemoX+Demo_Course';
const sequenceId = 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@basic';
const unitId = 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@unit';

const ParamsProbe = () => (
  <dl>
    <dt>path</dt><dd data-testid="path">{useLocation().pathname}</dd>
    <dt>course</dt><dd data-testid="courseId">{useCourseId()}</dd>
    <dt>sequence</dt><dd data-testid="sequenceId">{useSequenceId() ?? 'none'}</dd>
    <dt>unit</dt><dd data-testid="unitId">{useUnitId() ?? 'none'}</dd>
    <dt>learner</dt><dd data-testid="targetUserId">{useTargetUserId() ?? 'none'}</dd>
    <dt>preview</dt><dd data-testid="isPreview">{String(useIsPreview())}</dd>
  </dl>
);

describe('CourseParamsProvider', () => {
  it('gives its props to the hooks, at a path that is not Learning\'s', () => {
    renderStandalone(
      <CourseParamsProvider courseId={courseId} sequenceId={sequenceId} unitId={unitId} targetUserId="42" isPreview>
        <ParamsProbe />
      </CourseParamsProvider>,
    );

    expect(screen.getByTestId('path')).toHaveTextContent(standalonePath);
    expect(screen.getByTestId('courseId')).toHaveTextContent(courseId);
    expect(screen.getByTestId('sequenceId')).toHaveTextContent(sequenceId);
    expect(screen.getByTestId('unitId')).toHaveTextContent(unitId);
    expect(screen.getByTestId('targetUserId')).toHaveTextContent('42');
    expect(screen.getByTestId('isPreview')).toHaveTextContent('true');
  });

  it('leaves the optional params unset, and preview off, when not given', () => {
    renderStandalone(<CourseParamsProvider courseId={courseId}><ParamsProbe /></CourseParamsProvider>);

    expect(screen.getByTestId('courseId')).toHaveTextContent(courseId);
    expect(screen.getByTestId('sequenceId')).toHaveTextContent('none');
    expect(screen.getByTestId('unitId')).toHaveTextContent('none');
    expect(screen.getByTestId('targetUserId')).toHaveTextContent('none');
    expect(screen.getByTestId('isPreview')).toHaveTextContent('false');
  });

  it('follows its props when they change', () => {
    const { rerender } = renderStandalone(
      <CourseParamsProvider courseId={courseId} sequenceId={sequenceId}><ParamsProbe /></CourseParamsProvider>,
    );
    rerender(<CourseParamsProvider courseId={courseId} sequenceId="another"><ParamsProbe /></CourseParamsProvider>);

    expect(screen.getByTestId('sequenceId')).toHaveTextContent('another');
  });

  it.each([
    ['useCourseId', useCourseId],
    ['useSequenceId', useSequenceId],
    ['useUnitId', useUnitId],
    ['useTargetUserId', useTargetUserId],
    ['useIsPreview', useIsPreview],
  ])('%s throws outside a provider', (name, hook) => {
    // React reports the thrown render error on console.error; silence it, not the assertion.
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => hook())).toThrow(`${name} must be used within a CourseParamsProvider`);

    consoleError.mockRestore();
  });
});
