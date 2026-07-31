import MobileBasePage from './MobileBasePage.js';

export class MobileLoginPage extends MobileBasePage {
  constructor(client) {
    super(client);
    this.usernameInput = '~usernameInput'; // accessibility ID / flutter valuekey
    this.passwordInput = '~passwordInput';
    this.loginBtn = '~loginBtn';
    this.errorMessageText = '~errorMessage';
  }

  async login(username, password) {
    await this.setValue(this.usernameInput, username);
    await this.setValue(this.passwordInput, password);
    await this.tap(this.loginBtn);
  }

  async getErrorMessage() {
    const el = await this.waitForDisplayed(this.errorMessageText);
    return await el.getText();
  }
}

export default MobileLoginPage;
