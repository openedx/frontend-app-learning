import { resolveRouteByRole } from '@openedx/frontend-base';
import { type LoaderFunctionArgs, redirect } from 'react-router-dom';

import { discussionsRole } from '@src/constants';
import { decodeUrl } from '@src/decode-page-route';

// An old discussion link into Learning, /course/:courseId/discussion/:path/*, goes to the same path in whatever
// provides the discussions role: an installed app's route, or an external route the site points at its
// discussions deployment. The role's URL is the base the course id and the path are appended to, as the legacy app's
// DISCUSSIONS_MFE_BASE_URL was. A loader runs before DecodePageRoute renders, so it decodes the params itself.
const discussionRedirectLoader = ({ params, request }: LoaderFunctionArgs) => {
  const discussions = resolveRouteByRole(discussionsRole);
  if (!discussions) {
    throw new Response(null, { status: 404 });
  }
  const base = discussions.url.replace(/\/+$/, '');
  const segments = [params.courseId, params.path, params['*']]
    .filter((segment): segment is string => !!segment)
    .map(decodeUrl);
  const { search } = new URL(request.url);
  return redirect(`${base}/${segments.join('/')}${search}`);
};

export default discussionRedirectLoader;
