/**
 * Base third-party integration class interface
 */
class BaseIntegration {
  constructor(providerName, credentials = {}) {
    this.provider = providerName;
    this.credentials = credentials;
  }

  /**
   * Run initialization, token refresh verification, etc.
   */
  async connect() {
    throw new Error('connect() not implemented');
  }

  /**
   * Execute an operation against the third-party client
   */
  async execute(action, params = {}) {
    throw new Error('execute() not implemented');
  }

  /**
   * Revoke credentials, clear configuration
   */
  async disconnect() {
    return { success: true };
  }

  /**
   * Verify credentials by running a lightweight call
   */
  async testConnection() {
    throw new Error('testConnection() not implemented');
  }
}

module.exports = BaseIntegration;
