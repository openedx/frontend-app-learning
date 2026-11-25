import { resolveRouteByRole } from '@openedx/frontend-base';

import { discussionsSidebarRole } from '@src/constants';

/*
 * The URL the discussions panel embeds for a unit: the route the site provides for the discussions sidebar role (an
 * installed app's chromeless route, or an external route), plus `/<course id>/category/<unit id>`. `null` when
 * nothing provides the role, in which case the widget is not available at all.
 */
export const getDiscussionsSidebarUrl = (courseId: string, unitId: string): string | null => {
  const route = resolveRouteByRole(discussionsSidebarRole);
  if (!route) {
    return null;
  }
  return `${route.url.replace(/\/+$/, '')}/${courseId}/category/${unitId}`;
};
