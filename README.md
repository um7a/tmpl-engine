# tmpl-engine

tmpl-engine is a template engine written in Node.js.

## Usage

```shell
npm install tmpl-engine
```

Example
```javascript
import * as j2 from 'tmpl-engine/jinja2'

const template = `Hello {{ name }}!`;
const context = { name: 'Alice' };
const rendered = j2.build(template, context);

console.log(rendered);
// -> 'Hello Alice!'
```