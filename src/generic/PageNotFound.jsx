import { getConfig } from '@edx/frontend-platform';
import { Hyperlink } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import FooterSlot from '@openedx/frontend-slot-footer';

import HeaderSlot from '../plugin-slots/HeaderSlot';
import messages from './messages';

const PageNotFound = () => {
  const { formatMessage } = useIntl();

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
