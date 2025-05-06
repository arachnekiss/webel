# Test info

- Name: Upload Functionality >> should upload an image
- Location: /home/runner/workspace/tests/upload-functionality.spec.ts:17:3

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
   2 | import path from 'path';
   3 |
   4 | test.describe('Upload Functionality', () => {
   5 |   test.beforeEach(async ({ page }) => {
   6 |     // 로그인
   7 |     await page.goto('/login');
   8 |     await page.locator('[data-testid="username"]').fill('testuser');
   9 |     await page.locator('[data-testid="password"]').fill('password123');
  10 |     await page.locator('[data-testid="login-button"]').click();
  11 |     
  12 |     // 업로드 페이지로 이동
  13 |     await page.goto('/resources/upload');
  14 |   });
  15 |
  16 |   // 이미지 업로드 테스트
> 17 |   test('should upload an image', async ({ page }) => {
     |   ^ Error: browserType.launch: Executable doesn't exist at /home/runner/workspace/.cache/ms-playwright/chromium_headless_shell-1169/chrome-linux/headless_shell
  18 |     // 제목 및 설명 입력
  19 |     await page.locator('[data-testid="title"]').fill('Test Image Upload');
  20 |     await page.locator('[data-testid="description"]').fill('This is a test image upload');
  21 |     
  22 |     // 카테고리 선택
  23 |     await page.locator('[data-testid="category-select"]').click();
  24 |     await page.locator('text=3D Model').click();
  25 |     
  26 |     // 태그 입력
  27 |     await page.locator('[data-testid="tags-input"]').fill('test');
  28 |     await page.keyboard.press('Enter');
  29 |     await page.locator('[data-testid="tags-input"]').fill('image');
  30 |     await page.keyboard.press('Enter');
  31 |     
  32 |     // 파일 업로드
  33 |     const fileInput = page.locator('input[type="file"]');
  34 |     await fileInput.setInputFiles(path.join('public', 'images', 'test-image.jpg'));
  35 |     
  36 |     // 업로드 버튼 클릭
  37 |     await page.locator('[data-testid="upload-button"]').click();
  38 |     
  39 |     // 성공 메시지 확인
  40 |     await expect(page.locator('.toast-success')).toBeVisible();
  41 |     await expect(page.locator('.toast-success')).toContainText('Upload successful');
  42 |   });
  43 |
  44 |   // YouTube URL 업로드 테스트
  45 |   test('should upload a YouTube URL', async ({ page }) => {
  46 |     // 제목 및 설명 입력
  47 |     await page.locator('[data-testid="title"]').fill('Test YouTube Upload');
  48 |     await page.locator('[data-testid="description"]').fill('This is a test YouTube upload');
  49 |     
  50 |     // 카테고리 선택
  51 |     await page.locator('[data-testid="category-select"]').click();
  52 |     await page.locator('text=Free Content').click();
  53 |     
  54 |     // 태그 입력
  55 |     await page.locator('[data-testid="tags-input"]').fill('youtube');
  56 |     await page.keyboard.press('Enter');
  57 |     await page.locator('[data-testid="tags-input"]').fill('video');
  58 |     await page.keyboard.press('Enter');
  59 |     
  60 |     // YouTube URL 입력
  61 |     await page.locator('[data-testid="youtube-url"]').fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  62 |     
  63 |     // 업로드 버튼 클릭
  64 |     await page.locator('[data-testid="upload-button"]').click();
  65 |     
  66 |     // 성공 메시지 확인
  67 |     await expect(page.locator('.toast-success')).toBeVisible();
  68 |     await expect(page.locator('.toast-success')).toContainText('Upload successful');
  69 |   });
  70 |
  71 |   // 리소스 삭제 후 대시보드 갱신 테스트
  72 |   test('should delete resource and update dashboard', async ({ page }) => {
  73 |     // 대시보드로 이동
  74 |     await page.goto('/dashboard');
  75 |     
  76 |     // 첫 번째 리소스 카드 확인
  77 |     const resourceCard = page.locator('.resource-card').first();
  78 |     await expect(resourceCard).toBeVisible();
  79 |     
  80 |     // 리소스 삭제 버튼 클릭
  81 |     await resourceCard.locator('[data-testid="delete-button"]').click();
  82 |     
  83 |     // 확인 모달에서 삭제 확인
  84 |     await page.locator('[data-testid="confirm-delete"]').click();
  85 |     
  86 |     // 성공 메시지 확인
  87 |     await expect(page.locator('.toast-success')).toBeVisible();
  88 |     await expect(page.locator('.toast-success')).toContainText('Resource deleted');
  89 |     
  90 |     // 페이지 새로고침 후 리소스가 삭제되었는지 확인
  91 |     await page.reload();
  92 |     
  93 |     // 삭제된 리소스가 없는지 확인 또는 리소스 수가 줄었는지 확인
  94 |     // 이 부분은 UI에 따라 달라질 수 있음
  95 |   });
  96 | });
```