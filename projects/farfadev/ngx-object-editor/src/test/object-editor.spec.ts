import { describe, it, beforeAll, afterEach } from 'vitest';
import { Semaphore, sleep } from './tests-utils';
import { lastAction, testActionSequenceList } from './object-editor-test-util';
import { actionSequence001 } from './test-001';
import { actionSequence100, actionSequence101, actionSequence102, actionSequence103 } from './test-100';
import { actionSequence002 } from './test-002';

const step1 = new Semaphore();

const actionSequenceList = [
  actionSequence001,
  actionSequence002,
  actionSequence100,
  actionSequence101,
  actionSequence102,
  actionSequence103
];

describe('object-editor', () => {
  beforeAll(async () => {

  })
  afterEach(async () => {
    await sleep(2000);
  });
  it('test1', () => {
    try {
      testActionSequenceList(actionSequenceList);
    }
    catch (error) {
      const c = lastAction;
      console.error(error, lastAction);
      throw error;
    }
  });
});
