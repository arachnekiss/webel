import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Core Flows', () => {
  // 기본 네비게이션 및 리소스 열람 테스트
  test('should navigate to main page and view resources', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Multilingual Engineering/);
    
    // 리소스 목록 페이지로 이동
    await page.locator('[data-testid="sidebar-resources"]').click();
    await expect(page.url()).toContain('/resources');
    
    // 리소스 카드가 표시되는지 확인
    await expect(page.locator('.resource-card')).toBeVisible();
    
    // 첫 번째 리소스 상세 페이지로 이동
    await page.locator('.resource-card').first().click();
    
    // 리소스 상세 정보 확인
    await expect(page.locator('.resource-detail')).toBeVisible();
    
    // 다운로드 버튼이 있는지 확인
    await expect(page.locator('[data-testid="download-button"]')).toBeVisible();
  });

  // 다국어 전환 테스트
  test('should switch between languages and verify UI changes', async ({ page }) => {
    await page.goto('/');
    
    // 기본 언어(영어) 확인
    await expect(page.locator('h1')).toContainText('Engineering');
    
    // 한국어로 전환
    await page.locator('[data-testid="language-selector"]').click();
    await page.locator('text=한국어').click();
    
    // UI 텍스트가 한국어로 변경됐는지 확인
    await expect(page.locator('h1')).toContainText('엔지니어링');
    await expect(page.locator('[data-testid="search-button"]')).toContainText('검색');
    
    // 일본어로 전환
    await page.locator('[data-testid="language-selector"]').click();
    await page.locator('text=日本語').click();
    
    // UI 텍스트가 일본어로 변경됐는지 확인
    await expect(page.locator('h1')).toContainText('エンジニアリング');
    await expect(page.locator('[data-testid="search-button"]')).toContainText('検索');
    
    // 영어로 다시 전환
    await page.locator('[data-testid="language-selector"]').click();
    await page.locator('text=English').click();
    
    // UI 텍스트가 영어로 복원됐는지 확인
    await expect(page.locator('h1')).toContainText('Engineering');
    await expect(page.locator('[data-testid="search-button"]')).toContainText('Search');
  });

  // 검색 및 필터링 테스트
  test('should search and filter resources', async ({ page }) => {
    await page.goto('/');
    
    // 검색어 입력 및 검색 실행
    await page.locator('[data-testid="search-input"]').fill('software');
    await page.locator('[data-testid="search-button"]').click();
    
    // 검색 결과 확인
    await expect(page.locator('.search-results')).toBeVisible();
    const searchResultCount = await page.locator('.search-results .resource-card').count();
    expect(searchResultCount).toBeGreaterThan(0);
    
    // 필터링 적용
    await page.locator('[data-testid="category-filter"]').click();
    await page.locator('text=Software').click();
    
    // 필터링 결과 확인
    const filteredResultCount = await page.locator('.resource-card').count();
    expect(filteredResultCount).toBeGreaterThan(0);
    
    // 페이지네이션 확인 (결과가 충분히 많다면)
    const nextPageButton = page.locator('[data-testid="next-page"]');
    if (await nextPageButton.isVisible()) {
      await nextPageButton.click();
      await expect(page.url()).toContain('page=2');
    }
  });

  // 다국어 검색 테스트
  test('should search in different languages', async ({ page }) => {
    // 한국어 검색
    await page.goto('/ko');
    await page.locator('[data-testid="search-input"]').fill('소프트웨어');
    await page.locator('[data-testid="search-button"]').click();
    
    // 한국어 검색 결과 확인
    await expect(page.locator('.search-results')).toBeVisible();
    
    // 일본어 검색
    await page.goto('/ja');
    await page.locator('[data-testid="search-input"]').fill('ソフトウェア');
    await page.locator('[data-testid="search-button"]').click();
    
    // 일본어 검색 결과 확인
    await expect(page.locator('.search-results')).toBeVisible();
  });

  // 비회원 업로드 테스트 (이미지)
  test('should upload image resource as guest', async ({ page }) => {
    // 업로드 페이지로 이동
    await page.goto('/resources/upload');
    
    // 제목 및 설명 입력
    await page.locator('[data-testid="title"]').fill('Test Image Upload');
    await page.locator('[data-testid="description"]').fill('This is a test image upload');
    
    // 카테고리 선택
    await page.locator('[data-testid="category-select"]').click();
    await page.locator('text=3D Model').click();
    
    // 태그 입력
    await page.locator('[data-testid="tags-input"]').fill('test');
    await page.keyboard.press('Enter');
    await page.locator('[data-testid="tags-input"]').fill('image');
    await page.keyboard.press('Enter');
    
    // 파일 업로드 (public 폴더에 테스트 이미지가 있다고 가정)
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('public/images/test-image.jpg');
    
    // 미리보기 확인
    await expect(page.locator('[data-testid="image-preview"]')).toBeVisible();
    
    // 업로드 버튼 클릭
    await page.locator('[data-testid="upload-button"]').click();
    
    // 성공 메시지 확인
    await expect(page.locator('.toast-success')).toBeVisible();
  });

  // YouTube URL 업로드 테스트
  test('should upload YouTube URL', async ({ page }) => {
    // 업로드 페이지로 이동
    await page.goto('/resources/upload');
    
    // YouTube URL 업로드 탭 선택
    await page.locator('[data-testid="youtube-tab"]').click();
    
    // 제목 및 설명 입력
    await page.locator('[data-testid="title"]').fill('Test YouTube Upload');
    await page.locator('[data-testid="description"]').fill('This is a test YouTube upload');
    
    // 카테고리 선택
    await page.locator('[data-testid="category-select"]').click();
    await page.locator('text=Free Content').click();
    
    // 태그 입력
    await page.locator('[data-testid="tags-input"]').fill('youtube');
    await page.keyboard.press('Enter');
    await page.locator('[data-testid="tags-input"]').fill('video');
    await page.keyboard.press('Enter');
    
    // YouTube URL 입력
    await page.locator('[data-testid="youtube-url"]').fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    
    // 미리보기 확인
    await expect(page.locator('[data-testid="youtube-preview"]')).toBeVisible();
    
    // 업로드 버튼 클릭
    await page.locator('[data-testid="upload-button"]').click();
    
    // 성공 메시지 확인
    await expect(page.locator('.toast-success')).toBeVisible();
  });

  // 리소스 삭제 및 대시보드 업데이트 테스트
  test('should delete resource and update dashboard', async ({ page }) => {
    // 로그인 (비회원 삭제가 불가능한 경우)
    await page.goto('/login');
    await page.locator('[data-testid="username"]').fill('testuser');
    await page.locator('[data-testid="password"]').fill('password123');
    await page.locator('[data-testid="login-button"]').click();
    
    // 대시보드로 이동
    await page.goto('/dashboard');
    
    // 리소스 갯수 확인
    const initialCount = await page.locator('.resource-card').count();
    
    // 첫 번째 리소스 삭제
    await page.locator('.resource-card').first().locator('[data-testid="delete-button"]').click();
    
    // 확인 대화상자에서 확인
    await page.locator('[data-testid="confirm-delete"]').click();
    
    // 성공 메시지 확인
    await expect(page.locator('.toast-success')).toBeVisible();
    
    // 페이지가 자동으로 갱신되었는지 확인
    await expect(page.locator('.resource-card')).toHaveCount(initialCount - 1);
  });

  // 사이드 메뉴 네비게이션 테스트
  test('should navigate through all 6 side menu items', async ({ page }) => {
    await page.goto('/');
    
    // 1. 근처 3D 프린터 메뉴
    await page.locator('[data-testid="sidebar-3d-printers"]').click();
    await expect(page.url()).toContain('/3d-printers');
    
    // 2. AI 조립 비서 메뉴
    await page.locator('[data-testid="sidebar-ai-assistant"]').click();
    await expect(page.url()).toContain('/ai-assistant');
    
    // 3. 조립 원격 지원 메뉴
    await page.locator('[data-testid="sidebar-remote-support"]').click();
    await expect(page.url()).toContain('/remote-support');
    
    // 4. 엔지니어 찾기 메뉴
    await page.locator('[data-testid="sidebar-find-engineer"]').click();
    await expect(page.url()).toContain('/engineers');
    
    // 5. 생산업체 찾기 메뉴
    await page.locator('[data-testid="sidebar-find-manufacturer"]').click();
    await expect(page.url()).toContain('/manufacturers');
    
    // 6. Webel 후원하기 메뉴
    await page.locator('[data-testid="sidebar-sponsor"]').click();
    await expect(page.url()).toContain('/sponsor');
  });

  // 유료 서비스 등록 및 전화번호/계좌 인증 테스트
  test('should show phone and bank verification form for paid service registration', async ({ page }) => {
    // 로그인
    await page.goto('/login');
    await page.locator('[data-testid="username"]').fill('testuser');
    await page.locator('[data-testid="password"]').fill('password123');
    await page.locator('[data-testid="login-button"]').click();
    
    // 서비스 등록 페이지로 이동
    await page.goto('/services/register');
    
    // 서비스 정보 입력
    await page.locator('[data-testid="service-title"]').fill('Professional Engineering Service');
    await page.locator('[data-testid="service-description"]').fill('High quality engineering service');
    
    // 서비스 타입 선택 (유료 서비스)
    await page.locator('[data-testid="service-type-select"]').click();
    await page.locator('text=Engineering').click();
    
    // 유료 서비스 선택
    await page.locator('[data-testid="paid-service"]').check();
    
    // 전화번호 인증 폼이 표시되는지 확인
    await expect(page.locator('[data-testid="phone-verification-form"]')).toBeVisible();
    
    // 계좌 정보 입력 폼이 표시되는지 확인
    await expect(page.locator('[data-testid="bank-account-form"]')).toBeVisible();
    
    // 전화번호 입력
    await page.locator('[data-testid="phone-input"]').fill('010-1234-5678');
    await page.locator('[data-testid="request-verification"]').click();
    
    // 인증 코드 입력 폼이 표시되는지 확인
    await expect(page.locator('[data-testid="verification-code-form"]')).toBeVisible();
  });
});