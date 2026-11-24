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

# Новые демонстрации также подключают неизменяемые версии файлов.
for slug in ['emal', 'kuhnya-ryadom', 'poluton']:
    project = root / 'projects' / slug
    page = project / 'index.html'
    if not page.exists():
        continue
    project_html = page.read_text(encoding='utf-8')
    app = (project / 'app.mjs').read_text(encoding='utf-8').replace('\r\n', '\n')
    for module in ['order', 'reservation']:
        dependency = project / f'{module}.mjs'
        if not dependency.exists():
            continue
        data = dependency.read_bytes().replace(b'\r\n', b'\n')
        module_name = f'{module}.{hashlib.sha256(data).hexdigest()[:12]}.mjs'
        (project / module_name).write_bytes(data)
        app = app.replace(f"'./{module}.mjs'", f"'./{module_name}'")
    for name, extension, attribute, data in [
        ('style', 'css', 'href', (project / 'style.css').read_bytes().replace(b'\r\n', b'\n')),
        ('app', 'mjs', 'src', app.encode('utf-8')),
    ]:
        filename = f'{name}.{hashlib.sha256(data).hexdigest()[:12]}.{extension}'
        pattern = rf'{attribute}="{name}(?:\.[a-f0-9]{{12}})?\.{extension}(?:\?v=\d+)?"'
        project_html, count = re.subn(pattern, f'{attribute}="{filename}"', project_html)
        if count != 1:
            raise ValueError(f'{slug}: ожидалось одно подключение {name}.{extension}, найдено {count}')
        (project / filename).write_bytes(data)
        print(f'{slug}/{filename}')
    page.write_text(project_html, encoding='utf-8', newline='\n')
