const htmlTag = {
    isOpeningTag(tag) {
        return />(?!\/)[^<]*\w+</.test(tag.split('').reverse().join(''));
    },
    isSingleTag(tag) {
        return tag.match(/^<[a-z]+\/>$/);
    },
    isClosingTag(tag) {
        return tag.substr(0, 2) === '</';
    },
    isTag(token) {
        return this.isOpeningTag(token) || this.isSingleTag(token) || this.isClosingTag(token);
    },
    getTagType(tag) {
        let type = '';
        const chars = tag.split('');

        // Remove '<'
        chars.shift();
        let char = chars.shift();

        // Tag is a closing tag
        if (char === '/') {
            char = chars.shift();
        }

        while (char !== ' ' && char !== '/' && char !== '>') {
            type += char;
            char = chars.shift();
        }

        return type;
    },
    isOrderedListTag(tag) {
        const tagType = this.getTagType(tag);
        return tagType === 'ol';
    },
    isUnorderdListTag(tag) {
        const tagType = this.getTagType(tag);
        return tagType === 'ul';
    },
    isListItemTag(tag) {
        const tagType = this.getTagType(tag);
        return tagType === 'li';
    },
    isListTag(tag) {
        return this.isOrderedListTag(tag) || this.isUnorderdListTag(tag) || this.isListItemTag(tag);
    },
    isLinkTag(tag) {
        const tagType = this.getTagType(tag);
        return tagType === 'a';
    },
    isHeadingTag(tag) {
        const tagType = this.getTagType(tag);
        return tagType.match(/h[1-6]/);
    },
    getHeadingCount(tag) {
        const tagType = this.getTagType(tag);
        return +tagType.substring(1, 2);
    },
    isDocType(tag) {
        return /^<!DOCTYPE/.test(tag);
    },
    isBreakTag(tag) {
        const tagType = this.getTagType(tag);
        return tagType === 'br';
    },
    getAttributes(tag) {
        const chars = tag.split('');
        const attributes = {};
        let attribute = '';
        let value = '';
        let sawEqualSign = false;

        chars.forEach((char, idx) => {
            if (char === ' ' || char === '>' || chars[idx + 1] === '>') {
                if (attribute.length && value.length) {
                    attributes[attribute] = value;
                }
                attribute = '';
                value = '';
                sawEqualSign = false;
            } else if (sawEqualSign && char !== '"' && char !== '\'') {
                value += char;
            }
            else if (char === '=') {
                sawEqualSign = true;
            } else if (char !== '"' && char !== '\'') {
                attribute += char;
            }
        });

        return attributes;
    },
    getLink(tag) {
        const attributes = this.getAttributes(tag);
        return attributes.href;
    },
    sameTagType(tag1, tag2) {
        return this.getTagType(tag1) === this.getTagType(tag2);
    },
    tokenize(html) {
        const chars = html.split('');
        const tokens = [];
        let tagIsOpen = false;
        let tag = '';
        let text = '';

        chars.forEach(char => {
            if (char === '<') {
                tag = '<';
                if (text !== '') {
                    tokens.push(text);
                    text = '';
                }
                tagIsOpen = true;
            } else if (char === '>') {
                tag += '>';
                tokens.push(tag);
                tag = '';
                tagIsOpen = false;
            } else if (tagIsOpen) {
                tag += char;
            } else {
                text += char;
            }
        });

        if (text.length) {
            tokens.push(text);
        }

        return tokens;
    },
};

module.exports = htmlTag;

