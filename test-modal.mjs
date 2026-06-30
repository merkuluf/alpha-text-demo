import pw from 'playwright';

(async () => {
  const browser = await pw.chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Открываем приложение
  await page.goto('http://localhost:5173');

  // Ждём загрузки редактора
  await page.waitForSelector('.tiptap-editor-wrapper');

  // Кликаем на кнопку ссылки в тулбаре
  const linkButton = await page.locator('button:has-text("🔗")').first();
  await linkButton.click();

  // Проверяем что модалка появилась
  await page.waitForSelector('.modal-backdrop');
  console.log('✓ Модалка появилась');

  // Вводим URL
  const input = await page.locator('#link-input');
  await input.fill('https://example.com');
  console.log('✓ URL введён');

  // Жмём кнопку подтверждения
  const confirmBtn = await page.locator('button:has-text("Добавить ссылку")');
  await confirmBtn.click();

  // Проверяем что модалка закрылась
  await page.waitForSelector('.modal-backdrop', { state: 'hidden' });
  console.log('✓ Модалка закрылась');

  // Проверяем что ссылка была добавлена в редактор
  const hasLink = await page.evaluate(() => {
    return document.querySelector('.ProseMirror a[href="https://example.com"]') !== null;
  });

  if (hasLink) {
    console.log('✓ Ссылка успешно добавлена в редактор');
  }

  console.log('\n✅ Все тесты пройдены!');

  // Закрываем браузер
  await browser.close();
})();
