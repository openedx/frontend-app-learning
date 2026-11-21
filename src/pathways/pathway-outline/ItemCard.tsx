import { FormattedMessage } from "@edx/frontend-platform/i18n";
import { ActionRow, Button, Card, Icon, Stack } from "@openedx/paragon";
import { PathwayItemData, StartedStatuses } from "pathways/data/types";
import { messages, getItemMessage } from "./messages";
import { Award, Flag, LaptopWindows } from "@openedx/paragon/icons";

const ITEM_STATUS_ICONS: Record<StartedStatuses, React.ComponentType> = {
  'in-progress': LaptopWindows,
  'not-passed': Award,
  'passed': Flag,
};

const ITEM_STATUS_COLORS: Record<StartedStatuses, string> = {
  'in-progress': 'text-primary-300',
  'not-passed': 'text-danger-400',
  'passed': 'text-success-400',
};

const ItemCardTitleSection = ({ item }: { item: PathwayItemData }) => (
  <Card.Section>
    <h3>{item.displayName}</h3>
    <Stack direction='horizontal' gap={1}>
      <FormattedMessage {...getItemMessage(item.type).itemLabel} />
      <span>·</span>
      <FormattedMessage
        {...messages.itemEnds}
        values={{ date: item.endDate }}
      />
      {item.hasCertificate && (
        <>
          <span>·</span>
          <FormattedMessage {...messages.certificateAvailable} />
        </>
      )}
    </Stack>
  </Card.Section>
);

const NotStartedItemCard = ({ item }: { item: PathwayItemData }) => (
  <Card className='bg-light-200' orientation='horizontal'>
    <ItemCardTitleSection item={item} />
    <Card.Footer className="w-auto flex-shrink-0">
      <ActionRow>
        <Button>
          <FormattedMessage {...getItemMessage(item.type).beginBtn} />
        </Button>
      </ActionRow>
    </Card.Footer>
  </Card>
);

const StartedItemCard = ({ item }: { item: PathwayItemData }) => {
  return (
    <Card orientation='horizontal'>
      <ItemCardTitleSection item={item} />
      <Card.Footer className="w-auto flex-shrink-0">
        <ActionRow>
          <Stack gap={2} direction="horizontal">
            <Icon className={ITEM_STATUS_COLORS[item.status]} src={ITEM_STATUS_ICONS[item.status]} />
            <small>
              <FormattedMessage {...messages[`itemStatusLabel-${item.status}`]} />
            </small>
          </Stack>
        </ActionRow>
      </Card.Footer>
    </Card>
  );
};

export const ItemCard = ({ item }: { item: PathwayItemData }) => {
  if (item.status === 'not-started') {
    return <NotStartedItemCard item={item} />
  }

  return <StartedItemCard item={item} />
};
