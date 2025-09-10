const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const matter = require('gray-matter');
const config = require('./content-filter.config.cjs');

const VAULT_REPO = 'https://github.com/tmx487/learn-vault.git';
const TEMP_DIR = './temp-vault';
const CONTENT_DIR = './content';

// Функция проверки, нужно ли исключить файл
function shouldExcludeFile(filePath, relativePath, fileContent = '') {
  // Проверка по папкам
  for (const folder of config.excludedFolders) {
    if (relativePath.includes(folder)) {
      console.log(`🚫 Исключен по папке "${folder}": ${relativePath}`);
      return true;
    }
  }
  
  // Проверка по именам файлов
  const fileName = path.basename(filePath);
  if (config.excludedFiles.includes(fileName)) {
    console.log(`🚫 Исключен по имени: ${fileName}`);
    return true;
  }
  
  // Проверка по паттернам
  for (const pattern of config.excludedPatterns) {
    if (pattern.test(fileName)) {
      console.log(`🚫 Исключен по паттерну: ${fileName}`);
      return true;
    }
  }
  
  // Проверка frontmatter (только для .md файлов)
  if (path.extname(filePath) === '.md' && fileContent) {
    try {
      const parsed = matter(fileContent);
      const frontmatter = parsed.data;
      
      // Проверка по frontmatter полям
      for (const [key, value] of Object.entries(config.excludedByFrontmatter)) {
        if (frontmatter[key] === value) {
          console.log(`🚫 Исключен по frontmatter ${key}=${value}: ${fileName}`);
          return true;
        }
      }
      
      // Проверка по тегам
      const tags = frontmatter.tags || frontmatter.tag || [];
      const tagsArray = Array.isArray(tags) ? tags : [tags];
      
      for (const tag of tagsArray) {
        if (config.excludedTags.includes(tag)) {
          console.log(`🚫 Исключен по тегу "${tag}": ${fileName}`);
          return true;
        }
      }
    } catch (error) {
      console.warn(`⚠️ Ошибка парсинга frontmatter в ${fileName}: ${error.message}`);
    }
  }
  
  return false;
}

// Рекурсивное копирование с фильтрацией
function copyWithFilter(srcDir, destDir, basePath = '') {
  const items = fs.readdirSync(srcDir);
  
  for (const item of items) {
    const srcPath = path.join(srcDir, item);
    const relativePath = path.join(basePath, item);
    const destPath = path.join(destDir, relativePath);
    
    const stat = fs.statSync(srcPath);
    
    if (stat.isDirectory()) {
      // Проверяем, не исключена ли папка
      if (!shouldExcludeFile(srcPath, relativePath)) {
        fs.ensureDirSync(destPath);
        copyWithFilter(srcPath, destDir, relativePath);
      }
    } else if (stat.isFile()) {
      // Проверяем расширение файла
      const ext = path.extname(item).toLowerCase();
      const allowedExtensions = ['.md', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.pdf'];
      
      if (allowedExtensions.includes(ext)) {
        // Читаем содержимое для проверки frontmatter
        const fileContent = ext === '.md' ? fs.readFileSync(srcPath, 'utf8') : '';
        
        if (!shouldExcludeFile(srcPath, relativePath, fileContent)) {
          fs.ensureDirSync(path.dirname(destPath));
          fs.copyFileSync(srcPath, destPath);
          console.log(`✅ Скопирован: ${relativePath}`);
        }
      } else {
        console.log(`⏭️ Пропущен (неподдерживаемый формат): ${relativePath}`);
      }
    }
  }
}

async function syncVault() {
  try {
    console.log('🔄 Начинаем синхронизацию vault...');
    
    // Удаляем старые временные файлы
    if (fs.existsSync(TEMP_DIR)) {
      fs.removeSync(TEMP_DIR);
    }
    
    // Клонируем vault
    console.log('📥 Клонируем vault...');
    execSync(`git clone ${VAULT_REPO} ${TEMP_DIR}`, { stdio: 'inherit' });
    
    // Очищаем content
    console.log('🧹 Очищаем старый контент...');
    if (fs.existsSync(CONTENT_DIR)) {
      fs.removeSync(CONTENT_DIR);
    }
    fs.ensureDirSync(CONTENT_DIR);
    
    // Копируем с фильтрацией
    console.log('📋 Копируем файлы с применением фильтров...');
    copyWithFilter(TEMP_DIR, CONTENT_DIR);
    
    // Создаем индексную страницу если её нет
    const indexPath = path.join(CONTENT_DIR, 'index.md');
    if (!fs.existsSync(indexPath)) {
      const indexContent = `---
      title: Главная страница
      ---

      # sunny-bunny-docs-vault.

      ---

      *Последнее обновление: ${new Date().toLocaleDateString('ru-RU')}*
      `;
      fs.writeFileSync(indexPath, indexContent);
      console.log('✅ Создана главная страница');
    }
    
    // Удаляем временную папку
    fs.removeSync(TEMP_DIR);
    
    console.log('🎉 Синхронизация завершена успешно!');
    
    // Статистика
    const files = execSync(`find ${CONTENT_DIR} -name "*.md" | wc -l`).toString().trim();
    console.log(`📊 Опубликовано заметок: ${files}`);
    
  } catch (error) {
    console.error('❌ Ошибка синхронизации:', error.message);
    process.exit(1);
  }
}

syncVault();