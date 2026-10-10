import { initializeMockApp, render, screen } from '@src/setupTest';

import CourseLicense from './CourseLicense';

initializeMockApp();

const licenseLink = () => screen.getByRole('link');

describe('CourseLicense', () => {
  it('shows all rights reserved when the course has no license', () => {
    render(<CourseLicense license={undefined} />);

    expect(screen.getByText('All Rights Reserved')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('shows all rights reserved for an all-rights-reserved license', () => {
    render(<CourseLicense license="all-rights-reserved" />);

    expect(screen.getByText('All Rights Reserved')).toBeInTheDocument();
  });

  it('links a Creative Commons license to its terms and version', () => {
    render(<CourseLicense license="creative-commons: ver=3.0 BY NC SA" />);

    expect(licenseLink()).toHaveAttribute('href', 'https://creativecommons.org/licenses/by-nc-sa/3.0/');
    expect(licenseLink()).toHaveTextContent('Attribution');
    expect(licenseLink()).toHaveTextContent('Noncommercial');
    expect(licenseLink()).toHaveTextContent('Share Alike');
  });

  it('defaults a Creative Commons license with terms but no version to 4.0', () => {
    render(<CourseLicense license="creative-commons: BY ND" />);

    expect(licenseLink()).toHaveAttribute('href', 'https://creativecommons.org/licenses/by-nd/4.0/');
    expect(licenseLink()).toHaveTextContent('No Derivatives');
  });

  it('links a Creative Commons license with no terms to CC0 1.0', () => {
    render(<CourseLicense license="creative-commons: ver=4.0" />);

    expect(licenseLink()).toHaveAttribute('href', 'https://creativecommons.org/licenses/zero/1.0/');
    expect(licenseLink()).toHaveTextContent('No terms');
  });
});
