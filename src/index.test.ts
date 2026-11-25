import { readdirSync, readFileSync } from 'fs';
import path from 'path';

import * as pkg from './index';

/*
 * Every README under src/ shows imports from the package: `./src` in a diff against this package's
 * `site.config.dev.tsx`, `@openedx/frontend-app-learning` elsewhere. Each value name it imports must be exported by
 * the package index. Each type name must be listed in `tests/readmeTypes.ts`, which the type-check compiles against
 * the index.
 */

const packageSpecifiers = ['./src', '@openedx/frontend-app-learning'];

const readmes = (readdirSync(__dirname, { recursive: true }) as string[])
  .filter((file) => path.basename(file) === 'README.md')
  .sort();

// The code a README shows, as it reads after its diffs are applied: removed lines dropped, diff markers stripped.
const readmeCode = (text: string) => {
  const lines: string[] = [];
  let fence: string | null = null;
  text.split('\n').forEach((line) => {
    const opening = /^```(\w*)/.exec(line);
    if (opening) {
      fence = fence === null ? opening[1] : null;
      return;
    }
    if (fence === null) {
      return;
    }
    if (fence !== 'diff') {
      lines.push(line);
    } else if (!line.startsWith('-')) {
      lines.push(line.slice(1));
    }
  });
  return lines.join('\n');
};

interface ReadmeImport {
  readme: string;
  name: string;
  isType: boolean;
}

const imports: ReadmeImport[] = [];
const otherImports: { readme: string; statement: string }[] = [];

readmes.forEach((readme) => {
  const code = readmeCode(readFileSync(path.join(__dirname, readme), 'utf8'));
  [...code.matchAll(/import\s+([^;]*?)\s+from\s+'([^']+)'/g)].forEach(([statement, clause, specifier]) => {
    const fromPackage = packageSpecifiers.includes(specifier);
    const deep = specifier.startsWith('@src/') || packageSpecifiers.some((p) => specifier.startsWith(`${p}/`));
    const named = /^(type\s+)?\{([^}]*)\}$/.exec(clause);
    if (deep || (fromPackage && !named)) {
      otherImports.push({ readme, statement });
      return;
    }
    if (!fromPackage || !named) {
      return;
    }
    named[2].split(',').map((entry) => entry.trim()).filter(Boolean).forEach((entry) => {
      const [, typeKeyword, name] = /^(type\s+)?(\w+)/.exec(entry) ?? [];
      imports.push({ readme, name, isType: !!named[1] || !!typeKeyword });
    });
  });
});

const readmeTypesSource = readFileSync(path.join(__dirname, 'tests', 'readmeTypes.ts'), 'utf8');
const listedTypes = (/import type \{([^}]*)\}/.exec(readmeTypesSource)?.[1] ?? '')
  .split(',').map((name) => name.trim()).filter(Boolean);

const valueImports = [...new Map(
  imports.filter(({ isType }) => !isType).map((entry) => [`${entry.readme} ${entry.name}`, entry]),
).values()];
const typeNames = [...new Set(imports.filter(({ isType }) => isType).map(({ name }) => name))].sort();

describe('the package index', () => {
  it('finds the READMEs and their imports', () => {
    expect(readmes).toContain(path.join('slots', 'UnitTitleSlot', 'README.md'));
    expect(readmes).toContain(path.join('courseware', 'course', 'sidebar', 'README.md'));
    expect(valueImports.map(({ name }) => name)).toContain('learningApp');
    expect(typeNames).toContain('UnitTitleSlotProps');
  });

  it('is the only module READMEs import from, by name', () => {
    expect(otherImports).toEqual([]);
  });

  it.each(valueImports.map(({ readme, name }) => [name, readme]))('exports %s (%s)', (name) => {
    expect(pkg).toHaveProperty(name);
  });

  it('lists every type the READMEs import in tests/readmeTypes.ts, and nothing else', () => {
    expect([...listedTypes].sort()).toEqual(typeNames);
  });
});

/*
 * The package build (`tsc` and `tsc-alias`) rewrites `@src/...` to relative paths, but not inside an `import()` that
 * carries a webpack comment. Such an import builds and tests fine here, where the alias resolves, and then fails in
 * every site that installs the package. So dynamic imports are relative.
 */
describe('dynamic imports', () => {
  const sources = (readdirSync(__dirname, { recursive: true }) as string[])
    .filter((file) => /\.(js|jsx|ts|tsx)$/.test(file) && !/\.(test|spec)\./.test(file));
  const aliased = sources.filter((file) => (
    /import\(\s*(\/\*[\s\S]*?\*\/\s*)?['"]@src\//.test(readFileSync(path.join(__dirname, file), 'utf8'))
  ));

  it('finds the source files', () => {
    expect(sources).toContain(path.join('widgets', 'OutlineTab', 'app.tsx'));
  });

  it('never use the @src alias', () => {
    expect(aliased).toEqual([]);
  });
});

describe('the slots README', () => {
  const index = readFileSync(path.join(__dirname, 'slots', 'README.md'), 'utf8');
  const slotIds = Object.entries(pkg).filter(([name]) => name.endsWith('SlotId')) as [string, string][];

  it('finds the slot IDs', () => {
    expect(slotIds.length).toBeGreaterThan(30);
  });

  it.each(slotIds)('indexes %s', (constant, slotId) => {
    const [, identifier] = /^org\.openedx\.frontend\.slot\.learning\.(\w+)\.v1$/.exec(slotId) ?? [];
    expect(index).toContain(`| \`${identifier}\` | \`${constant}\` |`);
  });
});
