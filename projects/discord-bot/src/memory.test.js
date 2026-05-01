import { test, describe } from 'node:test';
import assert from 'node:assert';
import { remember, recall, forget } from './memory.js';

const MAX_TURNS = 12;

describe('memory', () => {
  test('remember adds entry', () => {
    remember('c1', 'user', 'hello');
    const mem = recall('c1');
    assert.equal(mem.length, 1);
    assert.equal(mem[0].role, 'user');
    assert.equal(mem[0].content, 'hello');
    forget('c1');
  });

  test('recall returns empty array for unknown channel', () => {
    assert.deepEqual(recall('nonexistent'), []);
  });

  test('forget clears channel memory', () => {
    remember('c2', 'user', 'a');
    remember('c2', 'assistant', 'b');
    forget('c2');
    assert.deepEqual(recall('c2'), []);
  });

  test('rolling window caps at MAX_TURNS * 2', () => {
    for (let i = 0; i < MAX_TURNS * 2 + 5; i++) {
      remember('c3', 'user', `msg${i}`);
    }
    const mem = recall('c3');
    assert.equal(mem.length, MAX_TURNS * 2);
    assert.equal(mem[0].content, `msg5`);
    forget('c3');
  });
});
