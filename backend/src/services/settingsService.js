const crypto = require('crypto');
const { SystemSetting } = require('../models');

const SETTINGS_KEY_ENV = 'SETTINGS_ENCRYPTION_KEY';
const EMAIL_USER_KEY = 'email.user';
const EMAIL_FROM_KEY = 'email.from';
const EMAIL_PASS_KEY = 'email.pass';

function getKey() {
  const secret = process.env[SETTINGS_KEY_ENV];
  if (!secret) return null;
  // Derive a stable 32-byte key from any secret string
  return crypto.scryptSync(secret, 'driving-school-settings', 32);
}

function encrypt(plaintext) {
  const key = getKey();
  if (!key) {
    const err = new Error(`${SETTINGS_KEY_ENV} is not set`);
    err.code = 'SETTINGS_KEY_MISSING';
    throw err;
  }
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    value_encrypted: ciphertext.toString('base64'),
    enc_iv: iv.toString('base64'),
    enc_tag: tag.toString('base64'),
  };
}

function decrypt({ value_encrypted, enc_iv, enc_tag }) {
  if (!value_encrypted || !enc_iv || !enc_tag) return null;
  const key = getKey();
  if (!key) return null;
  const iv = Buffer.from(enc_iv, 'base64');
  const tag = Buffer.from(enc_tag, 'base64');
  const ciphertext = Buffer.from(value_encrypted, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plaintext.toString('utf8');
}

async function upsertPlain(key, value) {
  await SystemSetting.upsert({ key, value_encrypted: String(value), enc_iv: null, enc_tag: null });
}

async function upsertEncrypted(key, plaintext) {
  const enc = encrypt(plaintext);
  await SystemSetting.upsert({ key, ...enc });
}

async function getValue(key) {
  const row = await SystemSetting.findByPk(key);
  if (!row) return null;
  // If enc_iv/tag not set, treat value_encrypted as plain text
  if (!row.enc_iv || !row.enc_tag) return row.value_encrypted || null;
  return decrypt(row);
}

async function getEmailConfig() {
  const [user, from, pass] = await Promise.all([
    getValue(EMAIL_USER_KEY),
    getValue(EMAIL_FROM_KEY),
    getValue(EMAIL_PASS_KEY),
  ]);
  return {
    user: user || process.env.EMAIL_USER || null,
    from: from || process.env.EMAIL_FROM || null,
    pass: pass || process.env.EMAIL_PASS || null,
    source: (user || from || pass) ? 'db' : 'env',
    settingsKeyPresent: !!process.env[SETTINGS_KEY_ENV],
  };
}

async function setEmailConfig({ user, from, pass }) {
  if (typeof user === 'string' && user.trim() !== '') await upsertPlain(EMAIL_USER_KEY, user.trim());
  if (typeof from === 'string' && from.trim() !== '') await upsertPlain(EMAIL_FROM_KEY, from.trim());
  if (typeof pass === 'string' && pass.trim() !== '') await upsertEncrypted(EMAIL_PASS_KEY, pass.trim());
}

async function hasStoredEmailPass() {
  const row = await SystemSetting.findByPk(EMAIL_PASS_KEY);
  return !!(row && row.value_encrypted);
}

module.exports = {
  getEmailConfig,
  setEmailConfig,
  hasStoredEmailPass,
};

