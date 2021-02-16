import PropTypes from 'prop-types';

import NexCore from './NexCore';
import FallbackAuthoringUi from './FallbackAuthoringUi';

export default function NexBlock({
  core, learnerUi, instructorUi, authorUi, instanceDataSchema,
}) {
  const injectCoreIntoProps = ui => (props => ui({ core, ...props }));

  this.learnerUi = injectCoreIntoProps(learnerUi);
  this.instructorUi = instructorUi ? injectCoreIntoProps(instructorUi) : this.learnerUi;
  this.authorUi = authorUi || FallbackAuthoringUi(instanceDataSchema || null);
}

NexBlock.propTypes = {
  core: PropTypes.instanceOf(NexCore).isRequired,
  learnerUi: PropTypes.elementType.isRequired,
  instructorUi: PropTypes.elementType,
  authorUi: PropTypes.elementType,
  instanceDataSchema: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};
