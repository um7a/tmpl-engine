# tmpl-engine

tmpl-engine is a template engine written in Node.js.

## Installation

```shell
npm install tmpl-engine
```

## Usage

### Jinja2-Style Templates

Example:

```javascript
import * as j2 from 'tmpl-engine/jinja2'

const template = `Hello {{ name }}!`;
const context = { name: 'Alice' };
const rendered = j2.build(template, context);

console.log(rendered);
// -> 'Hello Alice!'
```

The following Jinja2-style template syntax is supported:

- `{{ variable }}`
  ```javascript
  const template = `Hello {{ name }}!`;
  const context = { name: 'Alice' };
  const rendered = j2.build(template, context);
  // -> Hello Alice!
  ```

- `{% for item in items %} ... {% endfor %}`
  ```javascript
  const template = `{% for item in items %}
  - {{ item }}
  {% endfor %}`;
  const context = { items: ['x', 'y', 'z'] };
  const rendered = j2.build(template, context);
  // -> - x
  //    - y
  //    - z
  ```

- `{% if condition %} ... {% elif condition %} ... {% else %} ... {% endif %}`
  ```javascript
  const template = `{% if score >= 90 %}
  Grade: A
  {% elif score >= 80 %}
  Grade: B
  {% else %}
  Grade: C
  {% endif %}`;
  const context = { score: 95 };
  const rendered = j2.build(template, context);
  // -> Grade: A
  ```

- `{# comments #}`
  ```javascript
  const template = `This is visible text.
  {# This is a comment and should be ignored #}
  This is more visible text.`;
  const context = {};
  const rendered = j2.build(template, context);
  // -> This is visible text.
  //    This is more visible text.
  ```