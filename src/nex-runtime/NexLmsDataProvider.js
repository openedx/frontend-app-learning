import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { NexDataProvider } from '../nex';

export default class NexLmsDataProvider extends NexDataProvider {
  constructor(instanceKey, learningContextKey) {
    super(instanceKey, learningContextKey);
    this.client = getAuthenticatedHttpClient();
    const nexApiRoot = getConfig().NEX_LMS_API_ROOT;
    this.instanceDataRoot = `${nexApiRoot}/instances/${instanceKey}`;
    this.learnerDataRoot = `${nexApiRoot}/instances/${instanceKey}/contexts/${learningContextKey}`;
  }

  async fetchInstanceData(dataKey) {
    return this.client.get(`${this.instanceDataRoot}/data/${dataKey || ''}`);
  }

  async fetchLearnerData(dataKey) {
    return this.client.get(`${this.learnerDataRoot}/data/${dataKey}`);
  }

  async emitLearnerEvent(eventData) {
    return this.client.post(`${this.learnerDataRoot}/events`, eventData);
  }
}
