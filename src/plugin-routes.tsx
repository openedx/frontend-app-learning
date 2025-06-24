import { getConfig } from '@edx/frontend-platform';
import { Route } from 'react-router-dom';
import { CoursePageSlot } from './plugin-slots/CoursePageSlot';
import DecodePageRoute from './decode-page-route';

type PluginRoute = {
  id: string,
  route: string,
};

export function getPluginRoutes() {
  return (getConfig()?.PLUGIN_ROUTES as PluginRoute[])?.map(({ route, id }) => (
    <Route
      key={route}
      path={route}
      element={(
        <DecodePageRoute>
          <CoursePageSlot pageId={id} />
        </DecodePageRoute>
      )}
    />
  )) ?? null;
}
