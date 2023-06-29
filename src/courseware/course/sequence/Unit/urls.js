import { getConfig } from '@edx/frontend-platform';
import { stringify } from 'query-string';

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
}) => {
  const xblockUrl = `${getConfig().LMS_BASE_URL}/xblock/${id}`;
  const params = stringify({
    ...iframeParams,
    view,
    ...(format && { format }),
    ...(!examAccess.blockAccess && { exam_access: examAccess.accessToken }),
  });
  return `${xblockUrl}?${params}`;
};

export default {
  getIFrameUrl,
};
