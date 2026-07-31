import logger from '../utilities/logger.js';
import fs from 'fs';
import path from 'path';

export class MobileBasePage {
  constructor(client) {
    this.client = client;
  }

  // Explicit Wait: Wait for element to display
  async waitForDisplayed(selector, timeout = 10000) {
    logger.info(`Waiting for mobile element: ${selector}`);
    const element = await this.client.$(selector);
    await element.waitForDisplayed({ timeout });
    return element;
  }

  // Tap action
  async tap(selector, timeout = 10000) {
    logger.info(`Tapping on element: ${selector}`);
    const element = await this.waitForDisplayed(selector, timeout);
    await element.click();
  }

  // Set values
  async setValue(selector, value, timeout = 10000) {
    logger.info(`Setting value of ${selector} to: ${value}`);
    const element = await this.waitForDisplayed(selector, timeout);
    await element.setValue(value);
  }

  // Keyboard actions
  async hideKeyboard() {
    logger.info('Hiding virtual keyboard');
    if (await this.client.isKeyboardShown()) {
      await this.client.hideKeyboard();
    }
  }

  // Gesture: Double Tap
  async doubleTap(selector) {
    logger.info(`Performing Double Tap on: ${selector}`);
    const element = await this.waitForDisplayed(selector);
    // Double click is supported by webdriverio
    await element.doubleClick();
  }

  // Gesture: Long Press
  async longPress(selector, duration = 2000) {
    logger.info(`Performing Long Press on: ${selector} for ${duration}ms`);
    const element = await this.waitForDisplayed(selector);
    await this.client.action('pointer')
      .move({ origin: element })
      .down()
      .pause(duration)
      .up()
      .perform();
  }

  // Gesture: Swipe Left/Right/Up/Down using screen ratios
  async swipe(direction) {
    logger.info(`Swiping direction: ${direction}`);
    const size = await this.client.getWindowRect();
    const startX = size.width * 0.5;
    const startY = size.height * 0.5;
    let endX = startX;
    let endY = startY;

    if (direction === 'left') {
      endX = size.width * 0.1;
    } else if (direction === 'right') {
      endX = size.width * 0.9;
    } else if (direction === 'up') {
      endY = size.height * 0.1;
    } else if (direction === 'down') {
      endY = size.height * 0.9;
    }

    await this.client.action('pointer')
      .move({ x: startX, y: startY })
      .down()
      .move({ duration: 1000, x: endX, y: endY })
      .up()
      .perform();
  }

  // Scroll Until Visible
  async scrollUntilVisible(selector, maxSwipes = 5) {
    logger.info(`Scrolling until element visible: ${selector}`);
    for (let i = 0; i < maxSwipes; i++) {
      const element = await this.client.$(selector);
      if (await element.isDisplayed()) {
        return element;
      }
      await this.swipe('up');
    }
    throw new Error(`Element ${selector} not visible after ${maxSwipes} scrolls`);
  }

  // Drag and Drop
  async dragAndDrop(sourceSelector, targetSelector) {
    logger.info(`Dragging from ${sourceSelector} to ${targetSelector}`);
    const source = await this.waitForDisplayed(sourceSelector);
    const target = await this.waitForDisplayed(targetSelector);
    await source.dragAndDrop(target);
  }

  // Pinch
  async pinch() {
    logger.info('Performing pinch gesture');
    // Simulate fingers moving together
    const rect = await this.client.getWindowRect();
    const x = rect.width / 2;
    const y = rect.height / 2;
    
    await this.client.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: x - 100, y: y },
          { type: 'pointerDown', button: 0 },
          { type: 'pointerMove', duration: 500, x: x - 10, y: y },
          { type: 'pointerUp', button: 0 }
        ]
      },
      {
        type: 'pointer',
        id: 'finger2',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: x + 100, y: y },
          { type: 'pointerDown', button: 0 },
          { type: 'pointerMove', duration: 500, x: x + 10, y: y },
          { type: 'pointerUp', button: 0 }
        ]
      }
    ]);
  }

  // Zoom
  async zoom() {
    logger.info('Performing zoom gesture');
    const rect = await this.client.getWindowRect();
    const x = rect.width / 2;
    const y = rect.height / 2;
    
    await this.client.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: x - 10, y: y },
          { type: 'pointerDown', button: 0 },
          { type: 'pointerMove', duration: 500, x: x - 100, y: y },
          { type: 'pointerUp', button: 0 }
        ]
      },
      {
        type: 'pointer',
        id: 'finger2',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: x + 10, y: y },
          { type: 'pointerDown', button: 0 },
          { type: 'pointerMove', duration: 500, x: x + 100, y: y },
          { type: 'pointerUp', button: 0 }
        ]
      }
    ]);
  }

  // Alert Handling
  async acceptAlert() {
    logger.info('Accepting mobile alert dialog');
    await this.client.acceptAlert();
  }

  async dismissAlert() {
    logger.info('Dismissing mobile alert dialog');
    await this.client.dismissAlert();
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
      await this.client.saveScreenshot(filePath);
      logger.info(`Mobile screenshot captured: ${filePath}`);
      return filePath;
    } catch (error) {
      logger.error(`Failed to capture mobile screenshot for ${testName}: ${error.message}`);
      return null;
    }
  }

  // Capture Device Logs (logcat)
  async captureLogs() {
    try {
      logger.info('Capturing Android logcat logs...');
      const logs = await this.client.getLogs('logcat');
      const logDir = path.join(process.cwd(), 'logs');
      if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
      const logPath = path.join(logDir, 'logcat_dump.log');
      fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
      return logPath;
    } catch (error) {
      logger.warn(`Could not fetch logcat logs: ${error.message}`);
      return null;
    }
  }
}

export default MobileBasePage;
