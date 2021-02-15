

function renderFallbackAuthoringUiTo(nexBlock, element) {
	throw new Error("renderFallbackAuthoringUiTo not yet implemented.");
}

export class NexBlock {

	renderLearnerUiTo(element) {
		throw new Error("NexBlock.renderLearnerUiTo must be implemented.");
	}

	renderInstructorUiTo(element) {
		return this.renderLearnerUiTo(element);
	}

	renderAuthorUiTo(element) {
		renderFallbackAuthoringUi(this, element);
	}

	getCoreClass() {
		if(this.constructor.Core ) { return this.constructor.Core; } else {
			throw new Error("NexBlock.Core must be defined");
		}
	}
}


export class NexCore {

	constructor(nexApiProvider) {
		this._nexApiProvider = nexApiProvider
	}

	async query(requestData) {
		throw new Error("NexCore.query must be implemented.");
	}
}


export class NexApiProvider {

	constructor(instanceKey, learningContextKey) {
		this.instanceKey = instanceKey;
		this.learningContextKey = learningContextKey;
	}

	async fetchInstanceData(key) {
		throw new Error("NexApiProvider.fetchInstanceData must be implemented.");
	}

	async fetchLearnerData(key) {
		throw new Error("NexApiProvider.fetchLearnerData must be implemented.");
	}

	async emitLearnerEvent(learner, event) {
		throw new Error("NexApiProvider.emitLearnerEvent must be implemented.");
	}

}

