# Адаптивное текстовое поле ввода для всех вьюпортов

## Описание задачи

Реализовать полностью адаптивное текстовое поле ввода (input/textarea), которое выглядит идеально на всех современных вьюпортах: мобильных (320px–480px), планшетных (768px) и десктопных (1280px+).

## Требования

### Функциональность

- [ ] HTML структура с семантичными тегами
- [ ] Поддержка как `<input type="text">` так и `<textarea>`
- [ ] Состояния: default, hover, focus, disabled, error
- [ ] Placeholder текст, видимый и читаемый на всех размерах
- [ ] Валидация с визуальной обратной связью

### Адаптивность (Viewport breakpoints)

#### Мобильные (320px–480px)

- Ширина: 100% с отступами 16px с обеих сторон
- Высота padding: 14px горизонтально, 12px вертикально
- Font-size: минимум 16px (предотвращение автозума)
- Высота элемента: минимум 44px (touch-friendly)
- Border-radius: 4–6px
- Line-height: 1.5

#### Планшеты (768px)

- Ширина: max-width 600px (не занимает весь экран)
- Padding: 12px 16px
- Font-size: 16px
- Border-radius: 6px

#### Десктопы (1280px+)

- Ширина: max-width 500px для обычного input, шире для textarea
- Padding: 12px 16px
- Font-size: 16px
- Border-radius: 6px
- Плавный переход между состояниями

### Стилизация

#### Цветовая схема

- Border color (default): #d0d0d0
- Border color (focus): #007AFF или выбрать свой accent color
- Focus shadow: 0 0 0 3px rgba(0, 122, 255, 0.1)
- Background: #ffffff
- Text color: #1a1a1a
- Placeholder color: #999999

#### Переходы

- Все интерактивные изменения: transition 0.2s ease-in-out
- Border-color, box-shadow, background-color должны быть smooth

#### Доступность (a11y)

- Видимый focus state (не удалять outline без замены)
- Достаточный контраст текста (WCAG AA)
- Поддержка label элементов (связь с input через for/id)
- Читаемый размер шрифта (минимум 14px, лучше 16px)

### Обработка ошибок

- Дополнительный класс `.input-error` для визуализации ошибки
- Red border: #dc3545 или выбрать свой цвет ошибки
- Error message под полем (малый размер шрифта, красный цвет)
- Плавное появление error message

## Файловая структура

```
├── index.html          # HTML разметка с примерами
├── styles.css          # CSS с media queries для всех вьюпортов
└── script.js          # (опционально) валидация и интерактивность
```

## Примеры использования в HTML

```html
<div class="form-group">
  <label for="username">Имя пользователя</label>
  <input type="text" id="username" class="input-field" placeholder="Введите имя" />
</div>

<div class="form-group">
  <label for="message">Сообщение</label>
  <textarea
    id="message"
    class="input-field"
    placeholder="Ваше сообщение здесь..."
    rows="4"
  ></textarea>
</div>

<div class="form-group">
  <label for="email">Email</label>
  <input type="email" id="email" class="input-field input-error" placeholder="example@mail.com" />
  <span class="input-error-message">Некорректный формат email</span>
</div>

<div class="form-group">
  <label for="disabled">Отключённое поле</label>
  <input type="text" id="disabled" class="input-field" disabled placeholder="Это поле отключено" />
</div>
```

## Критерии успеха

- ✅ Поле выглядит хорошо на всех breakpoint'ах без горизонтального скролла
- ✅ Touch-friendly размеры на мобиле (44px+ высота)
- ✅ Font-size 16px на мобилях предотвращает автозум
- ✅ Focus состояние ясно видно и доступно (outline/shadow)
- ✅ Error состояние визуально отличается (красный border/shadow)
- ✅ Нет скачков/прыганий при переходе между состояниями (все плавно)
- ✅ Работает без JavaScript (базовая функциональность)
- ✅ Поддерживает все браузеры: Chrome, Firefox, Safari, Edge

## Дополнительные идеи (nice-to-have)

- Анимация label при фокусе (label плывёт вверх, как в Material Design)
- Icon'ы внутри input'а (search icon, clear button)
- Счётчик символов для textarea
- Плавная смена состояний при вводе
- Тёмный режим (dark mode) поддержка

## Инструкции для выполнения

1. Создать HTML разметку с примерами всех типов input'ов
2. Написать базовый CSS с классом `.input-field`
3. Добавить media queries для breakpoint'ов: 480px, 768px, 1280px
4. Убедиться, что все состояния (focus, error, disabled) работают
5. Проверить на мобильных эмуляторах (DevTools) все sizes
6. Протестировать доступность (tab navigate, screen reader friendly)
