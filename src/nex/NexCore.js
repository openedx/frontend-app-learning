export default class NexCore {
  constructor(dataProvider) {
    this.dataProvider = dataProvider;
  }

  async query(queryData) { // eslint-disable-line no-unused-vars
    throw new Error('NexCore.query must be implemented.');
  }
}
