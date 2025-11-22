import { el } from '@webtaku/el';
import { h } from '@webtaku/h';
import type { AnyBuilder } from '../src';

// Shared components built on top of AnyBuilder
// -------------------------------------------

type ButtonProps = {
  label: string;
  href?: string;
  variant?: 'primary' | 'secondary';
};

const Button = (b: AnyBuilder, props: ButtonProps) => {
  const { label, href, variant = 'primary' } = props;

  const commonProps = {
    className: `btn ${variant}`,
    dataset: { variant },
    'aria-label': label,
  } as const;

  if (href) {
    return b('a.button', label, {
      ...commonProps,
      href,
      role: 'button',
    });
  }

  return b('button.button', label, {
    ...commonProps,
    type: 'button',
  });
};

type CardProps = {
  title: string;
  body: string;
  tag?: 'section' | 'article';
};

const Card = (b: AnyBuilder, { title, body, tag = 'section' }: CardProps) => {
  const selector = `${tag}.card` as const;

  return b(
    selector,
    b('header.card__header',
      b('h2.card__title', title),
    ),
    b('div.card__body', body),
  );
};

const Badge = (b: AnyBuilder, label: string) => {
  return b(
    'span.badge',
    label,
    {
      dataset: { label },
      style: { color: 'red', backgroundColor: 'black' },
      'aria-label': label,
    }
  );
};


// Tests
// -----

describe('@webtaku/any-builder integration', () => {
  describe('with el (DOM builder)', () => {
    it('renders a button component as a DOM element', () => {
      const element = Button(el, {
        label: 'Click me',
        href: '/home',
        variant: 'primary',
      }) as HTMLElement;

      expect(element instanceof HTMLAnchorElement).toBe(true);
      expect(element.tagName).toBe('A');
      expect(element.textContent).toBe('Click me');
      expect(element.getAttribute('href')).toBe('/home');
      expect(element.classList.contains('button')).toBe(true);
      expect(element.classList.contains('btn')).toBe(true);
      expect(element.classList.contains('primary')).toBe(true);
      expect(element.dataset.variant).toBe('primary');
      expect(element.getAttribute('aria-label')).toBe('Click me');
      expect(element.getAttribute('role')).toBe('button');
    });

    it('renders a button component without href as <button>', () => {
      const element = Button(el, {
        label: 'Submit',
        variant: 'secondary',
      }) as HTMLElement;

      expect(element instanceof HTMLButtonElement).toBe(true);
      expect(element.tagName).toBe('BUTTON');
      expect(element.textContent).toBe('Submit');
      expect(element.getAttribute('type')).toBe('button');
      expect(element.classList.contains('button')).toBe(true);
      expect(element.classList.contains('btn')).toBe(true);
      expect(element.classList.contains('secondary')).toBe(true);
      expect(element.dataset.variant).toBe('secondary');
    });

    it('renders a card component with nested structure', () => {
      const element = Card(el, {
        title: 'Hello',
        body: 'This is the body.',
      }) as HTMLElement;

      expect(element.tagName).toBe('SECTION');
      expect(element.classList.contains('card')).toBe(true);

      const header = element.querySelector('.card__header');
      const title = element.querySelector('.card__title');
      const body = element.querySelector('.card__body');

      expect(header).not.toBeNull();
      expect(title).not.toBeNull();
      expect(body).not.toBeNull();
      expect(title!.textContent).toBe('Hello');
      expect(body!.textContent).toBe('This is the body.');
    });

    it('supports custom tags via selector in components', () => {
      const element = Card(el, {
        title: 'Article title',
        body: 'Article body.',
        tag: 'article',
      }) as HTMLElement;

      expect(element.tagName).toBe('ARTICLE');
      expect(element.classList.contains('card')).toBe(true);
    });

    it('applies dataset, aria and style via ElementProps in Badge', () => {
      const element = Badge(el, 'New') as HTMLElement;

      expect(element.tagName).toBe('SPAN');
      expect(element.classList.contains('badge')).toBe(true);
      expect(element.textContent).toBe('New');
      expect(element.dataset.label).toBe('New');
      expect(element.getAttribute('aria-label')).toBe('New');

      const style = (element as HTMLElement).style;
      expect(style.color).toBe('red');
      expect(style.backgroundColor).toBe('black');
    });
  });

  describe('with h (HTML string builder)', () => {
    // Cast to AnyBuilder for the test environment; at runtime it's compatible
    const hb = h as unknown as AnyBuilder;

    it('renders a button component as an HTML string (anchor)', () => {
      const html = Button(hb, {
        label: 'Click me',
        href: '/home',
        variant: 'primary',
      }) as string;

      expect(typeof html).toBe('string');
      expect(html).toContain('<a');
      expect(html).toContain('class="button btn primary"');
      expect(html).toContain('href="/home"');
      expect(html).toContain('data-variant="primary"');
      expect(html).toContain('aria-label="Click me"');
      expect(html).toContain('>Click me</a>');
    });

    it('renders a button component as an HTML string (button)', () => {
      const html = Button(hb, {
        label: 'Submit',
        variant: 'secondary',
      }) as string;

      expect(typeof html).toBe('string');
      expect(html).toContain('<button');
      expect(html).toContain('class="button btn secondary"');
      expect(html).toContain('type="button"');
      expect(html).toContain('data-variant="secondary"');
      expect(html).toContain('>Submit</button>');
    });

    it('renders a card component with nested HTML', () => {
      const html = Card(hb, {
        title: 'Hello',
        body: 'This is the body.',
      }) as string;

      expect(typeof html).toBe('string');
      expect(html.startsWith('<section')).toBe(true);
      expect(html).toContain('class="card"');
      expect(html).toContain('<header class="card__header">');
      expect(html).toContain('<h2 class="card__title">Hello</h2>');
      expect(html).toContain('<div class="card__body">This is the body.</div>');
      expect(html).toContain('</section>');
    });

    it('supports custom tag selection inside a component', () => {
      const html = Card(hb, {
        title: 'Article title',
        body: 'Article body.',
        tag: 'article',
      }) as string;

      expect(html.startsWith('<article')).toBe(true);
      expect(html).toContain('class="card"');
      expect(html).toContain('</article>');
    });

    it('applies dataset, aria and style in Badge HTML string', () => {
      const html = Badge(hb, 'New') as string;

      expect(html.startsWith('<span')).toBe(true);
      expect(html).toContain('class="badge"');
      expect(html).toContain('data-label="New"');
      expect(html).toContain('aria-label="New"');
      expect(html).toContain('style="color: red; background-color: black"');
      expect(html).toContain('>New</span>');
    });
  });
});
