import os
import glob
from django import template
from django.conf import settings

register = template.Library()


@register.simple_tag
def sveltekit_css():
    """Load all CSS files from SvelteKit build"""
    css_files = []
    css_path = os.path.join(settings.STATICFILES_DIRS[0], 'dist/sveltekit/client/_app/immutable/assets/')

    if os.path.exists(css_path):
        for css_file in sorted(glob.glob(os.path.join(css_path, '*.css'))):
            filename = os.path.basename(css_file)
            css_files.append(f'dist/sveltekit/client/_app/immutable/assets/{filename}')

    return css_files


@register.simple_tag
def sveltekit_js():
    """Load all JS entry files from SvelteKit build"""
    js_files = []
    entry_path = os.path.join(settings.STATICFILES_DIRS[0], 'dist/sveltekit/client/_app/immutable/entry/')

    if os.path.exists(entry_path):
        # Order matters: start.js should come before app.js
        for js_file in sorted(glob.glob(os.path.join(entry_path, '*.js'))):
            filename = os.path.basename(js_file)
            js_files.append(f'dist/sveltekit/client/_app/immutable/entry/{filename}')

    return js_files
