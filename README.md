# Leading Trim

CSS Leading Trim is a CSS property that allows you to remove the leading whitespace from a block of text. This is useful for removing the space between the top of the text and the top of the container.

## Usage

```css
.leading-trim {
  leading-trim: both;
  text-edge: cap alphabetic;
}
```

[![Animation cutting of both edges from a text](intro.webp)](https://medium.com/microsoft-design/leading-trim-the-future-of-digital-typesetting-d082d84b202)

[![example for ascender and cap height](ascender.png)](https://en.99designs.it/blog/tips/typography-design/)

## Browser Support

[Can I use](https://caniuse.com/#feat=sr_leading-trim-text-edge)

| Browser | Version |
| ------- | ------- |
| Chrome  |    -    |
| Firefox |    -    |
| Safari  |    -    |
| Opera   |    -    |
| IE      |    -    |

## Proposal

https://github.com/w3c/csswg-drafts/issues/3240
https://www.w3.org/TR/css-inline-3/#propdef-leading-trim

## Examples

### Centering text in buttons

```css
button {
    padding: 6px
}
````

![Button](button.webp)

With leading trim:

```css
button {
  leading-trim: both;
  text-edge: cap alphabetic;
  padding: 10px
}
```

![Button with leading trim](button-leading-trim.webp)

### Spacing Systems

Most design systems have a spacing system that is based on multiples of a base unit. For example, a spacing system might have a base unit of 4px, and then multiples of that unit, such as 8px, 12px, 16px, etc. This is a great way to ensure that spacing is consistent across the design system.

However the added line-height destroys the spacing system:

![Spacing systems without leading trim](spacing-system.webp)

### Icons

Aligning icons with text is a common problem. With leading trim, you can align the icon with the text:

[![Icon](icon.jpeg)](https://github.com/w3c/csswg-drafts/issues/3240)

[![Icon with leading trim](icon2.png)](https://iamvdo.me/en/blog/css-font-metrics-line-height-and-vertical-align)



### Images

In articles images are often placed next to images. The leading trim property allows you to remove the whitespace above the text to align the text with the image.

![Image](image.png)

### Art

Especially in logo design and art leading trim can be used to create aligned different text elements:

![Art](art.jpg)