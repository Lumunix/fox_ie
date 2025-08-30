// credits: https://kerkour.com/vuejs-3-router-links-dynamic-vhtml
export default function linkify(element, $router) {
  const links = element.getElementsByTagName('a');
  Array.from(links).forEach((link) => {
    const classList = link.classList
    classList.add('content-link')
    if (link.hostname === window.location.hostname) {
      // ignore if onclick is already set
      // e.g. RouterLink
      if (link.onclick) {
        return;
      }

      link.onclick = (event) => {
        const { altKey, ctrlKey, metaKey, shiftKey, button, defaultPrevented } = event;
        // ignore with control keys
        if (metaKey || altKey || ctrlKey || shiftKey) {
          return;
        }

        // ignore when preventDefault called
        // e.g. if it's a router-link
        if (defaultPrevented) {
          return;
        }

        // ignore right clicks
        if (button !== undefined && button !== 0) {
          return;
        }

        // ignore if `target="_blank"`
        //const linkTarget = link.getAttribute('target');
        //if (linkTarget && /\b_blank\b/i.test(linkTarget)) {
        //  return;
        //}

        let url = null;
        try {
          url = new URL(link.href);
        } catch (err) {
          return;
        }

        const to = url.pathname;
        // ignore same page links with anchors
        if (url.hash && window.location.pathname === to) {
          return;
        }

        event.preventDefault();
        $router.push(to);
      }
    }
  });
}
