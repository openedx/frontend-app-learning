import { learningApp } from './index';

describe('learningApp', () => {
  it('declares the Learning app id with no routes or slot operations yet', () => {
    expect(learningApp.appId).toBe('org.openedx.frontend.app.learning');
    expect(learningApp.routes).toEqual([]);
    expect(learningApp.slots).toEqual([]);
  });
});
