const AllHtmlEntities = require('html-entities').AllHtmlEntities;
const htmlTag = require('./utils.js');
const entities = new AllHtmlEntities();

class HtmlToMarkdown {
    constructor({
        underline = '',
        bold = '__',
        paragraph = '\n',
        br = ' ',
        italic = '*',
        strike = '~~',
        indent = '  ',
        unorderedListItem = '-',
        code = '`',
        pre = '```',
        blockquote = '>',
        heading = '#',
    } = {}) {
        this.tokens = [];
        this.openingTags = [];
        this.innerText = [''];
        this.listLevel = [];
        this.listLevelCount = [];

        this.UNDERLINE_CHAR = underline;
        this.BOLD_CHAR = bold;
        this.PARAGRAPH_CHAR = paragraph;
        this.BREAK_CHAR = br;
        this.ITALIC_CHAR = italic;
        this.STRIKE_CHAR = strike;
        this.INDENT_CHAR = indent;
        this.UNORDERED_LISTITEM_CHAR = unorderedListItem;
        this.PRE_CHAR = pre;
        this.CODE_CHAR = code;
        this.BLOCKQUOTE_CHAR = blockquote;
        this.HEADING_CHAR = heading;
    }
    tagTypeToMarkdown(tag) {
        const tagType = htmlTag.getTagType(tag);
        if (tagType === 'u') {
            return this.UNDERLINE_CHAR;
        } else if (tagType === 'b') {
            return this.BOLD_CHAR;
        } else if ((tagType === 'p' || tagType === 'div') && htmlTag.isClosingTag(tag)) {
            return this.PARAGRAPH_CHAR;
        } else if (tagType === 'br') {
            return this.BREAK_CHAR;
        } else if (tagType === 'i' || tagType === 'em') {
            return this.ITALIC_CHAR;
        } else if (tagType === 'a') {
            if (htmlTag.isOpeningTag(tag)) {
                return '[';
            }
            return ']';
        } else if (tagType === 's' || tagType === 'strike') {
            return this.STRIKE_CHAR;
        } else if (tagType === 'pre') {
            if (htmlTag.isOpeningTag(tag)) {
                return `${this.PRE_CHAR}\n`;
            }
            return `\n${this.PRE_CHAR}\n`;
        } else if (tagType === 'code' && !this.isCodeBlock()) {
            return this.CODE_CHAR;
        } else if (tagType === 'blockquote') {
            if (htmlTag.isOpeningTag(tag)) {
                return `${this.BLOCKQUOTE_CHAR}_`;
            }
            return '_';
        } else if (htmlTag.isHeadingTag(tag)) {
            const count = htmlTag.getHeadingCount(tag);
            if (htmlTag.isOpeningTag(tag)) {
                return `${this.HEADING_CHAR.repeat(count)} `;
            }
            return `\n`;
        }
        return '';
    }
    reset() {
        this.tokens = [];
        this.openingTags = [];
        this.innerText = [''];
        this.listLevel = [];
        this.listLevelCount = [];
    }
    indent(level) {
        return this.INDENT_CHAR.repeat(level);
    }
    append(token) {
        let text = this.pop(this.innerText);
        text += token;
        this.innerText[this.innerText.length - 1] = text;
    }
    addListLevel(isOrderList) {
        let level = this.pop(this.listLevel);
        level ? this.listLevel.push(++level) : this.listLevel.push(1);
        isOrderList ? this.listLevelCount.push(1) : this.listLevelCount.push(this.UNORDERED_LISTITEM_CHAR);
    }
    removeListLevel() {
        this.listLevel.pop();
        this.listLevelCount.pop();
    }
    increaseListLevel() {
        let count = this.pop(this.listLevelCount);
        const isUnOrderList = count === this.UNORDERED_LISTITEM_CHAR;
        this.listLevel.push((this.pop(this.listLevel) || 1));
        isUnOrderList ? this.listLevelCount.push(this.UNORDERED_LISTITEM_CHAR) : this.listLevelCount.push(++count);
    }
    pop(stack) {
        return stack[stack.length - 1];
    }
    peek(index) {
        return index < this.tokens.length - 1 ? this.tokens[index + 1] : null;
    }
    listItemIdentifier() {
        const count = this.pop(this.listLevelCount);
        const isUnOrderList = count === this.UNORDERED_LISTITEM_CHAR;
        return `${this.indent(this.pop(this.listLevel) - 1)}${count}${isUnOrderList ? ' ' : '. '}`;
    }
    isCodeBlock() {
        let hasOpenPreTag = false;

        this.openingTags.forEach(tag => {
            if (htmlTag.getTagType(tag) === 'pre') {
                hasOpenPreTag = true;
            }
        });

        return hasOpenPreTag;
    }
    parse(htmlString) {
        this.tokens = [...htmlTag.tokenize(htmlString)];
        let index = 0;
        let link = '';
        let token;

        while (index < this.tokens.length) {
            token = this.tokens[index];
            let text;

            if (htmlTag.isOpeningTag(token)) {
                if (!htmlTag.isBreakTag(token)) {
                    this.openingTags.push(token);
                }

                if (htmlTag.isOrderedListTag(token) || htmlTag.isUnorderdListTag(token)) {
                    this.addListLevel(htmlTag.isOrderedListTag(token));
                } else if (htmlTag.isLinkTag(token)) {
                    link = htmlTag.getLink(token);
                    text = this.tagTypeToMarkdown(token);
                } else if (htmlTag.isListItemTag(token)) {
                    text = this.listItemIdentifier();
                    this.increaseListLevel();
                } else {
                    text = this.tagTypeToMarkdown(token);
                }

                if (text) {
                    this.append(text);
                }
            } else if (htmlTag.isClosingTag(token)) {
                this.openingTags.pop();
                text = this.tagTypeToMarkdown(token);

                if (htmlTag.isOrderedListTag(token) || htmlTag.isUnorderdListTag(token)) {
                    const currentLevel = this.pop(this.listLevel);
                    while (this.pop(this.listLevel) === currentLevel) {
                        this.removeListLevel();
                    }
                } else if (htmlTag.isLinkTag(token)) {
                    text += `(${link})`;
                    link = '';
                }

                this.append(text);

                if (this.pop(this.innerText).length && (!this.openingTags.length || htmlTag.isListTag(this.pop(this.openingTags)))) {
                    this.innerText.push('');
                }
            } else if (htmlTag.isSingleTag(token)) {
                this.append(this.tagTypeToMarkdown(token));
            } else {
                this.append(token);
            }
            index++;
        }

        const markdown = this.innerText.filter($ => $).join('');
        this.reset();

        return entities.decode(markdown).trim();
    }
}

module.exports = HtmlToMarkdown;

