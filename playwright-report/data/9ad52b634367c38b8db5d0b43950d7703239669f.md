# Test info

- Name: Payment and Verification >> should register bank account
- Location: /home/runner/workspace/tests/payment-verification.spec.ts:34:3

# Error details

```
Error: browserType.launch: Executable doesn't exist at /home/runner/workspace/.cache/ms-playwright/chromium_headless_shell-1169/chrome-linux/headless_shell
╔═════════════════════════════════════════════════════════════════════════╗
║ Looks like Playwright Test or Playwright was just installed or updated. ║
║ Please run the following command to download new browsers:              ║
║                                                                         ║
║     npx playwright install                                              ║
║                                                                         ║
║ <3 Playwright Team                                                      ║
╚═════════════════════════════════════════════════════════════════════════╝
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Payment and Verification', () => {
   4 |   test.beforeEach(async ({ page }) => {
   5 |     // 로그인
   6 |     await page.goto('/login');
   7 |     await page.locator('[data-testid="username"]').fill('testuser');
   8 |     await page.locator('[data-testid="password"]').fill('password123');
   9 |     await page.locator('[data-testid="login-button"]').click();
  10 |   });
  11 |
  12 |   // 전화번호 인증 테스트
  13 |   test('should verify phone number', async ({ page }) => {
  14 |     // 프로필 설정 페이지로 이동
  15 |     await page.goto('/profile/settings');
  16 |     
  17 |     // 전화번호 입력
  18 |     await page.locator('[data-testid="phone-input"]').fill('010-1234-5678');
  19 |     await page.locator('[data-testid="verify-phone-button"]').click();
  20 |     
  21 |     // 인증 코드 입력 (여기서는 테스트 코드 '123456'을 사용)
  22 |     await page.locator('[data-testid="verification-code"]').fill('123456');
  23 |     await page.locator('[data-testid="submit-code-button"]').click();
  24 |     
  25 |     // 성공 메시지 확인
  26 |     await expect(page.locator('.toast-success')).toBeVisible();
  27 |     await expect(page.locator('.toast-success')).toContainText('Phone verified');
  28 |     
  29 |     // 인증 상태 확인
  30 |     await expect(page.locator('[data-testid="verified-badge"]')).toBeVisible();
  31 |   });
  32 |
  33 |   // 계좌 정보 등록 테스트
> 34 |   test('should register bank account', async ({ page }) => {
     |   ^ Error: browserType.launch: Executable doesn't exist at /home/runner/workspace/.cache/ms-playwright/chromium_headless_shell-1169/chrome-linux/headless_shell
  35 |     // 프로필 설정 페이지로 이동
  36 |     await page.goto('/profile/settings');
  37 |     
  38 |     // 은행 선택
  39 |     await page.locator('[data-testid="bank-select"]').click();
  40 |     await page.locator('text=신한은행').click();
  41 |     
  42 |     // 계좌번호 입력
  43 |     await page.locator('[data-testid="account-number"]').fill('110-123-456789');
  44 |     
  45 |     // 예금주 입력
  46 |     await page.locator('[data-testid="account-holder"]').fill('홍길동');
  47 |     
  48 |     // 제출 버튼 클릭
  49 |     await page.locator('[data-testid="submit-account-button"]').click();
  50 |     
  51 |     // 성공 메시지 확인
  52 |     await expect(page.locator('.toast-success')).toBeVisible();
  53 |     await expect(page.locator('.toast-success')).toContainText('Bank account registered');
  54 |   });
  55 |
  56 |   // 유료 서비스 등록 테스트
  57 |   test('should register paid service', async ({ page }) => {
  58 |     // 서비스 등록 페이지로 이동
  59 |     await page.goto('/services/register');
  60 |     
  61 |     // 서비스 정보 입력
  62 |     await page.locator('[data-testid="service-title"]').fill('Professional Engineering Service');
  63 |     await page.locator('[data-testid="service-description"]').fill('High quality engineering service for your projects');
  64 |     
  65 |     // 서비스 타입 선택
  66 |     await page.locator('[data-testid="service-type-select"]').click();
  67 |     await page.locator('text=Engineering').click();
  68 |     
  69 |     // 위치 정보 입력
  70 |     await page.locator('[data-testid="location-input"]').fill('Seoul, Korea');
  71 |     
  72 |     // 태그 입력
  73 |     await page.locator('[data-testid="tags-input"]').fill('engineering');
  74 |     await page.keyboard.press('Enter');
  75 |     await page.locator('[data-testid="tags-input"]').fill('professional');
  76 |     await page.keyboard.press('Enter');
  77 |     
  78 |     // 가격 정보 입력
  79 |     await page.locator('[data-testid="price-input"]').fill('50000');
  80 |     await page.locator('[data-testid="price-per-hour"]').check();
  81 |     
  82 |     // 서비스 이미지 업로드
  83 |     const fileInput = page.locator('input[type="file"]');
  84 |     await fileInput.setInputFiles('public/images/service-image.jpg');
  85 |     
  86 |     // 서비스 등록 버튼 클릭
  87 |     await page.locator('[data-testid="register-service-button"]').click();
  88 |     
  89 |     // 성공 메시지 확인
  90 |     await expect(page.locator('.toast-success')).toBeVisible();
  91 |     await expect(page.locator('.toast-success')).toContainText('Service registered');
  92 |     
  93 |     // 등록된 서비스 페이지로 리디렉션 확인
  94 |     await expect(page.url()).toContain('/services/');
  95 |   });
  96 | });
```