import { Slot } from '@openedx/frontend-base';

import NextButton from '@src/courseware/course/sequence/sequence-navigation/generic/NextButton';

export const nextUnitTopNavTriggerSlotId = 'org.openedx.frontend.slot.learning.nextUnitTopNavTrigger.v1';

export interface NextUnitTopNavTriggerSlotProps {
  disabled: boolean;
  buttonText?: string;
  nextLink?: string;
  sequenceId: string;
  onClickHandler: () => void;
  variant: string;
  buttonStyle: string;
  isAtTop?: boolean;
}

const NextUnitTopNavTriggerSlot = ({
  disabled, buttonText, nextLink, sequenceId, onClickHandler, variant, buttonStyle, isAtTop,
}: NextUnitTopNavTriggerSlotProps) => (
  <Slot
    id={nextUnitTopNavTriggerSlotId}
    disabled={disabled}
    buttonText={buttonText}
    nextLink={nextLink}
    sequenceId={sequenceId}
    onClickHandler={onClickHandler}
    variant={variant}
    buttonStyle={buttonStyle}
    isAtTop={isAtTop}
  >
    <NextButton
      variant={variant}
      buttonStyle={buttonStyle}
      onClickHandler={onClickHandler}
      nextLink={nextLink}
      disabled={disabled}
      buttonText={buttonText}
      isAtTop={isAtTop}
    />
  </Slot>
);

export default NextUnitTopNavTriggerSlot;
