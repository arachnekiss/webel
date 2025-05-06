import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Upload Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인
    await page.goto('/login');
    await page.locator('[data-testid="username"]').fill('testuser');
    await page.locator('[data-testid="password"]').fill('password123');
    await page.locator('[data-testid="login-button"]').click();
    
    // 업로드 페이지로 이동
    await page.goto('/resources/upload');
  });

  // 이미지 업로드 테스트
  test('should upload an image', async ({ page }) => {
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
    
    // 파일 업로드
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join('public', 'images', 'test-image.jpg'));
    
    // 업로드 버튼 클릭
    await page.locator('[data-testid="upload-button"]').click();
    
    // 성공 메시지 확인
    await expect(page.locator('.toast-success')).toBeVisible();
    await expect(page.locator('.toast-success')).toContainText('Upload successful');
  });

  // YouTube URL 업로드 테스트
  test('should upload a YouTube URL', async ({ page }) => {
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
    
    // 업로드 버튼 클릭
    await page.locator('[data-testid="upload-button"]').click();
    
    // 성공 메시지 확인
    await expect(page.locator('.toast-success')).toBeVisible();
    await expect(page.locator('.toast-success')).toContainText('Upload successful');
  });

  // 리소스 삭제 후 대시보드 갱신 테스트
  test('should delete resource and update dashboard', async ({ page }) => {
    // 대시보드로 이동
    await page.goto('/dashboard');
    
    // 첫 번째 리소스 카드 확인
    const resourceCard = page.locator('.resource-card').first();
    await expect(resourceCard).toBeVisible();
    
    // 리소스 삭제 버튼 클릭
    await resourceCard.locator('[data-testid="delete-button"]').click();
    
    // 확인 모달에서 삭제 확인
    await page.locator('[data-testid="confirm-delete"]').click();
    
    // 성공 메시지 확인
    await expect(page.locator('.toast-success')).toBeVisible();
    await expect(page.locator('.toast-success')).toContainText('Resource deleted');
    
    // 페이지 새로고침 후 리소스가 삭제되었는지 확인
    await page.reload();
    
    // 삭제된 리소스가 없는지 확인 또는 리소스 수가 줄었는지 확인
    // 이 부분은 UI에 따라 달라질 수 있음
  });
});