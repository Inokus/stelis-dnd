import { test, expect } from '@playwright/test';
import { asUser } from 'utils/api';
import { fakeCampaign, fakeCharacter, fakeUser } from 'utils/fakeData';

test.describe.serial('character creation and visibility', () => {
  test('admin can create a new character', async ({ page }) => {
    const admin = fakeUser();
    const campaign = fakeCampaign();
    const character = fakeCharacter();

    await asUser(
      page,
      admin,
      async () => {
        await page.goto('/');

        await page.getByRole('button', { name: 'Add New Campaign' }).click();
        await page.getByRole('textbox', { name: 'Name' }).fill(campaign.name);
        await page.getByRole('button', { name: 'Confirm' }).click();
        await page.getByRole('link', { name: campaign.name.toLocaleLowerCase() }).click();
        await page.locator('.p-select-dropdown').click();
        await page.getByRole('option', { name: 'New character' }).click();
        await page.getByRole('textbox', { name: 'Name' }).fill(character.name);
        await page.getByRole('button', { name: 'Confirm' }).click();

        await page.locator('.p-select-dropdown').click();
        const newCharacter = page.getByRole('option', { name: character.name });
        await expect(newCharacter).toBeVisible();
        await page.reload();
        await page.locator('.p-select-dropdown').click();
        await expect(newCharacter).toBeVisible();
      },
      true
    );
  });
});
