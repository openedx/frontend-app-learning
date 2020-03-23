import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const getSequenceXModuleHandlerUrl = (courseId, sequenceId) => `${getConfig().LMS_BASE_URL}/courses/${courseId}/xblock/${sequenceId}/handler/xmodule_handler`;

export async function getBlockCompletion(courseId, sequenceId, usageKey) {
  // Post data sent to this endpoint must be url encoded
  // TODO: Remove the need for this to be the case.
  // TODO: Ensure this usage of URLSearchParams is working in Internet Explorer
  const urlEncoded = new URLSearchParams();
  urlEncoded.append('usage_key', usageKey);
  const requestConfig = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  };

  const { data } = await getAuthenticatedHttpClient().post(
    `${getSequenceXModuleHandlerUrl(courseId, sequenceId)}/get_completion`,
    urlEncoded.toString(),
    requestConfig,
  );

  if (data.complete) {
    return true;
  }

  return false;
}

export async function updateSequencePosition(courseId, sequenceId, position) {
  // Post data sent to this endpoint must be url encoded
  // TODO: Remove the need for this to be the case.
  // TODO: Ensure this usage of URLSearchParams is working in Internet Explorer
  const urlEncoded = new URLSearchParams();
  // Position is 1-indexed on the server and 0-indexed in this app. Adjust here.
  urlEncoded.append('position', position + 1);
  const requestConfig = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  };

  const { data } = await getAuthenticatedHttpClient().post(
    `${getSequenceXModuleHandlerUrl(courseId, sequenceId)}/goto_position`,
    urlEncoded.toString(),
    requestConfig,
  );

  return data;
}
