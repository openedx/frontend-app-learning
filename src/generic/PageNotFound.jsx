import { getConfig } from '@edx/frontend-platform';
import { Hyperlink } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { FooterSlot } from '@edx/frontend-component-footer';

import HeaderSlot from '../plugin-slots/HeaderSlot';
import messages from './messages';

const PageNotFound = () => {
  const { formatMessage } = useIntl();
  const location = window.location.href;

  logError('Page failed to load, probably an invalid URL.', location);
  sendTrackEvent('edx.ui.lms.page_not_found', { location });

  return (
    <>
      <HeaderSlot />
      <main
        id="main-content"
        className="main-content d-flex justify-content-center align-items-center flex-column"
        style={{
          height: '50vh',
        }}
      >
        <h1 className="h3">
          {formatMessage(messages.pageNotFoundHeader)}
        </h1>
        <p>
          {formatMessage(
            messages.pageNotFoundBody,
            {
              homepageLink: (
                <Hyperlink destination={getConfig().LMS_BASE_URL}>
                  {formatMessage(messages.homepageLink)}
                </Hyperlink>
              ),
            },
          )}
        </p>
      </main>
      <FooterSlot />
    </>
  );
};

export default PageNotFound;
