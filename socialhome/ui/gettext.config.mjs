export default {
  input: {
    parserOptions: {
      overrideDefaultKeywords: true,
      mapping: // custom extractor keyword. default empty.
        {
          simple: ['$gettext', '__'], // only extractor default keyword such as $gettext,use keyword to custom
          plural: ['$ngettext', '_x'],
          ctxPlural: ['$npgettext', '_nx'],
          ctx: ['$pgettext', '_n']
        }
    },
  },
  output: {
    locales: ["fr", "fr_CA", "de", "zh_Hans"],
  },
}
