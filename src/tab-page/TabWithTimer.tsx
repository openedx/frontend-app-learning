import React from 'react';
import { OuterExamTimer } from '@edx/frontend-lib-special-exams';

import TabPage, { type TabPageProps } from './TabPage';

const TabWithTimer = ({ courseId, children, ...rest }: TabPageProps) => (
  <TabPage courseId={courseId} {...rest}>
    {courseId && <OuterExamTimer courseId={courseId} />}
    {children}
  </TabPage>
);

export default TabWithTimer;
