import { test, expect } from '@playwright/test';

test.describe('Payment and Verification', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인
    await page.goto('/login');
    await page.locator('[data-testid="username"]').fill('testuser');
    await page.locator('[data-testid="password"]').fill('password123');
    await page.locator('[data-testid="login-button"]').click();
  });

  // 전화번호 인증 테스트
  test('should verify phone number', async ({ page }) => {
    // 프로필 설정 페이지로 이동
    await page.goto('/profile/settings');
    
    // 전화번호 입력
    await page.locator('[data-testid="phone-input"]').fill('010-1234-5678');
    await page.locator('[data-testid="verify-phone-button"]').click();
    
    // 인증 코드 입력 (여기서는 테스트 코드 '123456'을 사용)
    await page.locator('[data-testid="verification-code"]').fill('123456');
    await page.locator('[data-testid="submit-code-button"]').click();
    
    // 성공 메시지 확인
    await expect(page.locator('.toast-success')).toBeVisible();
    await expect(page.locator('.toast-success')).toContainText('Phone verified');
    
    // 인증 상태 확인
    await expect(page.locator('[data-testid="verified-badge"]')).toBeVisible();
  });

  // 계좌 정보 등록 테스트
  test('should register bank account', async ({ page }) => {
    // 프로필 설정 페이지로 이동
    await page.goto('/profile/settings');
    
    // 은행 선택
    await page.locator('[data-testid="bank-select"]').click();
    await page.locator('text=신한은행').click();
    
    // 계좌번호 입력
    await page.locator('[data-testid="account-number"]').fill('110-123-456789');
    
    // 예금주 입력
    await page.locator('[data-testid="account-holder"]').fill('홍길동');
    
    // 제출 버튼 클릭
    await page.locator('[data-testid="submit-account-button"]').click();
    
    // 성공 메시지 확인
    await expect(page.locator('.toast-success')).toBeVisible();
    await expect(page.locator('.toast-success')).toContainText('Bank account registered');
  });

  // 유료 서비스 등록 테스트
  test('should register paid service', async ({ page }) => {
    // 서비스 등록 페이지로 이동
    await page.goto('/services/register');
    
    // 서비스 정보 입력
    await page.locator('[data-testid="service-title"]').fill('Professional Engineering Service');
    await page.locator('[data-testid="service-description"]').fill('High quality engineering service for your projects');
    
    // 서비스 타입 선택
    await page.locator('[data-testid="service-type-select"]').click();
    await page.locator('text=Engineering').click();
    
    // 위치 정보 입력
    await page.locator('[data-testid="location-input"]').fill('Seoul, Korea');
    
    // 태그 입력
    await page.locator('[data-testid="tags-input"]').fill('engineering');
    await page.keyboard.press('Enter');
    await page.locator('[data-testid="tags-input"]').fill('professional');
    await page.keyboard.press('Enter');
    
    // 가격 정보 입력
    await page.locator('[data-testid="price-input"]').fill('50000');
    await page.locator('[data-testid="price-per-hour"]').check();
    
    // 서비스 이미지 업로드
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('public/images/service-image.jpg');
    
    // 서비스 등록 버튼 클릭
    await page.locator('[data-testid="register-service-button"]').click();
    
    // 성공 메시지 확인
    await expect(page.locator('.toast-success')).toBeVisible();
    await expect(page.locator('.toast-success')).toContainText('Service registered');
    
    // 등록된 서비스 페이지로 리디렉션 확인
    await expect(page.url()).toContain('/services/');
  });
});