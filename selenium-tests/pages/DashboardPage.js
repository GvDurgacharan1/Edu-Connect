import { By } from 'selenium-webdriver';
import BasePage from './BasePage.js';

export class DashboardPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.logoutButton = By.css('.logout-btn, button[aria-label="logout"], button:contains("Logout")');
    this.header = By.css('h1, h2, .dashboard-title');
    this.settingsLink = By.css('a[href="/settings"]');
  }

  async logout() {
    await this.click(this.logoutButton);
  }

  async getTitleText() {
    const el = await this.waitForVisible(this.header, 5000);
    return await el.getText();
  }
}

export default DashboardPage;
