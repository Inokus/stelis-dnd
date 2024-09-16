import { test, expect } from '@playwright/test';
import { asUser } from 'utils/api';
import { fakeUser } from 'utils/fakeData';

const user = fakeUser();

test.describe.serial('signup and login sequence', () => {
  test('visitor can signup', async ({ page }) => {
    await page.goto('/signup');

    await page.getByRole('textbox', { name: 'Username' }).fill(user.username);
    await page.getByRole('textbox', { name: 'Email' }).fill(user.email);
    await page.getByLabel('Password', { exact: true }).fill(user.password);
    await page.getByLabel('Confirm password', { exact: true }).fill(user.password);
    await page.getByRole('button', { name: 'Sign up' }).click();

    const toastMessage = page.locator('.p-toast-message-success');
    await toastMessage.waitFor();
    await expect(toastMessage).toBeVisible();
  });

  test('visitor can not access dashboard before login', async ({ page }) => {
    await page.goto('/');

    await page.waitForURL('/login');
    expect(page.url()).toContain('/login');
  });

  test('visitor can login', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('textbox', { name: 'Username' }).fill(user.username);
    await page.getByRole('textbox', { name: 'Password' }).fill(user.password);
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page).toHaveURL('/');
    await page.reload();
    await expect(page).toHaveURL('/');
  });

  test('visitor can logout', async ({ page }) => {
    const user = fakeUser();

    await asUser(page, user, async () => {
      await page.goto('/');
      const logoutLink = page.getByRole('button', { name: 'Log out' });

      await logoutLink.click();

      await expect(logoutLink).toBeHidden();

      await expect(page).toHaveURL('/login');

      await page.goto('/');
      await expect(logoutLink).toBeHidden();
      await expect(page).toHaveURL('/login');
    });
  });
});
