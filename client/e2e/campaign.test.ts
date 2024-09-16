import { test, expect } from '@playwright/test';
import { asUser } from 'utils/api';
import { fakeCampaign, fakeUser } from 'utils/fakeData';

test.describe.serial('campaign creation and visibility', () => {
  test('admin can create a new campaign', async ({ page }) => {
    const admin = fakeUser();
    const campaign = fakeCampaign();

    await asUser(
      page,
      admin,
      async () => {
        await page.goto('/');

        await page.getByRole('button', { name: 'Add New Campaign' }).click();
        await page.getByRole('textbox', { name: 'Name' }).fill(campaign.name);
        await page.getByRole('button', { name: 'Confirm' }).click();

        const newCampaign = page.getByRole('link', { name: campaign.name.toLocaleLowerCase() });
        await expect(newCampaign).toBeVisible();
        await page.reload();
        await expect(newCampaign).toBeVisible();
      },
      true
    );
  });

  test('user can not initially see any campaigns', async ({ page }) => {
    const user = fakeUser();

    await asUser(page, user, async () => {
      await page.goto('/');

      await expect(page.locator('body')).toContainText(
        "There's currently no campaigns to display."
      );
    });
  });
});
