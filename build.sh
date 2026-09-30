#!/usr/bin/env bash
# Собирает все части из src/ в один файл index.html
set -e
cd "$(dirname "$0")/src"
JS="10-data.js 12-projects.js 20-core.js 22-files.js 30-student.js 33-ai.js 34-resume.js 36-career.js 40-roles.js 50-actions.js 46-landing3.js 55-actions2.js 58-mobile.js 99-init.js"
{
  echo '<!DOCTYPE html>'; echo '<html lang="ru">'; echo '<head>'; echo '<meta charset="utf-8">'
  echo '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
  echo '<meta name="description" content="Делом — карьерная платформа для студентов: реальные проекты компаний, подтверждённые навыки и первая работа.">'
  cat 00-head.html 07-pwa.html
  echo '<style>'; echo 'html,body{margin:0}[hidden]{display:none!important}'; cat 01-base.css 02-extra.css 03-mobile.css; echo '</style>'
  echo '</head>'; echo '<body>'; cat 60-body.html
  echo '<script>'; cat $JS; echo '</script>'
  echo '</body>'; echo '</html>'
} > ../index.html
if command -v node >/dev/null; then cat $JS > /tmp/delom-all.js && node --check /tmp/delom-all.js && echo "JS: синтаксис в порядке"; fi
echo "Готово: index.html ($(wc -c < ../index.html) байт)"
