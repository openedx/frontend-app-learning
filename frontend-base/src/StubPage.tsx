import { useParams } from 'react-router-dom';

interface StubPageProps {
  page: string;
}

// Stands in for a page until its port replaces it; deleted with the last port.
const StubPage = ({ page }: StubPageProps) => {
  const params = useParams();
  return (
    <main className="p-4">
      <p>{page}: not yet ported</p>
      <ul>
        {Object.entries(params).map(([name, value]) => <li key={name}>{`${name}=${value}`}</li>)}
      </ul>
    </main>
  );
};

export default StubPage;
