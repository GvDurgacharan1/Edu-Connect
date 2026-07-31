import MobileBasePage from './MobileBasePage.js';

export class MobileDashboardPage extends MobileBasePage {
  constructor(client) {
    super(client);
    this.studentHeader = '~studentDashboardHeader';
    this.logoutBtn = '~logoutBtn';
    this.navigationDrawer = '~navigationDrawer';
  }

  async openDrawer() {
    await this.tap(this.navigationDrawer);
  }

  async logout() {
    await this.tap(this.logoutBtn);
  }
}

export default MobileDashboardPage;
