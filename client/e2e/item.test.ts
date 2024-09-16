import { test, expect } from '@playwright/test';
import { asUser } from 'utils/api';
import { fakeCampaign, fakeItem, fakeUser } from 'utils/fakeData';

test.describe.serial('item creation and visibility', () => {
  test('admin can create a new item', async ({ page }) => {
    const admin = fakeUser();
    const campaign = fakeCampaign();
    const item = fakeItem();

    await asUser(
      page,
      admin,
      async () => {
        await page.goto('/');

        await page.getByRole('button', { name: 'Add New Campaign' }).click();
        await page.getByRole('textbox', { name: 'Name' }).fill(campaign.name);
        await page.getByRole('button', { name: 'Confirm' }).click();
        await page.getByRole('link', { name: campaign.name.toLocaleLowerCase() }).click();
        await page.getByRole('button', { name: 'Add new item' }).click();
        await page.getByRole('textbox', { name: 'Name' }).fill(item.name);
        await page.getByRole('spinbutton', { name: 'Value' }).fill(item.value);
        await page.getByRole('textbox', { name: 'Description' }).fill(item.description);
        await page.getByRole('button', { name: 'Confirm' }).click();

        const newItem = page.getByRole('cell', { name: item.name });
        await expect(newItem).toBeVisible();
        await page.reload();
        await expect(newItem).toBeVisible();
      },
      true
    );
  });
});
