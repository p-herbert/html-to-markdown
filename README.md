# html-to-markdown

Simple HTML to Markdown parser

# Usage

```js
    const HtmlToMarkdown = require('html-to-markdown');
    const parser = new HtmlToMarkdown();
    const markdown = parser.parse('<h1>Hello World!</h1></br><p>I am a paragraph</p>');
```

# Options

The following options can be passed to the constructor:

| Options             | Default             |
|:--------------------|:--------------------|
| `underline`         | ``                  |
| `bold`              | `__`                |
| `paragraph`         | `\n`                |
| `br`                | ` `                 |
| `italic`            | `*`                 |
| `strike`            | `~~`                |
| `indent`            | `  `                |
| `unorderedListItem` | `-`                 |
| `code`              | ` `` `              |
| `pre`               | ` ``` `             |
| `blockquote`        | `>`                 |
| `heading`           | `#`                 |

# Acknowledgments

Thanks to [Sunsama](https://sunsama.com) for allowing me to open source this project.

