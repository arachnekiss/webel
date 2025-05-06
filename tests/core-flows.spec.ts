import { test, expect } from '@playwright/test';

test.describe('Core Flows', () => {
  // 기본 네비게이션 테스트
  test('should navigate to main page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Multilingual Engineering/);
  });

  // 언어 전환 기능 테스트
  test('should switch between languages', async ({ page }) => {
    await page.goto('/');
    
    // 영어에서 한국어로 전환
    await page.locator('[data-testid="language-selector"]').click();
    await page.locator('text=한국어').click();
    await expect(page.locator('h1')).toContainText('엔지니어링');
    
    // 한국어에서 일본어로 전환
    await page.locator('[data-testid="language-selector"]').click();
    await page.locator('text=日本語').click();
    await expect(page.locator('h1')).toContainText('エンジニアリング');
    
    // 일본어에서 영어로 전환
    await page.locator('[data-testid="language-selector"]').click();
    await page.locator('text=English').click();
    await expect(page.locator('h1')).toContainText('Engineering');
  });

  // 리소스 검색 테스트
  test('should search for resources', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-testid="search-input"]').fill('software');
    await page.locator('[data-testid="search-button"]').click();
    
    // 검색 결과 확인
    await expect(page.locator('.search-results')).toBeVisible();
    await expect(page.locator('.search-results .resource-card')).toHaveCount({ min: 1 });
  });

  // 다국어 검색 테스트
  test('should search in different languages', async ({ page }) => {
    // 한국어 검색
    await page.goto('/ko');
    await page.locator('[data-testid="search-input"]').fill('소프트웨어');
    await page.locator('[data-testid="search-button"]').click();
    await expect(page.locator('.search-results .resource-card')).toHaveCount({ min: 1 });
    
    // 일본어 검색
    await page.goto('/ja');
    await page.locator('[data-testid="search-input"]').fill('ソフトウェア');
    await page.locator('[data-testid="search-button"]').click();
    await expect(page.locator('.search-results .resource-card')).toHaveCount({ min: 1 });
  });

  // 필터링 및 페이지네이션 테스트
  test('should filter and paginate results', async ({ page }) => {
    await page.goto('/resources');
    
    // 카테고리 필터링
    await page.locator('[data-testid="category-filter"]').click();
    await page.locator('text=Software').click();
    await expect(page.locator('.resource-card')).toHaveCount({ min: 1 });
    
    // 다음 페이지로 이동
    await page.locator('[data-testid="next-page"]').click();
    await expect(page.url()).toContain('page=2');
  });

  // 사이드 메뉴 테스트
  test('should navigate through side menu', async ({ page }) => {
    await page.goto('/');
    
    // 리소스 페이지로 이동
    await page.locator('[data-testid="sidebar-resources"]').click();
    await expect(page.url()).toContain('/resources');
    
    // 서비스 페이지로 이동
    await page.locator('[data-testid="sidebar-services"]').click();
    await expect(page.url()).toContain('/services');
    
    // 경매 페이지로 이동
    await page.locator('[data-testid="sidebar-auctions"]').click();
    await expect(page.url()).toContain('/auctions');
    
    // 대시보드 페이지로 이동
    await page.locator('[data-testid="sidebar-dashboard"]').click();
    await expect(page.url()).toContain('/dashboard');
  });
});