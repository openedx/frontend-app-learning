import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { NexApiProvider } from '../NexBases';

export default class NexLmsApiProvider extends NexApiProvider {

	constructor(instanceKey, learningContextKey) {
		super(instanceKey, learningContextKey);
		this.client = getAuthenticatedHttpClient();
		const apiRoot = getConfig().NEXBLOCK_API_PATH;
		this.instanceRoot = `${this.apiPath}/instances/${this.instanceKey}`;
		this.contextRoot = `${this.instanceRoot}/contexts/${this.learningContextKey}`;
	}

	async fetchInstanceData(key) {
		const theKey = key ?? '';
		const url = `${this.instanceRoot}/data/${theKey}`;
		return this.client.get(url);
	}

	async fetchLearnerData(key) {
		const url = `${this.contextRoot}/data/${key}`;
		return this.client.get(url);
	}

	async emitLearnerEvent(key) {
		const url = `${this.contextRoot}/events`;
		return this.client.post(url);
	}

}
