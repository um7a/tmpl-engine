// Built-in modules
// External modules
import { Parser } from 'expr-eval';
// Local modules

function conditionIsTrue(condition: string, context: Record<string, any>, logger?: (...data: any[]) => void): boolean {
  logger?.(`Evaluating condition: '${condition}' with context: ${JSON.stringify(context, null, 2)}`);

  // Replace Jinja2-style operators with JS equivalents
  condition = condition
    .replace(/\band\b/g, '&&')
    .replace(/\bor\b/g, '||')
    .replace(/\bnot\b/g, '!');

  try {
    const parser = new Parser({
      operators: {
        logical: true,
        comparison: true,
        conditional: false,
        assignment: false
      }
    });
    const parsed = parser.parse(condition);
    return parsed.evaluate(context);
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(`Failed to evaluate condition '${condition}': ${err.message}`);
    } else {
      throw new Error(`Failed to evaluate condition '${condition}': unknown error`);
    }
  }
}

export function build(template: string, context: Record<string, any>, logger?: (...data: any[]) => void): string {
  logger?.(`build() called with template:\n${template}\nand context:\n${JSON.stringify(context, null, 2)}`);

  const templateLines = template.split('\n');
  logger?.(`Template has ${templateLines.length} lines.`);
  logger?.(`Template lines: ${JSON.stringify(templateLines, null, 2)}`);
  if (templateLines.length === 0) {
    return '';
  }

  const renderedLines: string[] = [];

  type ForStack = {
    listVarName: string;
    listItemVarName: string;
    forLoopStartLineIndex: number;
    inListCurrentIndex: number;
  }[];
  const forStack: ForStack = [];

  let nestedIfCount = 0;

  for (let i = 0; i < templateLines.length; i++) {
    logger?.(`Processing line ${i + 1}: ${templateLines[i]}`);

    const templateLine = templateLines[i];
    if (templateLine === undefined) {
      logger?.(`Line ${i + 1} is undefined, skipping.`);
      continue;
    }

    // Handle comment line: {# comment #}
    const commentPattern = /{#.*#}/;
    const commentMatch = templateLine.match(commentPattern);
    if (commentMatch) {
      logger?.(`Found comment at line ${i + 1}, skipping.`);
      continue;
    }

    // Handle if conditional statement: {% if condition %} ... {% elif condition %} ... {% else %} ... {% endif %}
    const ifPattern = /{%\s*if\s+(.*?)\s*%}/;
    const elifPattern = /{%\s*elif\s+(.*?)\s*%}/;
    const elsePattern = /{%\s*else\s*%}/;
    const endifPattern = /{%\s*endif\s*%}/;
    const ifMatch = templateLine.match(ifPattern);
    if (ifMatch) {
      logger?.(`Found if statement at line ${i + 1}`);
      const conditionStr = ifMatch[1];
      if (conditionStr === undefined) {
        throw new Error(`Invalid if condition syntax. condition is missing: '${templateLine}'`);
      }

      if (conditionIsTrue(conditionStr, context, logger)) {
        const nestedLines: string[] = [];
        // Process lines until {% elif condition%}, {% else %}, and {% endif %}
        while (i + 1 < templateLines.length) {
          i++;
          const nextLine = templateLines[i];
          if (nextLine === undefined) {
            continue;
          }
          const nextIfMatch = nextLine.match(ifPattern);
          if (nextIfMatch) {
            nestedIfCount++;
            continue;
          }
          const elifMatch = nextLine.match(elifPattern);
          if (elifMatch) {
            if (nestedIfCount === 0) {
              break;
            } else {
              continue;
            }
          }
          const elseMatch = nextLine.match(elsePattern);
          if (elseMatch) {
            if (nestedIfCount === 0) {
              break;
            } else {
              continue;
            }
          }
          const endifMatch = nextLine.match(endifPattern);
          if (endifMatch) {
            if (nestedIfCount === 0) {
              break;
            } else {
              nestedIfCount--;
              continue;
            }
          }
          nestedLines.push(nextLine);
        }
        const nestedTemplate = nestedLines.join('\n');
        const renderedNestedTemplate = build(nestedTemplate, context);
        renderedNestedTemplate.split('\n').forEach((line) => renderedLines.push(line));

        // Skip lines until {% endif %}
        while (i + 1 < templateLines.length) {
          i++;
          const nextLine = templateLines[i];
          if (nextLine === undefined) {
            continue;
          }
          const nextIfMatch = nextLine.match(ifPattern);
          if (nextIfMatch) {
            nestedIfCount++;
            continue;
          }
          const endifMatch = nextLine.match(endifPattern);
          if (endifMatch) {
            if (nestedIfCount === 0) {
              break;
            } else {
              nestedIfCount--;
              continue;
            }
          }
        }
        continue;
      }

      // Condition is false, skip lines until {% elif %}, {% else %}, or {% endif %}
      while (i + 1 < templateLines.length) {
        i++;
        const nextLine = templateLines[i];
        if (nextLine === undefined) {
          continue;
        }

        const nextIfMatch = nextLine.match(ifPattern);
        if (nextIfMatch) {
          nestedIfCount++;
          continue;
        }

        const elifMatch = nextLine.match(elifPattern);
        if (elifMatch) {
          if (nestedIfCount === 0) {
            // Found elif at the same level
            i--; // Step back to re-process this line
            break;
          } else {
            continue;
          }
        }

        const elseMatch = nextLine.match(elsePattern);
        if (elseMatch) {
          if (nestedIfCount === 0) {
            // Found else at the same level
            i--; // Step back to re-process this line
            break;
          } else {
            continue;
          }
        }

        const endifMatch = nextLine.match(endifPattern);
        if (endifMatch) {
          if (nestedIfCount === 0) {
            break;
          } else {
            nestedIfCount--;
            continue;
          }
        }
      }
      continue;
    }

    const elifMatch = templateLine.match(elifPattern);
    if (elifMatch) {
      const conditionStr = elifMatch[1];
      if (conditionStr === undefined) {
        throw new Error(`Invalid elif condition syntax. condition is missing: '${templateLine}'`);
      }

      if (conditionIsTrue(conditionStr, context, logger)) {
        const nestedLines: string[] = [];
        // Process lines until {% elif condition%}, {% else %}, and {% endif %}
        while (i + 1 < templateLines.length) {
          i++;
          const nextLine = templateLines[i];
          if (nextLine === undefined) {
            continue;
          }
          const nextIfMatch = nextLine.match(ifPattern);
          if (nextIfMatch) {
            nestedIfCount++;
            continue;
          }
          const elifMatch = nextLine.match(elifPattern);
          if (elifMatch) {
            if (nestedIfCount === 0) {
              break;
            } else {
              continue;
            }
          }
          const elseMatch = nextLine.match(elsePattern);
          if (elseMatch) {
            if (nestedIfCount === 0) {
              break;
            } else {
              continue;
            }
          }
          const endifMatch = nextLine.match(endifPattern);
          if (endifMatch) {
            if (nestedIfCount === 0) {
              break;
            } else {
              nestedIfCount--;
              continue;
            }
          }
          nestedLines.push(nextLine);
        }
        const nestedTemplate = nestedLines.join('\n');
        const renderedNestedTemplate = build(nestedTemplate, context);
        renderedNestedTemplate.split('\n').forEach((line) => renderedLines.push(line));

        // Skip lines until {% endif %}
        while (i + 1 < templateLines.length) {
          i++;
          const nextLine = templateLines[i];
          if (nextLine === undefined) {
            continue;
          }
          const nextIfMatch = nextLine.match(ifPattern);
          if (nextIfMatch) {
            nestedIfCount++;
            continue;
          }
          const endifMatch = nextLine.match(endifPattern);
          if (endifMatch) {
            if (nestedIfCount === 0) {
              break;
            } else {
              nestedIfCount--;
              continue;
            }
          }
        }
        continue;
      }

      // Condition is false, skip lines until {% elif %}, {% else %}, or {% endif %}
      while (i + 1 < templateLines.length) {
        i++;
        const nextLine = templateLines[i];
        if (nextLine === undefined) {
          continue;
        }

        const nextIfMatch = nextLine.match(ifPattern);
        if (nextIfMatch) {
          nestedIfCount++;
          continue;
        }

        const elifMatch = nextLine.match(elifPattern);
        if (elifMatch) {
          if (nestedIfCount === 0) {
            // Found elif at the same level
            i--; // Step back to re-process this line
            break;
          } else {
            continue;
          }
        }

        const elseMatch = nextLine.match(elsePattern);
        if (elseMatch) {
          if (nestedIfCount === 0) {
            // Found else at the same level
            i--; // Step back to re-process this line
            break;
          } else {
            continue;
          }
        }

        const endifMatch = nextLine.match(endifPattern);
        if (endifMatch) {
          if (nestedIfCount === 0) {
            break;
          } else {
            nestedIfCount--;
            continue;
          }
        }
      }
      continue;
    }

    const elseMatch = templateLine.match(elsePattern);
    if (elseMatch) {
      const nestedLines: string[] = [];
      // Process lines until {% endif %}
      while (i + 1 < templateLines.length) {
        i++;
        const nextLine = templateLines[i];
        if (nextLine === undefined) {
          continue;
        }
        const nextIfMatch = nextLine.match(ifPattern);
        if (nextIfMatch) {
          nestedIfCount++;
          continue;
        }
        const endifMatch = nextLine.match(endifPattern);
        if (endifMatch) {
          if (nestedIfCount === 0) {
            break;
          } else {
            nestedIfCount--;
            continue;
          }
        }
        nestedLines.push(nextLine);
      }
      const nestedTemplate = nestedLines.join('\n');
      const renderedNestedTemplate = build(nestedTemplate, context);
      renderedNestedTemplate.split('\n').forEach((line) => renderedLines.push(line));
      continue;
    }

    // Handle for loop: {% for item in items %} ... {% endfor %}
    const forLoopPattern = /{%\s*for\s+(\w+)\s+in\s+(\w+)\s*%}/;
    const forLoopMatch = templateLine.match(forLoopPattern);
    if (forLoopMatch) {
      logger?.(`Found for statement at line ${i + 1}`);
      const listItemVarName = forLoopMatch[1];
      if (listItemVarName === undefined) {
        throw new Error(`Invalid for loop syntax. list item variable name is missing: '${templateLine}'`);
      }

      const listVarName = forLoopMatch[2];
      if (listVarName === undefined) {
        throw new Error(`Invalid for loop syntax. list variable name is missing: '${templateLine}'`);
      }

      const varFoundInContext = !(context[listVarName] === undefined);
      if (!varFoundInContext) {
        throw new Error(`Undefined variable for for loop: ${listVarName}`);
      }
      const listItems = context[listVarName];
      if (!Array.isArray(listItems)) {
        throw new Error(`Variable for for loop is not an array: ${listVarName}`);
      }
      forStack.push({
        listVarName,
        listItemVarName,
        forLoopStartLineIndex: i,
        inListCurrentIndex: 0,
      });

      context[listItemVarName] = listItems[0];
      continue;
    }

    const endForPattern = /{% endfor %}/;
    const endForMatch = templateLine.match(endForPattern);
    if (endForMatch) {
      logger?.(`Found endfor statement at line ${i + 1}`);
      if (forStack.length === 0) {
        throw new Error(`endfor tag found without matching for tag at line ${i + 1}`);
      }
      const currentForItem = forStack[forStack.length - 1];
      if (currentForItem === undefined) {
        throw new Error(`Internal error: currentForItem is undefined`);
      }

      if (currentForItem.inListCurrentIndex + 1 < context[currentForItem.listVarName].length) {
        // More items to process in the list
        currentForItem.inListCurrentIndex += 1;
        // Update context with the new item
        context[currentForItem.listItemVarName] = context[currentForItem.listVarName][currentForItem.inListCurrentIndex];
        i = currentForItem.forLoopStartLineIndex;
        continue;
      }
      // Finished processing all items in the list
      delete context[currentForItem.listItemVarName];
      forStack.pop();
      continue;
    }

    // Handle variable: {{ variable }}
    const variablePattern = /{{\s*(\w+)\s*}}/g;
    let renderedLine = templateLine.replace(variablePattern, (_, key) => {
      const varFoundInContext = !(context[key] === undefined);
      if (!varFoundInContext) {
        throw new Error(`Undefined variable: ${key}`);
      }
      return context[key];
    });
    renderedLines.push(renderedLine);
  }

  return renderedLines.join('\n');
}
