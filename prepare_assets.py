"""Создать файлы CSS/JS с хешем содержимого перед публикацией GitHub Pages."""
import hashlib
from pathlib import Path
import re

root = Path(__file__).resolve().parent
index = root / 'index.html'
html = index.read_text(encoding='utf-8-sig')
for name, extension, attribute in [('styles', 'css', 'href'), ('script', 'js', 'src')]:
    data = (root / f'{name}.{extension}').read_text(encoding='utf-8-sig').replace('\r\n', '\n').encode('utf-8')
    fingerprint = hashlib.sha256(data).hexdigest()[:12]
    filename = f'{name}.{fingerprint}.{extension}'
    pattern = rf'{attribute}="{name}(?:\.[a-f0-9]{{12}})?\.{extension}"'
    html, count = re.subn(pattern, f'{attribute}="{filename}"', html)
    if count != 1:
        raise ValueError(f'Ожидалось одно подключение {name}.{extension}, найдено {count}')
    (root / filename).write_bytes(data)
    print(filename)
# Старые версии сохраняются, чтобы ранее закэшированный HTML продолжал работать.
index.write_text(html, encoding='utf-8', newline='\n')
