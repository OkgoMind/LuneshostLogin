const puppeteer = require('puppeteer');

async function login() {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',  // 避免共享内存问题
      '--disable-gpu'  // 可选：禁用 GPU 以防兼容性问题
    ]
  });
  const page = await browser.newPage();

  // 设置用户代理以伪装真实浏览器
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  try {
    // 导航到登录页面
    await page.goto(process.env.WEBSITE_URL, { waitUntil: 'networkidle2' });

    // 输入 Email
    await page.type('#email', process.env.USERNAME);

    // 输入密码
    await page.type('#password', process.env.PASSWORD);

    // 等待 Turnstile 渲染（兼容 reCAPTCHA）
    await page.waitForSelector('.g-recaptcha', { timeout: 10000 });
    await page.waitForFunction('document.querySelector("iframe[src*=\'turnstile\']").contentDocument.body', { timeout: 10000 });

    // 注意：这里需要手动/服务解决 Turnstile。示例：如果使用 2Captcha，集成 API 调用。
    // 临时：尝试点击（可能失败）
    const turnstileFrame = await page.$('iframe[src*="turnstile"]');
    if (turnstileFrame) {
      const frameElement = await turnstileFrame.contentFrame();
      if (frameElement) {
        await frameElement.click('button');  // 尝试点击挑战按钮；实际需调整
      }
    }

    // 等待验证码响应（假设解决后，隐藏 div 或 token 生成）
    await page.waitForFunction(() => {
      const widget = document.querySelector('.g-recaptcha');
      return widget && widget.querySelector('textarea') && widget.querySelector('textarea').value;
    }, { timeout: 30000 });  // 30s 等待解决

    // 点击提交按钮
    await page.click('button[type="submit"]');

    // 等待登录完成（重定向到 /）
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });

    // 检查登录成功（调整为实际：如 URL 变为 / 或标题包含欢迎词）
    const currentUrl = page.url();
    const title = await page.title();
    if (currentUrl.includes('/') && title.includes('Lunes Host')) {  // 假设首页标题
      console.log('登录成功！当前页面：', currentUrl);
    } else {
      throw new Error(`登录可能失败。当前 URL: ${currentUrl}, 标题: ${title}`);
    }

    console.log('脚本执行完成。');
  } catch (error) {
    // 调试：保存截屏
    await page.screenshot({ path: 'login-failure.png', fullPage: true });
    console.error('登录失败：', error.message);
    console.error('截屏已保存为 login-failure.png（在 Actions artifacts 中查看）');
    throw error;
  } finally {
    await browser.close();
  }
}

login();
