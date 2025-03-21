import { getConfig } from '@edx/frontend-platform';
import { Route } from 'react-router-dom';
import { CoursePageSlot } from './plugin-slots/CoursePageSlot';
import DecodePageRoute from './decode-page-route';

export function getPluginRoutes() {
  return getConfig()?.PLUGIN_ROUTES?.map((route: string) => (
    <Route
      key={route}
      path={route}
      element={(
        <DecodePageRoute>
          <CoursePageSlot route={route} />
        </DecodePageRoute>
      )}
    />
  )) ?? null;
}
