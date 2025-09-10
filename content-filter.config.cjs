module.exports = {
  // Исключаемые папки (регистр важен!)
  excludedFolders: [
    'Проекты',
    'Работа',
    'Шаблоны',
    'Work/Confidential',
    'Контакты',
    'TeacherResource',
    'windows',
    'Дневник',
    'Библиотека',
    'Обучение/Менторство/Декларации/',
    'Обучение/Менторство/Для\ легенды/',
    'Обучение/Менторство/Созвоны/',
    'Обучение/Менторство/OLD\ Карточки/',
    'Обучение/Менторство/CrackInterviewBot/',
    'Обучение/Менторство/Mentorship.LiveCoding/',
    '.obsidian',
    '.trash'
  ],
  
  // Исключаемые файлы по имени
  excludedFiles: [
    '111.md',
    'emoji for Google Calendar.md',
    'style.css',
    'Обучение/Менторство/Самопрезентация.md',
    'Обучение/Менторство/теоретические\ материалы\ из\ Code\ Review.md',
    'Обучение/Менторство/Установка\ своего\ VPN.pdf',
    'Обучение/Менторство/Что\ выведет\ код.md',
    'Обучение/Менторство/McpConfig.json',
    'Обучение/Менторство/*.zip',
    'Обучение/Программирование/credentials.md',
    'Обучение/Программирование/temporary file.md'
  ],
  
  // Исключаемые теги (заметки с этими тегами не будут опубликованы)
  excludedTags: [
    'private',
    'personal',
    'draft'
  ],
  
  // Исключаемые по frontmatter
  excludedByFrontmatter: {
    // Исключить если publish: false
    publish: false,
    // Исключить если draft: true
    draft: true,
    // Исключить если private: true
    private: true
  },
  
  // Паттерны имен файлов для исключения (regex)
  excludedPatterns: [
    /^_.*\.md$/, // файлы начинающиеся с _
    /.*\.private\.md$/, // файлы заканчивающиеся на .private.md
    /^\d{4}-\d{2}-\d{2}.*\.md$/, // ежедневные заметки в формате YYYY-MM-DD
  ]
};