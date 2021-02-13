import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

export default class NexBlockApiProvider {

	constructor(learningContextId, instanceId) {

	}

	async getInstanceData() {
		const httpClient = getAuthenticatedHttpClient();
		const baseUrl = getConfig().NEXBLOCK_INSTANCE_DATA_API_URL;
		return httpClient.get(`${baseUrl}/`);
	}

}
