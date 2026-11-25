/**
 * The course access redirects: where `getAccessDeniedRedirectUrl` (shared/access.js) and the access-denied page send a
 * learner, under `redirect/`.  Each child of the redirect route redirects from its loader, before anything renders.
 */
import {
  getAppConfig, getSiteConfig, getUrlByRouteRole, resolveRouteByRole,
} from '@openedx/frontend-base';
import { type LoaderFunctionArgs, redirect } from 'react-router-dom';

import { appId, courseOutlineRole, dashboardRole } from '@src/constants';
import { decodeUrl } from '@src/decode-page-route';

// A loader runs before DecodePageRoute could render, so it decodes the course id itself.
const getCourseId = ({ params }: LoaderFunctionArgs) => decodeUrl(params.courseId);

// The learner dashboard, as the site provides it; with none, the site's home.
export const dashboardLoader = () => redirect(getUrlByRouteRole(dashboardRole) ?? '/');

export const enterpriseLearnerDashboardLoader = () => {
  const portalUrl = getAppConfig(appId).ENTERPRISE_LEARNER_PORTAL_URL;
  return portalUrl ? redirect(`${portalUrl}`) : dashboardLoader();
};

export const surveyLoader = (args: LoaderFunctionArgs) => (
  redirect(`${getSiteConfig().lmsBaseUrl}/courses/${getCourseId(args)}/survey`)
);

// consentPath comes from the address, which anyone can write: only a path is followed, so the learner stays on the LMS.
const isPath = (value: string) => value.startsWith('/') && !value.startsWith('//');

export const consentLoader = ({ request }: LoaderFunctionArgs) => {
  const consentPath = new URL(request.url).searchParams.get('consentPath') ?? '';
  return redirect(`${getSiteConfig().lmsBaseUrl}${isPath(consentPath) ? consentPath : ''}`);
};

// Learning's own route: a client-side navigation.
export const homeLoader = (args: LoaderFunctionArgs) => (
  redirect(resolveRouteByRole(courseOutlineRole, { courseId: getCourseId(args) })!.url)
);
