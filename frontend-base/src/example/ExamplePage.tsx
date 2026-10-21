import { Container } from '@openedx/paragon';
import ExampleSlot from '@src/slots/ExampleSlot/ExampleSlot';

const ExamplePage = () => (
  <main>
    <Container className="py-5">
      <h1>Example Page</h1>
      <p>Hello world!</p>
      <ExampleSlot />
    </Container>
  </main>
);

export default ExamplePage;
