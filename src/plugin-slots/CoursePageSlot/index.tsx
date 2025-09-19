import { PageWrap } from '@edx/frontend-platform/react';
import { PluginSlot } from '@openedx/frontend-plugin-framework';
import PageNotFound from '@src/generic/PageNotFound';
import { Route, Routes } from 'react-router-dom';

export const CoursePageSlot = () => (
  <PluginSlot id="org.openedx.frontend.learning.page.v1">
    <Routes>
      <Route path="*" element={<PageWrap><PageNotFound /></PageWrap>} />
    </Routes>
  </PluginSlot>
);
