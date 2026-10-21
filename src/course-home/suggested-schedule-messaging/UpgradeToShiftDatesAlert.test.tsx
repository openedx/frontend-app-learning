import { initializeMockApp, render, screen } from '../../setupTest';
import UpgradeToShiftDatesAlert from './UpgradeToShiftDatesAlert';

initializeMockApp();

describe('UpgradeToShiftDatesAlert', () => {
  it('renders without a click handler supplied', () => {
    render(<UpgradeToShiftDatesAlert datesBannerInfo={{
      contentTypeGatingEnabled: true,
      missedDeadlines: true,
      missedGatedContent: true,
      verifiedUpgradeLink: 'http://localhost:18130/basket/add/?sku=8CF08E5',
    }}
    />, { wrapWithRouter: true });

    expect(screen.getByRole('button', { name: 'Upgrade to shift due dates' })).toBeInTheDocument();
  });
});
