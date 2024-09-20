import { getConfig } from '@edx/frontend-platform';
import { stringifyUrl } from 'query-string';

export const iframeParams = {
  show_title: 0,
  show_bookmark: 0,
  recheck_access: 1,
};

export const getIFrameUrl = ({
  id,
  view,
  format,
  examAccess,
  jumpToId,
}) => {
  const xblockUrl = `${getConfig().LMS_BASE_URL}/xblock/${id}`;
  return stringifyUrl({
    url: xblockUrl,
    query: {
      ...iframeParams,
      view,
      ...(format && { format }),
      ...(!examAccess.blockAccess && { exam_access: examAccess.accessToken }),
      jumpToId, // Pass jumpToId as query param as fragmentIdentifier is not passed to server.
    },
    fragmentIdentifier: jumpToId, // this is used by browser to scroll to correct block.
  });
};

export default {
  getIFrameUrl,
};
