# socialhome-ui

Revamped socialhome UI. Scaffolding:

- Vue 3 (composition API)
- Vite
- Pinia
- PrimeVue
- Vue-router
- TailwindCSS

Closely based on design ideas pulled from this discussion: https://jasonrobinson.me/content/2992034/.

Aims to replace all views currently rendered by Django. SPA.

## Current state

Beta.

Uses CSS Level 3 grid masonry with Firefox  (with 
the layout.css.grid-template-masonry-value.enabled option set to true). ~~I naively
hope that by the time this UI becomes usable, other browsers will have implemented
css grid masonry (yeah, right). _At this stage, I think I'll consider using some
masonry library_.~~ I gave up and added vue-masonry-wall, but Firefox's implementation
works better IMHO.

### Status

At this stage, I consider the interface usable, but more exposure to actual production instance
is highly desirable. Except for what is mentioned below, the UI is on par with the old UI.

So far, the main improvements are:

- Ability to edit profile avatar, picture, name and bio
- A lot of efforts have been put in minimizing the need to do page reloads
- Localization (translations hosted on translate.codeberg.org)
- Markdown editor based on codemirror

A simple dynamic preference allowing switching back and forth between the old and the new UI has been
implemented on the backend (spa-ui-reqs branch). Note that currently users can switch to the new UI
from their Account page, but only an admin can switch them back through the django admin UI.

## TODO

Getting there slowly 🙂.

- Documentation
- UI help
- Registration form and api
- Oembed handling. This is mostly about getting the right height for iframes.
- Bookmarklet
- Show shares (within SingleContentContainer maybe?)
- Share replies
- ...

See Installation.md for installation instructions.

Instructions for running in development mode will be provided soon.
