# @webtaku/any-builder

A small, type-safe utility that enables **shared component APIs** using the same selector-based syntax across **HTML string builders** and **DOM element builders**.

This allows you to write components once and reuse them with both [`@webtaku/h`](https://github.com/webtaku/h) (HTML strings) and [`@webtaku/el`](https://github.com/webtaku/el) (DOM elements).

---

## Features

* Component builder abstraction via `AnyBuilder`
* Type-safe `Selector` syntax (`div#id.class`)
* Write a component **only once** and use it for:

  * **HTML string generation** (`h`)
  * **DOM element creation** (`el`)
* Supports attributes, DOM properties, dataset, ARIA attributes, and inline styles
* Simple and composable API

---

## Installation

```bash
yarn add @webtaku/any-builder
```

or

```bash
npm install @webtaku/any-builder
```

> Note: You will typically use this together with `@webtaku/h` or `@webtaku/el`.

---

## API

### `AnyBuilder`

Represents a builder function such as `h` or `el`.

```ts
type AnyBuilder = <S extends Selector>(
  selector: S,
  ...args: (HTMLElement | string | ElementProps<S> | null | undefined)[]
) => ElementBySelector<S> | string;
```

#### Parameters

* `selector`: A string such as `div`, `span#my-id`, `p.my-class`, `section#id.class`
* `...args`:

  * `HTMLElement` — appended as a child node (or rendered as `outerHTML`)
  * `string` — added as text or raw HTML
  * `ElementProps<S>` — sets properties, attributes, or inline styles

#### Returns

A union type:

| Builder | Return Type                 |
| ------- | --------------------------- |
| `h`     | `string` (HTML string)      |
| `el`    | `HTMLElement` (DOM element) |

---

## Shared Types

The package exports shared selector, element inference, and props types:

```ts
type Selector =
  | Tag
  | `${Tag}#${string}`
  | `${Tag}.${string}`
  | `${Tag}#${string}.${string}`;

type ElementBySelector<S extends Selector> = /* inferred HTML element type */;

type ElementProps<S extends Selector> =
  & Partial<Omit<ElementBySelector<S>, 'style'>>
  & {
    style?: Partial<CSSStyleDeclaration> | string;
    class?: string;
    dataset?: Record<string, string | number | boolean | null | undefined>;
    role?: string;
  }
  & DataAttributes
  & AriaAttributes;
```

| Supported Attribute Types                 |          |        |           |
| ----------------------------------------- | -------- | ------ | --------- |
| DOM properties                            |          |        |           |
| HTML attributes                           |          |        |           |
| inline styles (`object` or `string` form) |          |        |           |
| `data-*`                                  | `aria-*` | `role` | `dataset` |

---

## Usage

### Writing a Shared Component

```ts
// components/Button.ts
import type { AnyBuilder } from '@webtaku/any-builder';

type ButtonProps = {
  label: string;
  href?: string;
};

export function Button(b: AnyBuilder, { label, href }: ButtonProps) {
  if (href) {
    return b('a.button', label, { href, role: 'button' });
  }
  return b('button.button', label, { type: 'button' });
}
```

### Rendering as HTML String (`@webtaku/h`)

```ts
import { h } from '@webtaku/h';
import { Button } from './Button';

console.log(Button(h, { label: 'Home', href: '/' }));
// <a class="button" href="/" role="button">Home</a>
```

### Rendering as DOM Element (`@webtaku/el`)

```ts
import { el } from '@webtaku/el';
import { Button } from './Button';

document.body.appendChild(
  Button(el, { label: 'Home', href: '/' })
);
```

---

## Selector Syntax

The same selector rules as in `@webtaku/h` and `@webtaku/el`.

| Selector String       | Output / Meaning                    |
| --------------------- | ----------------------------------- |
| `''`                  | `<div>`                             |
| `'span'`              | `<span>`                            |
| `'div#app'`           | `<div id="app">`                    |
| `'p.text'`            | `<p class="text">`                  |
| `'section#main.hero'` | `<section id="main" class="hero">`  |
| `'my-element'`        | `<my-element>` (custom element tag) |

---

## ElementProps

Provides type-safe props based on the selector result.

```ts
{
  style?: Partial<CSSStyleDeclaration> | string;
  class?: string;
  dataset?: Record<string, string | number | boolean | null | undefined>;
  role?: string;
  [prop: string]: any;
}
```

### Example

```ts
b('button.primary',
  'Save',
  {
    type: 'button',
    style: { color: 'white' },
    'data-type': 'primary',
    'aria-label': 'Save changes'
  }
);
```

---

## Example: Layout Component

```ts
import type { AnyBuilder } from '@webtaku/any-builder';

export function Layout(b: AnyBuilder, title: string, body: string) {
  return b('div#app.container',
    b('header.header', b('h1', title)),
    b('main.content', body),
    b('footer.footer', '© 2025 Webtaku')
  );
}
```

**HTML Rendering**

```ts
import { h } from '@webtaku/h';
console.log(Layout(h, 'Hello', 'Rendered using h().'));
```

**DOM Rendering**

```ts
import { el } from '@webtaku/el';
document.body.appendChild(Layout(el, 'Hello', 'Rendered using el().'));
```

---

## License

MIT OR Apache-2.0

---

## Contributing

Contributions are welcome.
Feel free to open issues or submit pull requests to improve the library.
