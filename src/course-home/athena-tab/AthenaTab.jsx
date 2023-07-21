import {
  Card, Button,
} from '@edx/paragon';

const colorVariants = ['brand', 'outline-brand', 'primary', 'outline-primary', 'tertiary'];

const CardComponent = () => {
  const randomIndex = Math.floor(Math.random() * colorVariants.length);
  const variant = colorVariants[randomIndex];

  return (
    <Card className="col col-3 mx-5 my-5">
      <Card.ImageCap
        src="fakeURL"
        fallbackSrc="https://picsum.photos/360/200/"
        srcAlt="Card image"
        logoSrc="fakeURL"
        fallbackLogoSrc="https://www.edx.org/images/logos/edx-logo-elm.svg"
        logoAlt="Card logo"
      />
      <Card.Header title="Title" subtitle="Subtitle" />
      <Card.Section title="Section title">
        This is a card section. It can contain anything but usually text, a list, or list of links.
        Multiple sections have a card divider between them.
      </Card.Section>
      <Card.Footer>
        <Button variant={variant}>Action 1</Button>
      </Card.Footer>
    </Card>
  );
};

const generateRandomId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 10; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

const data = Array.from({ length: 10 }).map(() => ({ id: generateRandomId() }));

const AthenaTab = () => (
  <>
    <div className="row">
      {data.map(({ id }) => <CardComponent key={id} />)}
    </div>

  </>
);

export default AthenaTab;
