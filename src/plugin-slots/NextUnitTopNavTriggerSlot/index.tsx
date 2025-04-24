import React from 'react';

import { PluginSlot } from '@openedx/frontend-plugin-framework';

import NextButton from '../../courseware/course/sequence/sequence-navigation/generic/NextButton';

interface Props {
  disabled: boolean;
  buttonText: string | '';
  nextLink: string;
  sequenceId: string;
  onClickHandler: () => void;
  variant: string;
  buttonStyle: string;
  isAtTop: boolean;
}

export const NextUnitTopNavTriggerSlot : React.FC<Props> = ({
  disabled,
  buttonText,
  nextLink,
  sequenceId,
  onClickHandler,
  variant,
  buttonStyle,
  isAtTop,
}) => (
  <PluginSlot
    id="org.openedx.frontend.learning.next_unit_top_nav_trigger.v1"
    idAliases={['next_unit_top_nav_trigger_slot']}
    pluginProps={{
      disabled,
      buttonText,
      nextLink,
      sequenceId,
      onClickHandler,
      variant,
      buttonStyle,
      isAtTop,
    }}
  >
    <NextButton
      {...{
        variant,
        buttonStyle,
        onClickHandler,
        nextLink,
        disabled,
        buttonText,
        isAtTop,
      }}
    />
  </PluginSlot>
);
