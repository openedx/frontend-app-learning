import { Container } from '@openedx/paragon';
import { useParams } from 'react-router-dom';

interface StubPageProps {
  page: string;
}

// Stands in for a page until its port replaces it; deleted with the last port.
const StubPage = ({ page }: StubPageProps) => {
  const params = useParams();
  return (
    <Container as="main" size="xl" className="py-4">
      <p>{page}: not yet ported</p>
      <ul>
        {Object.entries(params).map(([name, value]) => <li key={name}>{`${name}=${value}`}</li>)}
      </ul>
    </Container>
  );
};

export default StubPage;
