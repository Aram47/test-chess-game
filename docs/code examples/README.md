# Chess Move Tree Serialization - Code Examples

This directory contains TypeScript code examples for chess move tree serialization.

## Files

- `treeSerialization.ts` - Core serialization/deserialization utilities
- `main.ts` - Test suite and demonstration code
- `chess_move_tree.tsx` - React component example (frontend)

## Compiling and Running with TypeScript Compiler (tsc)

### Prerequisites

Make sure you have TypeScript installed:

```bash
npm install -g typescript
# or
npm install --save-dev typescript
```

### Compilation Steps

1. **Navigate to the code examples directory:**
   ```bash
   cd docs/code\ examples
   ```

2. **Compile TypeScript files:**
   ```bash
   tsc
   ```
   
   This will compile all `.ts` files to JavaScript in the `dist/` directory.

3. **Run the compiled JavaScript:**
   ```bash
   node dist/main.js
   ```

### Alternative: One-step Compile and Run

You can compile and run in one command:

```bash
tsc && node dist/main.js
```

### Clean Build

To clean the compiled files:

```bash
rm -rf dist
```

## Using ts-node (Alternative - No Compilation Needed)

If you prefer to run TypeScript directly without compilation:

```bash
npx ts-node main.ts
```

Or install ts-node globally:

```bash
npm install -g ts-node
ts-node main.ts
```

## TypeScript Configuration

The `tsconfig.json` file is configured to:
- Target ES2020
- Use ES modules (matching the project's module system)
- Output compiled files to `dist/` directory
- Enable strict type checking
- Generate source maps for debugging

## Project Structure After Compilation

```
docs/code examples/
├── treeSerialization.ts    (source)
├── main.ts                (source)
├── tsconfig.json          (config)
├── dist/
│   ├── treeSerialization.js
│   ├── treeSerialization.d.ts
│   ├── main.js
│   └── main.d.ts
```

## Troubleshooting

### Module Resolution Issues

If you encounter module resolution errors, make sure:
1. The `tsconfig.json` is in the same directory as your `.ts` files
2. You're running `tsc` from the `docs/code examples/` directory
3. The import paths use relative paths (e.g., `./treeSerialization`)

### ES Module Issues

If you get ES module errors when running:
- Make sure your `package.json` has `"type": "module"` (which it does)
- **Important**: Use `.js` extension in import statements (e.g., `from './treeSerialization.js'`)
  - TypeScript allows `.ts` in source, but compiled output needs `.js` for Node.js ES modules
  - This is already configured in the code

