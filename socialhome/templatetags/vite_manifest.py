import json
import os
from django import template
from django.conf import settings
from django.contrib.staticfiles import finders
from django.utils.safestring import mark_safe

register = template.Library()

@register.simple_tag
def vite_asset(entry_name, asset_type='js'):
    """
    Load asset from Vite manifest.json
    Usage: {% vite_asset 'main' 'js' %} or {% vite_asset 'main' 'css' %}
    """
    # Try the .vite subdirectory first (newer Vite versions)
    manifest_path = os.path.join(settings.STATIC_ROOT or 'socialhome/static', 'dist/svelte/.vite/manifest.json')

    # Fallback to the root dist directory
    if not os.path.exists(manifest_path):
        manifest_path = os.path.join(settings.STATIC_ROOT or 'socialhome/static', 'dist/svelte/manifest.json')

    # Fallback to finder if STATIC_ROOT doesn't exist (development)
    if not os.path.exists(manifest_path):
        manifest_file = finders.find('dist/svelte/.vite/manifest.json')
        if not manifest_file:
            manifest_file = finders.find('dist/svelte/manifest.json')
        if manifest_file:
            manifest_path = manifest_file

    try:
        with open(manifest_path, 'r') as f:
            manifest = json.load(f)

        # The entry key in manifest (e.g., 'src/main.ts')
        entry_key = f'src/{entry_name}.ts'

        if entry_key in manifest:
            entry = manifest[entry_key]

            if asset_type == 'js':
                return mark_safe(f'<script type="module" src="{settings.STATIC_URL}dist/svelte/{entry["file"]}"></script>')
            elif asset_type == 'css' and 'css' in entry:
                # Return the first CSS file
                css_files = [f'<link rel="stylesheet" href="{settings.STATIC_URL}dist/svelte/{css_file}">' for css_file in entry['css']]
                return mark_safe('\n'.join(css_files))

    except (FileNotFoundError, json.JSONDecodeError, KeyError):
        # Fallback to non-hashed names for development
        if asset_type == 'js':
            return mark_safe(f'<script type="module" src="{settings.STATIC_URL}{entry_name}.js"></script>')
        elif asset_type == 'css':
            return mark_safe(f'<link rel="stylesheet" href="{settings.STATIC_URL}{entry_name}.css">')

    return ''
