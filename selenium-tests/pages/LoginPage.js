import { By } from 'selenium-webdriver';
import BasePage from './BasePage.js';

export class LoginPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.usernameInput = By.css('input[type="text"]');
    this.passwordInput = By.css('input[type="password"]');
    this.submitButton = By.css('button[type="submit"]');
    this.errorMessage = By.css('.text-red-500, .error-message'); // standard class names
  }

  async login(username, password) {
    await this.sendKeys(this.usernameInput, username);
    await this.sendKeys(this.passwordInput, password);
    await this.click(this.submitButton);
  }

  async getErrorMessage() {
    const errorEl = await this.waitForVisible(this.errorMessage, 5000);
    return await errorEl.getText();
  }
}

export default LoginPage;
