import { test, expect } from '@playwright/test'

// Basic smoke to ensure key pages respond and auth redirects occur.

test('home loads', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Select your access level')).toBeVisible()
})

test('protected routes redirect to login', async ({ page }) => {
  await page.goto('/driver')
  await expect(page).toHaveURL(/\/auth\/login/)
})

test('login page renders', async ({ page }) => {
  await page.goto('/auth/login')
  await expect(page.getByRole('button', { name: /login/i })).toBeVisible()
})
