const puppeteer = require('puppeteer');

async function login() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // 导航到登录页面
    await page.goto(process.env.WEBSITE_URL, { waitUntil: 'networkidle2' });

    // 输入用户名
    await page.type(process.env.USERNAME_SELECTOR, process.env.USERNAME);

    // 输入密码
    await page.type(process.env.PASSWORD_SELECTOR, process.env.PASSWORD);

    // 点击登录按钮
    await page.click(process.env.SUBMIT_SELECTOR);

    // 等待登录完成（假设登录后页面跳转或出现特定元素；根据网站调整）
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });

    // 检查登录成功（示例：检查页面标题或特定元素；请根据网站自定义）
    const title = await page.title();
    if (title.includes('Dashboard') || title.includes('Welcome')) {  // 替换为实际成功标志
      console.log('登录成功！');
    } else {
      throw new Error('登录可能失败，请检查页面内容。');
    }

    console.log('脚本执行完成。');
  } catch (error) {
    console.error('登录失败：', error.message);
    throw error;  // 在 Actions 中触发失败通知
  } finally {
    await browser.close();
  }
}

login();
