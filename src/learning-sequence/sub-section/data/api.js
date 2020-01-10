import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

/* eslint-disable import/prefer-default-export */

const getSubSectionXModuleHandlerUrl = (courseId, subSectionId) =>
  `${getConfig().LMS_BASE_URL}/courses/${courseId}/xblock/${subSectionId}/handler/xmodule_handler`;

export async function getSubSectionMetadata(courseId, subSectionId) {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getSubSectionXModuleHandlerUrl(courseId, subSectionId)}/metadata`, {});

  return data;
}

export async function saveSubSectionPosition(courseId, subSectionId, position) {
  // Post data sent to this endpoint must be url encoded
  // TODO: Remove the need for this to be the case.
  // TODO: Ensure this usage of URLSearchParams is working in Internet Explorer
  const urlEncoded = new URLSearchParams();
  urlEncoded.append('position', position);
  const requestConfig = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  };

  const { data } = await getAuthenticatedHttpClient().post(
    `${getSubSectionXModuleHandlerUrl(courseId, subSectionId)}/goto_position`,
    urlEncoded.toString(),
    requestConfig,
  );

  return data;
}
