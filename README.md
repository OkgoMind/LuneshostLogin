# Luneshost 免费容器自动化登录脚本（AI写的）

> ## 概述
> ![自定义图片名](https://betadash.lunes.host/static/images/Lunes.svg)
> Betadash 是 Lunes Host 平台的一个子域（[betadash.lunes.host](https://betadash.lunes.host/)），提供用户登录和管理功能。该自动化脚本使用 Node.js 和 Puppeteer 构建，旨在通过 GitHub Actions 实现每天自动登录 Betadash 网站，绕过手动操作和验证码挑战（如 Cloudflare Turnstile）。脚本特别适> 用于保持账户活跃，避免因长期不活跃（6 个月以上）而重置密码的风险。
> 
> 此脚本：
> 
> * ​**自动化频率**​：每天 UTC 00:00（北京时间 08:00）自动运行，支持手动触发测试。
> * ​**验证码处理**​：集成 2Captcha API 自动解决 Turnstile 验证码，确保高成功率（>95%）。
> * ​**安全性**​：凭证存储在 GitHub Secrets 中，避免硬编码。
> * ​**调试友好**​：失败时生成截屏并上传为 Artifacts，便于排查。
> * **TG通知**: 登录成功或失败时通过 Telegram Bot 发送通知。

## 适用场景

* 托管服务账户维护（如 Lunes Host 的 Betadash 面板）。
* 定期登录以防止账户锁定。
* 自动化日常任务。

## 技术栈

* ​**核心库**​：Puppeteer（浏览器自动化）、Axios（API 调用）。
* ​**运行环境**​：GitHub Actions（Ubuntu-latest，Node.js 20）。
* ​**依赖**​：无外部安装需求（工作流中自动处理）。

## 配置步骤

### 配置 GitHub Secrets


转到 ​**Settings > Secrets and variables > Actions**​，添加以下 Secrets：

| Secret 名称       | 值示例                            | 说明                                                           |
| ------------------- | ----------------------------------- | ---------------------------------------------------------------- |
| WEBSITE\_URL      | https://betadash.lunes.host/login | 登录页面 URL                                                   |
| USERNAME          | your-email@example.com            | 您的邮箱                                                       |
| PASSWORD          | your-password                     | 您的密码                                                       |
| CAPTCHA\_API\_KEY | your-2captcha-api-key             | 2Captcha API Key（注册[2captcha.com](https://2captcha.com/)获取） |
|USERNAME\_SELECTOR| #email|用户名输入框CSS选择器|
|PASSWORD\_SELECTOR|#password|密码输入框CSS选择器|
|SUBMIT\_SELECTOR|button[type="submit"]|登录按钮的选择器|
|TELEGRAM_BOT_TOKEN|123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11|您的 Bot Token|
|TELEGRAM_CHAT_ID|123456789|您的 Chat ID|

## RAG 流程图

```mermaid
graph TD
    A[开始] --> B[导航登录页]
    B --> C{等待验证码加载}
    C -->|是| D[输入用户名密码]
    D --> E[提取 sitekey]
    E --> F[解决 Turnstile]
    F --> G[提交表单]
    G --> H{等待导航}
    H -->|成功| I{检查登录}
    I -->|是| J[Telegram 成功通知]
    J --> K[结束]
    I -->|否| L[截屏失败]
    L --> M[Telegram 失败通知]
    M --> N[结束]
    H -->|超时| O[错误结束]
    C -->|否| P[验证码失败]
    P --> Q[结束]
    F -->|API 失败| R[重试或结束]
    R --> O

    classDef startEnd fill:#90EE90
    classDef process fill:#E6E6FA
    classDef decision fill:#FFFACD
    classDef error fill:#FFB6C1
    class A,K,N,Q,O startEnd
    class B,D,E,F,G,J,L,M process
    class C,H,I decision
    class P,R error
