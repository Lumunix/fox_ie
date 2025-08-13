import os
import subprocess
from django.core.management.base import BaseCommand
from django.conf import settings

class Command(BaseCommand):
    help = 'Build Svelte components using Vite'

    def handle(self, *args, **options):
        ui_path = os.path.join(settings.BASE_DIR, 'socialhome', 'ui')
        try:
            # Run npm build in the UI directory
            result = subprocess.run(['npm', 'run', 'build'],
                                  cwd=ui_path,
                                  check=True,
                                  capture_output=True,
                                  text=True)
            self.stdout.write(
                self.style.SUCCESS('Successfully built Svelte components')
            )
        except subprocess.CalledProcessError as e:
            self.stdout.write(
                self.style.ERROR(f'Build failed: {e.stderr}')
            )
