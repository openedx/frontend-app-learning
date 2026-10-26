import { render, screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { dataEngineeringAchievements } from '@src/pathways/data/__fixtures__/pathways';

import { CertificateCard } from './CertificateCard';

const [pathwayCertificate, itemCertificate] = dataEngineeringAchievements;

const renderComponent = (achievement: typeof pathwayCertificate) => render(
  <IntlProvider locale="en">
    <CertificateCard categoryLabel="Bootcamp" {...achievement} />
  </IntlProvider>,
);

describe('CertificateCard', () => {
  it('shows the certificate details', () => {
    renderComponent(itemCertificate);

    expect(screen.getByText(itemCertificate.displayName)).toBeInTheDocument();
    expect(screen.getByText(itemCertificate.providerName)).toBeInTheDocument();
    expect(screen.getByText(/^Completed on/)).toBeInTheDocument();
    expect(screen.getByText(itemCertificate.credentialId)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View certificate' })).toBeInTheDocument();
  });

  it('names the pathway category in the certificate of the pathway itself', () => {
    renderComponent(pathwayCertificate);

    expect(screen.getByText('Bootcamp certificate')).toBeInTheDocument();
  });

  it('shows a generic label in the certificate of an item', () => {
    renderComponent(itemCertificate);

    expect(screen.getByText('Certificate')).toBeInTheDocument();
    expect(screen.queryByText('Bootcamp certificate')).not.toBeInTheDocument();
  });
});
