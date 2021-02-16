export default class NexDataProvider {
  constructor(instanceKey, learningContextKey) {
    this.instanceKey = instanceKey;
    this.learningContextKey = learningContextKey;
  }

  async fetchInstanceData(dataKey) { // eslint-disable-line no-unused-vars
    throw new Error('NexDataProvider.fetchInstanceData must be implemented.');
  }

  async fetchLearnerData(dataKey) { // eslint-disable-line no-unused-vars
    throw new Error('NexDataProvider.fetchLearnerData must be implemented.');
  }

  async emitLearnerEvent(eventData) { // eslint-disable-line no-unused-vars
    throw new Error('NexDataProvider.emitLearnerEvent must be implemented.');
  }
}
