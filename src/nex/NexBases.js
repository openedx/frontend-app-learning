
import PropTypes from 'prop-types';

export class NexDataProvider {

	constructor(instanceKey, learningContextKey) {
		this.instanceKey = instanceKey;
		this.learningContextKey = learningContextKey;
	}

	async fetchInstanceData(dataKey) {
		throw new Error("NexDataProvider.fetchInstanceData must be implemented.")
	}

	async fetchLearnerData(dataKey) {
		throw new Error("NexDataProvider.fetchLearnerData must be implemented.")
	}

	async emitLearnerEvent(eventData) {
		throw new Error("NexDataProvider.emitLearnerEvent must be implemented.")
	}
}

export class NexCore {

	constructor(dataProvider) {
		this.dataProvider = dataProvider;
	}
	
	async query(queryData) {
		throw new Error("NexCore.query must be implemented.")
	}
}

export function NexBlock({core, learnerUi, instructorUi, authorUi, instanceDataSchema}) {
	const injectCoreIntoProps = ui => (props => ui({core, ...props}));

	this.learnerUi = injectCoreIntoProps(learnerUi);
	this.instructorUi = instructorUi ? injectCoreIntoProps(instructorUi) : this.learnerUi;
	this.authorUi = authorUi || FallbackAuthoringUi(instanceDataSchema || null);
}

NexBlock.propTypes = {
	core: PropTypes.instanceOf(NexCore).isRequired,
	learnerUi: PropTypes.elementType.isRequired,
	instructorUi: PropTypes.elementType,
	authorUi: PropTypes.elementType,
	instanceDataSchema: PropTypes.object,
}

function FallbackAuthoringUi({instanceDataSchema}) {
	return "Fallback Authoring UI not yet implemented";
}

FallbackAuthoringUi.propTypes = {
	instanceDataSchema: PropTypes.object;
}
