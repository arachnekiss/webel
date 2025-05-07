import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Axe Accessibility Tests', () => {
  // 각 테스트 전에 실행
  test.beforeEach(async ({ page }) => {
    // 페이지 로드 후 axe 주입
    await page.goto('/');
    await injectAxe(page);
  });

  // 메인 페이지 접근성 테스트
  test('should pass accessibility checks on the main page', async ({ page }) => {
    // axe로 접근성 검사
    await checkA11y(page, undefined, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  });

  // 리소스 페이지 접근성 테스트
  test('should pass accessibility checks on the resources page', async ({ page }) => {
    await page.goto('/resources');
    await injectAxe(page);
    
    // axe로 접근성 검사
    await checkA11y(page, undefined, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  });

  // 서비스 페이지 접근성 테스트
  test('should pass accessibility checks on the services page', async ({ page }) => {
    await page.goto('/services');
    await injectAxe(page);
    
    // axe로 접근성 검사
    await checkA11y(page, undefined, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  });

  // 모바일 뷰포트에서 접근성 테스트
  test('should pass accessibility checks on mobile viewport', async ({ page }) => {
    // 모바일 사이즈로 설정 (360x640)
    await page.setViewportSize({ width: 360, height: 640 });
    await page.goto('/');
    await injectAxe(page);
    
    // axe로 접근성 검사
    await checkA11y(page, undefined, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  });

  // 데스크톱 뷰포트에서 접근성 테스트
  test('should pass accessibility checks on desktop viewport', async ({ page }) => {
    // 데스크톱 사이즈로 설정 (1920x1080)
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await injectAxe(page);
    
    // axe로 접근성 검사
    await checkA11y(page, undefined, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  });
});