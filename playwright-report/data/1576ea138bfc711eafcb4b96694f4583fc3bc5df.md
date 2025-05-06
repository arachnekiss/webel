# Test info

- Name: Core Flows >> should search in different languages
- Location: /home/runner/workspace/tests/core-flows.spec.ts:42:3

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
   3 | test.describe('Core Flows', () => {
   4 |   // 기본 네비게이션 테스트
   5 |   test('should navigate to main page', async ({ page }) => {
   6 |     await page.goto('/');
   7 |     await expect(page).toHaveTitle(/Multilingual Engineering/);
   8 |   });
   9 |
  10 |   // 언어 전환 기능 테스트
  11 |   test('should switch between languages', async ({ page }) => {
  12 |     await page.goto('/');
  13 |     
  14 |     // 영어에서 한국어로 전환
  15 |     await page.locator('[data-testid="language-selector"]').click();
  16 |     await page.locator('text=한국어').click();
  17 |     await expect(page.locator('h1')).toContainText('엔지니어링');
  18 |     
  19 |     // 한국어에서 일본어로 전환
  20 |     await page.locator('[data-testid="language-selector"]').click();
  21 |     await page.locator('text=日本語').click();
  22 |     await expect(page.locator('h1')).toContainText('エンジニアリング');
  23 |     
  24 |     // 일본어에서 영어로 전환
  25 |     await page.locator('[data-testid="language-selector"]').click();
  26 |     await page.locator('text=English').click();
  27 |     await expect(page.locator('h1')).toContainText('Engineering');
  28 |   });
  29 |
  30 |   // 리소스 검색 테스트
  31 |   test('should search for resources', async ({ page }) => {
  32 |     await page.goto('/');
  33 |     await page.locator('[data-testid="search-input"]').fill('software');
  34 |     await page.locator('[data-testid="search-button"]').click();
  35 |     
  36 |     // 검색 결과 확인
  37 |     await expect(page.locator('.search-results')).toBeVisible();
  38 |     await expect(page.locator('.search-results .resource-card')).toHaveCount({ min: 1 });
  39 |   });
  40 |
  41 |   // 다국어 검색 테스트
> 42 |   test('should search in different languages', async ({ page }) => {
     |   ^ Error: browserType.launch: Executable doesn't exist at /home/runner/workspace/.cache/ms-playwright/chromium_headless_shell-1169/chrome-linux/headless_shell
  43 |     // 한국어 검색
  44 |     await page.goto('/ko');
  45 |     await page.locator('[data-testid="search-input"]').fill('소프트웨어');
  46 |     await page.locator('[data-testid="search-button"]').click();
  47 |     await expect(page.locator('.search-results .resource-card')).toHaveCount({ min: 1 });
  48 |     
  49 |     // 일본어 검색
  50 |     await page.goto('/ja');
  51 |     await page.locator('[data-testid="search-input"]').fill('ソフトウェア');
  52 |     await page.locator('[data-testid="search-button"]').click();
  53 |     await expect(page.locator('.search-results .resource-card')).toHaveCount({ min: 1 });
  54 |   });
  55 |
  56 |   // 필터링 및 페이지네이션 테스트
  57 |   test('should filter and paginate results', async ({ page }) => {
  58 |     await page.goto('/resources');
  59 |     
  60 |     // 카테고리 필터링
  61 |     await page.locator('[data-testid="category-filter"]').click();
  62 |     await page.locator('text=Software').click();
  63 |     await expect(page.locator('.resource-card')).toHaveCount({ min: 1 });
  64 |     
  65 |     // 다음 페이지로 이동
  66 |     await page.locator('[data-testid="next-page"]').click();
  67 |     await expect(page.url()).toContain('page=2');
  68 |   });
  69 |
  70 |   // 사이드 메뉴 테스트
  71 |   test('should navigate through side menu', async ({ page }) => {
  72 |     await page.goto('/');
  73 |     
  74 |     // 리소스 페이지로 이동
  75 |     await page.locator('[data-testid="sidebar-resources"]').click();
  76 |     await expect(page.url()).toContain('/resources');
  77 |     
  78 |     // 서비스 페이지로 이동
  79 |     await page.locator('[data-testid="sidebar-services"]').click();
  80 |     await expect(page.url()).toContain('/services');
  81 |     
  82 |     // 경매 페이지로 이동
  83 |     await page.locator('[data-testid="sidebar-auctions"]').click();
  84 |     await expect(page.url()).toContain('/auctions');
  85 |     
  86 |     // 대시보드 페이지로 이동
  87 |     await page.locator('[data-testid="sidebar-dashboard"]').click();
  88 |     await expect(page.url()).toContain('/dashboard');
  89 |   });
  90 | });
```