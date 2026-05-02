import { test, describe } from 'node:test';
import assert from 'node:assert';
import { loadConfig } from './config.js';

describe('config', () => {
  test('loads valid config', () => {
    const env = {
      DISCORD_TOKEN: 'test-token',
      DISCORD_CLIENT_ID: 'test-client-id',
    };
    const config = loadConfig(env);
    assert.equal(config.discordToken, 'test-token');
    assert.equal(config.discordClientId, 'test-client-id');
  });

  test('throws on missing DISCORD_TOKEN', () => {
    const env = { DISCORD_CLIENT_ID: 'test-client-id' };
    assert.throws(() => loadConfig(env), /Missing required environment variables: DISCORD_TOKEN/);
  });

  test('throws on missing DISCORD_CLIENT_ID', () => {
    const env = { DISCORD_TOKEN: 'test-token' };
    assert.throws(() => loadConfig(env), /Missing required environment variables: DISCORD_CLIENT_ID/);
  });

  test('throws on missing both required vars', () => {
    const env = {};
    assert.throws(() => loadConfig(env), /Missing required environment variables: DISCORD_TOKEN, DISCORD_CLIENT_ID/);
  });

  test('optional fields default to undefined', () => {
    const env = {
      DISCORD_TOKEN: 'test-token',
      DISCORD_CLIENT_ID: 'test-client-id',
    };
    const config = loadConfig(env);
    assert.equal(config.openaiApiKey, undefined);
    assert.equal(config.guildId, undefined);
  });

  test('includes optional OPENAI_API_KEY when set', () => {
    const env = {
      DISCORD_TOKEN: 'test-token',
      DISCORD_CLIENT_ID: 'test-client-id',
      OPENAI_API_KEY: 'sk-test',
    };
    const config = loadConfig(env);
    assert.equal(config.openaiApiKey, 'sk-test');
  });

  test('includes optional GUILD_ID when set', () => {
    const env = {
      DISCORD_TOKEN: 'test-token',
      DISCORD_CLIENT_ID: 'test-client-id',
      GUILD_ID: '123456',
    };
    const config = loadConfig(env);
    assert.equal(config.guildId, '123456');
  });

  test('returns frozen object', () => {
    const env = {
      DISCORD_TOKEN: 'test-token',
      DISCORD_CLIENT_ID: 'test-client-id',
    };
    const config = loadConfig(env);
    assert.equal(Object.isFrozen(config), true);
  });
});
