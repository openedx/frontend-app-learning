import { WidgetOperationTypes } from '@openedx/frontend-base';
import { screen } from '@testing-library/react';

import { render } from '@src/tests/render';
import { addSlotOperations } from '@src/tests/slots';

import BannerDatesUpgradeSlot, { bannerDatesUpgradeSlotId } from '.';

jest.mock('@src/course-home/dates-tab/UpgradeToCompleteAlert', () => () => 'Upgrade to complete');

describe('BannerDatesUpgradeSlot', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';
  const logUpgradeLinkClick = jest.fn();

  it('renders the upgrade alert by default', () => {
    render(<BannerDatesUpgradeSlot courseId={courseId} logUpgradeLinkClick={logUpgradeLinkClick} />);

    expect(screen.getByText('Upgrade to complete')).toBeInTheDocument();
  });

  it('passes its props to a widget that replaces the default content', () => {
    const Widget = jest.fn<null, [object]>(() => null);
    addSlotOperations([{
      slotId: bannerDatesUpgradeSlotId,
      id: 'org.example.widget',
      op: WidgetOperationTypes.REPLACE,
      relatedId: 'defaultContent',
      component: Widget,
    }]);

    render(<BannerDatesUpgradeSlot courseId={courseId} logUpgradeLinkClick={logUpgradeLinkClick} />);

    expect(screen.queryByText('Upgrade to complete')).not.toBeInTheDocument();
    expect(Widget.mock.calls[0][0]).toEqual({ courseId, logUpgradeLinkClick });
  });
});
