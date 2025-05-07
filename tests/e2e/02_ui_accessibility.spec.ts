import { test, expect } from '@playwright/test';

test.describe('UI and Accessibility', () => {
  // 모바일 뷰포트 테스트
  test('should render correctly on mobile viewport', async ({ page }) => {
    // 모바일 사이즈로 설정 (360x640)
    await page.setViewportSize({ width: 360, height: 640 });
    
    // 메인 페이지 로드
    await page.goto('/');
    
    // 헤더가 올바르게 표시되는지 확인
    await expect(page.locator('header')).toBeVisible();
    
    // 모바일 메뉴 토글 버튼이 보이는지 확인
    await expect(page.locator('[data-testid="mobile-menu-toggle"]')).toBeVisible();
    
    // 모바일 메뉴 열기
    await page.locator('[data-testid="mobile-menu-toggle"]').click();
    
    // 사이드 메뉴가 표시되는지 확인
    await expect(page.locator('nav')).toBeVisible();
    
    // 리소스 섹션 확인
    await page.goto('/resources');
    
    // 리소스 카드가 모바일 레이아웃에 맞게 표시되는지 확인
    await expect(page.locator('.resource-card')).toBeVisible();
  });
  
  // 데스크톱 뷰포트 테스트
  test('should render correctly on desktop viewport', async ({ page }) => {
    // 데스크톱 사이즈로 설정 (1920x1080)
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // 메인 페이지 로드
    await page.goto('/');
    
    // 헤더가 올바르게 표시되는지 확인
    await expect(page.locator('header')).toBeVisible();
    
    // 데스크톱에서는 메뉴가 항상 표시되는지 확인
    await expect(page.locator('nav')).toBeVisible();
    
    // 리소스 섹션 확인
    await page.goto('/resources');
    
    // 리소스 그리드가 데스크톱 레이아웃에 맞게 표시되는지 확인
    await expect(page.locator('.resource-grid')).toBeVisible();
  });
  
  // 접근성 테스트 - ARIA 및 탭 순서
  test('should have proper aria-labels and tab order', async ({ page }) => {
    await page.goto('/');
    
    // 주요 탐색 요소에 aria-label이 있는지 확인
    await expect(page.locator('nav[aria-label]')).toBeVisible();
    
    // 검색 필드가 적절한 aria-label을 가지고 있는지 확인
    await expect(page.locator('[data-testid="search-input"][aria-label]')).toBeVisible();
    
    // 이미지에 대체 텍스트가 있는지 확인
    await expect(page.locator('img[alt]')).toBeVisible();
    
    // 탭 포커스 테스트
    await page.keyboard.press('Tab');
    
    // 첫 번째 포커스 요소가 적절한지 확인
    const firstFocusedElement = await page.evaluate(() => {
      const activeElement = document.activeElement;
      return activeElement ? activeElement.tagName : null;
    });
    
    expect(firstFocusedElement).toBeTruthy();
  });
  
  // 사이드/탑 네비 스타일 테스트
  test('should show hover and active styles correctly', async ({ page }) => {
    await page.goto('/');
    
    // 사이드 메뉴 항목 위에 마우스 올리기
    await page.locator('nav a').first().hover();
    
    // 호버 스타일이 적용되었는지 확인 (클래스 변경 또는 스타일 속성 확인)
    const hasHoverClass = await page.locator('nav a').first().evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor !== 'rgba(0, 0, 0, 0)';
    });
    
    expect(hasHoverClass).toBeTruthy();
    
    // 메뉴 항목 클릭
    await page.locator('nav a').first().click();
    
    // 활성 스타일이 적용되었는지 확인
    const hasActiveClass = await page.locator('nav a').first().evaluate((el) => {
      return el.classList.contains('active') || 
             window.getComputedStyle(el).backgroundColor !== 'rgba(0, 0, 0, 0)';
    });
    
    expect(hasActiveClass).toBeTruthy();
  });
  
  // SNS 아이콘 링크 테스트
  test('should have correct SNS icon links', async ({ page }) => {
    await page.goto('/');
    
    // 푸터로 스크롤
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // SNS 아이콘이 표시되는지 확인
    await expect(page.locator('footer .social-icons')).toBeVisible();
    
    // 트위터 링크 확인
    const twitterLink = page.locator('footer .social-icons a[href*="twitter"]');
    await expect(twitterLink).toBeVisible();
    const twitterHref = await twitterLink.getAttribute('href');
    expect(twitterHref).toContain('twitter.com');
    
    // 인스타그램 링크 확인
    const instagramLink = page.locator('footer .social-icons a[href*="instagram"]');
    await expect(instagramLink).toBeVisible();
    const instagramHref = await instagramLink.getAttribute('href');
    expect(instagramHref).toContain('instagram.com');
    
    // 유튜브 링크 확인
    const youtubeLink = page.locator('footer .social-icons a[href*="youtube"]');
    await expect(youtubeLink).toBeVisible();
    const youtubeHref = await youtubeLink.getAttribute('href');
    expect(youtubeHref).toContain('youtube.com');
    
    // 깃허브 링크 확인
    const githubLink = page.locator('footer .social-icons a[href*="github"]');
    await expect(githubLink).toBeVisible();
    const githubHref = await githubLink.getAttribute('href');
    expect(githubHref).toContain('github.com');
    
    // 블로그 링크 확인
    const blogLink = page.locator('footer .social-icons a[href*="blog"]');
    await expect(blogLink).toBeVisible();
    const blogHref = await blogLink.getAttribute('href');
    expect(blogHref).toBeTruthy();
  });
});