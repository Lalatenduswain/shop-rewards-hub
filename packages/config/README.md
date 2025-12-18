# @shop-rewards/config

Shared configuration files for the monorepo.

## TypeScript Configurations

### Base Configuration
```json
{
  "extends": "@shop-rewards/config/typescript/base.json"
}
```

### Next.js Configuration
```json
{
  "extends": "@shop-rewards/config/typescript/nextjs.json"
}
```

### React Library Configuration
```json
{
  "extends": "@shop-rewards/config/typescript/react-library.json"
}
```

## ESLint Configurations

### Base Configuration
```js
module.exports = {
  extends: ['@shop-rewards/config/eslint/base.js'],
};
```

### Next.js Configuration
```js
module.exports = {
  extends: ['@shop-rewards/config/eslint/nextjs.js'],
};
```

### Library Configuration
```js
module.exports = {
  extends: ['@shop-rewards/config/eslint/library.js'],
};
```

## Features

- **TypeScript**: Strict type checking, modern ES2022 features
- **ESLint**: Consistent code style across packages
- **React**: React 19 support with hooks linting
- **Next.js**: Optimized for Next.js 16 App Router
