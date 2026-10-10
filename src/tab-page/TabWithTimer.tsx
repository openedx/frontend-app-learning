import React from 'react';
import { OuterExamTimer } from '@edx/frontend-lib-special-exams';

import SpecialExamsProvider from '@src/generic/special-exams/SpecialExamsProvider';

import TabPage, { type TabPageProps } from './TabPage';

const TabWithTimer = ({ courseId, children, ...rest }: TabPageProps) => (
  <TabPage courseId={courseId} {...rest}>
    {courseId && (
      <SpecialExamsProvider>
        <OuterExamTimer courseId={courseId} />
      </SpecialExamsProvider>
    )}
    {children}
  </TabPage>
);

export default TabWithTimer;
