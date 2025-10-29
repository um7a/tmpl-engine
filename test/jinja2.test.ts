import assert from "node:assert/strict";
import { describe, it } from "node:test";
import * as j2 from '../src/jinja2/index.js';

describe("Jinja2 Template Engine", () => {
  describe("Variable Substitution", () => {
    it("A variable can be substituted.", () => {
      const template = `var1 = {{ var1 }}`;
      const context = { var1: 1 };
      const result = j2.build(template, context);
      assert.equal(result, "var1 = 1");
    });

    it("Multiple variables can be substituted.", () => {
      const template = `var1 = {{ var1 }}, var2 = {{ var2 }}, var3 = {{ var3 }}`;
      const context = { var1: 'A', var2: 'B', var3: 'C' };
      const result = j2.build(template, context);
      assert.equal(result, "var1 = A, var2 = B, var3 = C");
    });

    it("An undefined variable raises an error.", () => {
      const template = `var_undefined = {{ var_undefined }}`;
      const context = { var1: 1 };
      assert.throws(() => {
        j2.build(template, context);
      });
    });
  });

  describe("For Loop", () => {
    it("A for loop over a list works.", () => {
      const template = `{% for item in items %}
- {{ item }}
{% endfor %}`;
      const context = { items: ['x', 'y', 'z'] };
      const result = j2.build(template, context, console.log);
      const expected = `- x
- y
- z`;
      assert.equal(result, expected);
    });

    it("A nested for loop works.", () => {
      const template = `{% for sublist in list_of_lists %}
Sublist:
{% for item in sublist %}
- {{ item }}
{% endfor %}
{% endfor %}`;
      const context = {
        list_of_lists: [
          ['a1', 'a2'],
          ['b1', 'b2', 'b3'],
        ],
      };
      const result = j2.build(template, context);
      const expected = `Sublist:
- a1
- a2
Sublist:
- b1
- b2
- b3`;
      assert.equal(result, expected);
    });

    it("A triple nested for loop works.", () => {
      const template = `{% for list_level_1 in lists_level_1 %}
Level 1:
{% for list_level_2 in list_level_1 %}
Level 2:
{% for item in list_level_2 %}
- {{ item }}
{% endfor %}
{% endfor %}
{% endfor %}`;
      const context = {
        lists_level_1: [
          [
            ['l1_item1', 'l1_item2'],
            ['l1_item3'],
          ],
          [
            ['l2_item1', 'l2_item2', 'l2_item3'],
          ],
        ],
      };
      const result = j2.build(template, context);
      const expected = `Level 1:
Level 2:
- l1_item1
- l1_item2
Level 2:
- l1_item3
Level 1:
Level 2:
- l2_item1
- l2_item2
- l2_item3`;
      assert.equal(result, expected);
    });
  });

  describe("If Statement", () => {
    it("An if statement works.", () => {
      const template = `{% if condition %}
Condition is true.
{% endif %}`;
      const context = { condition: true };
      const result = j2.build(template, context);
      const expected = `Condition is true.`;
      assert.equal(result, expected);
    });

    it("An if-else statement works.", () => {
      const template = `{% if condition %}
Condition is true.
{% else %}
Condition is false.
{% endif %}`;
      const contextTrue = { condition: true };
      const resultTrue = j2.build(template, contextTrue);
      const expectedTrue = `Condition is true.`;
      assert.equal(resultTrue, expectedTrue);

      const contextFalse = { condition: false };
      const resultFalse = j2.build(template, contextFalse);
      const expectedFalse = `Condition is false.`;
      assert.equal(resultFalse, expectedFalse);
    });

    it("An if-elif-else statement works.", () => {
      const template = `{% if score >= 90 %}
Grade: A
{% elif score >= 80 %}
Grade: B
{% else %}
Grade: C
{% endif %}`;
      const contextA = { score: 95 };
      const resultA = j2.build(template, contextA);
      const expectedA = `Grade: A`;
      assert.equal(resultA, expectedA);

      const contextB = { score: 85 };
      const resultB = j2.build(template, contextB);
      const expectedB = `Grade: B`;
      assert.equal(resultB, expectedB);

      const contextC = { score: 70 };
      const resultC = j2.build(template, contextC);
      const expectedC = `Grade: C`;
      assert.equal(resultC, expectedC);
    });
  });

  describe("Comments", () => {
    it("Comments are ignored in the output.", () => {
      const template = `This is visible text.
{# This is a comment and should be ignored #}
This is more visible text.
`;
      const context = {};
      const result = j2.build(template, context);
      const expected = `This is visible text.
This is more visible text.
`;
      assert.equal(result, expected);
    });
  });

  describe("Edge Cases", () => {
    it("An empty template returns an empty string.", () => {
      const template = "";
      const context = {};
      const result = j2.build(template, context);
      assert.equal(result, "");
    });
  });
});
