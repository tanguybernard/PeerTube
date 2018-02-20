import { Injectable } from '@angular/core'

import * as MarkdownIt from 'markdown-it'

@Injectable()
export class MarkdownService {
  private markdownIt: MarkdownIt.MarkdownIt
  private linkifier: MarkdownIt.MarkdownIt

  constructor () {
    this.markdownIt = new MarkdownIt('zero', { linkify: true, breaks: true })
      .enable('linkify')
      .enable('autolink')
      .enable('emphasis')
      .enable('link')
      .enable('newline')
      .enable('list')
    this.setTargetToLinks(this.markdownIt)

    this.linkifier = new MarkdownIt('zero', { linkify: true })
      .enable('linkify')
    this.setTargetToLinks(this.linkifier)
  }

  markdownToHTML (markdown: string) {
    const html = this.markdownIt.render(markdown)

    // Avoid linkify truncated links
    return html.replace(/<a[^>]+>([^<]+)<\/a>\s*...(<\/p>)?$/mi, '$1...')
  }

  linkify (text: string) {
    return this.linkifier.render(text)
  }

  private setTargetToLinks (markdownIt: MarkdownIt.MarkdownIt) {
    // Snippet from markdown-it documentation: https://github.com/markdown-it/markdown-it/blob/master/docs/architecture.md#renderer
    const defaultRender = markdownIt.renderer.rules.link_open || function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options)
    }

    markdownIt.renderer.rules.link_open = function (tokens, idx, options, env, self) {
      // If you are sure other plugins can't add `target` - drop check below
      const aIndex = tokens[idx].attrIndex('target')

      if (aIndex < 0) {
        tokens[idx].attrPush(['target', '_blank']) // add new attribute
      } else {
        tokens[idx].attrs[aIndex][1] = '_blank'    // replace value of existing attr
      }

      // pass token to default renderer.
      return defaultRender(tokens, idx, options, env, self)
    }
  }
}
