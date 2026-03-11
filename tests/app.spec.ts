import { test, expect } from '@playwright/test';

test.describe('AI Agent Platform', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/');

    // 检查页面标题
    await expect(page).toHaveTitle(/AI Agent Platform/);

    // 检查主要导航元素
    await expect(page.locator('nav')).toBeVisible();

    // 截图
    await page.screenshot({ path: 'tests/screenshots/homepage.png' });
  });

  test('navigation works', async ({ page }) => {
    await page.goto('/');

    // 点击 对话 导航
    await page.click('.nav-item:has-text("对话")');
    await expect(page.locator('.nav-item.active:has-text("对话")')).toBeVisible();

    // 点击 技能 导航
    await page.click('.nav-item:has-text("技能")');
    await expect(page.locator('.nav-item.active:has-text("技能")')).toBeVisible();

    // 点击 适配器 导航
    await page.click('.nav-item:has-text("适配器")');
    await expect(page.locator('.nav-item.active:has-text("适配器")')).toBeVisible();
  });

  test('skills page loads', async ({ page }) => {
    await page.goto('/');

    // 点击 Skills 导航
    await page.click('.nav-item:has-text("技能")');

    // 检查页面内容
    await expect(page.locator('.nav-item.active:has-text("技能")')).toBeVisible();

    // 检查新建按钮
    await expect(page.locator('button:has-text("新建 Skill")')).toBeVisible();
  });

  test('adapters page loads', async ({ page }) => {
    await page.goto('/');

    // 点击 Adapters 导航
    await page.click('.nav-item:has-text("适配器")');

    // 检查页面内容
    await expect(page.locator('.nav-item.active:has-text("适配器")')).toBeVisible();

    // 检查添加按钮
    await expect(page.locator('button:has-text("添加适配器")')).toBeVisible();
  });

  test('wizard page loads', async ({ page }) => {
    await page.goto('/');

    // 点击 Wizard 导航
    await page.click('.nav-item:has-text("向导")');

    // 检查页面内容
    await expect(page.locator('.nav-item.active:has-text("向导")')).toBeVisible();

    // 检查向导步骤（如果有）
    const steps = page.locator('.ant-steps');
    if (await steps.isVisible()) {
      await expect(steps).toBeVisible();
    }
  });
});
