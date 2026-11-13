import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'sweetalert2') {
    return {
      url: 'data:text/javascript,const recordedCalls = []; const fire = (opts) => { recordedCalls.push(opts); return Promise.resolve({ isConfirmed: true, ...opts }); }; const mixin = (defaults) => ({ fire: (opts) => fire({ ...defaults, ...opts }) }); const Swal = { fire, mixin, stopTimer: () => {}, resumeTimer: () => {}, recordedCalls }; export default Swal; export { fire, mixin, recordedCalls };',
      shortCircuit: true,
    };
  }

  if (specifier.endsWith('.css')) {
    return {
      url: 'data:text/javascript,export default {};',
      shortCircuit: true,
    };
  }

  if (specifier.startsWith('./') || specifier.startsWith('../')) {
    const parentDir = context.parentURL ? path.dirname(fileURLToPath(context.parentURL)) : process.cwd();
    const resolvedPath = path.resolve(parentDir, specifier);
    if (fs.existsSync(resolvedPath + '.ts')) {
      return {
        url: pathToFileURL(resolvedPath + '.ts').href,
        shortCircuit: true,
      };
    }
  }

  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.endsWith('.css')) {
    return {
      format: 'module',
      shortCircuit: true,
      source: 'export default {};',
    };
  }

  if (url.endsWith('.ts')) {
    const filePath = fileURLToPath(url);
    let raw = fs.readFileSync(filePath, 'utf8');

    // Replace import.meta.env.VITE_API_URL with string fallback
    raw = raw.replace(/import\.meta\.env\.VITE_API_URL/g, '"http://localhost:5062/api"');

    const transpiled = ts.transpileModule(raw, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
      },
    });

    return {
      format: 'module',
      shortCircuit: true,
      source: transpiled.outputText,
    };
  }

  return nextLoad(url, context);
}
