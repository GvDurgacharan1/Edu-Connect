import { By, until } from 'selenium-webdriver';
import fs from 'fs';
import path from 'path';
import logger from '../utilities/logger.js';

export class BasePage {
  constructor(driver) {
    this.driver = driver;
  }

  // Navigate to URL
  async navigateTo(url) {
    logger.info(`Navigating to URL: ${url}`);
    await this.driver.get(url);
  }

  // Get current URL
  async getCurrentUrl() {
    return await this.driver.getCurrentUrl();
  }

  // Explicit Wait: Locate element
  async waitForElement(locator, timeout = 10000) {
    logger.info(`Waiting for element: ${locator.toString()}`);
    return await this.driver.wait(until.elementLocated(locator), timeout);
  }

  // Explicit Wait: Element is visible
  async waitForVisible(locator, timeout = 10000) {
    logger.info(`Waiting for visibility of: ${locator.toString()}`);
    const element = await this.waitForElement(locator, timeout);
    await this.driver.wait(until.elementIsVisible(element), timeout);
    return element;
  }

  // Click element
  async click(locator, timeout = 10000) {
    logger.info(`Clicking element: ${locator.toString()}`);
    const element = await this.waitForVisible(locator, timeout);
    await element.click();
  }

  // Enter text
  async sendKeys(locator, text, timeout = 10000) {
    logger.info(`Sending keys to: ${locator.toString()} - Value: ${text}`);
    const element = await this.waitForVisible(locator, timeout);
    await element.clear();
    await element.sendKeys(text);
  }

  // Scroll to element
  async scrollToElement(locator) {
    logger.info(`Scrolling to element: ${locator.toString()}`);
    const element = await this.waitForElement(locator);
    await this.driver.executeScript("arguments[0].scrollIntoView(true);", element);
  }

  // Execute JavaScript
  async executeJS(script, ...args) {
    return await this.driver.executeScript(script, ...args);
  }

  // Alert Handling: Accept
  async acceptAlert() {
    logger.info('Accepting browser alert');
    await this.driver.wait(until.alertIsPresent(), 5000);
    const alert = await this.driver.switchTo().alert();
    await alert.accept();
  }

  // Alert Handling: Dismiss
  async dismissAlert() {
    logger.info('Dismissing browser alert');
    await this.driver.wait(until.alertIsPresent(), 5000);
    const alert = await this.driver.switchTo().alert();
    await alert.dismiss();
  }

  // Capture Failure Screenshot
  async takeScreenshot(testName) {
    try {
      const screenshotDir = path.join(process.cwd(), 'screenshots', 'failures');
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }
      
      const fileName = `${testName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.png`;
      const filePath = path.join(screenshotDir, fileName);
      
      const screenshot = await this.driver.takeScreenshot();
      fs.writeFileSync(filePath, screenshot, 'base64');
      logger.info(`Screenshot captured: ${filePath}`);
      return filePath;
    } catch (error) {
      logger.error(`Failed to capture screenshot for ${testName}: ${error.message}`);
      return null;
    }
  }

  // Window Handling: Switch to tab index
  async switchToTab(index) {
    logger.info(`Switching to window tab index: ${index}`);
    const handles = await this.driver.getAllWindowHandles();
    await this.driver.switchTo().window(handles[index]);
  }

  // Retry Wrapper
  async retryAction(action, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
      try {
        return await action();
      } catch (error) {
        if (i === retries - 1) throw error;
        logger.warn(`Action failed. Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
}

export default BasePage;
