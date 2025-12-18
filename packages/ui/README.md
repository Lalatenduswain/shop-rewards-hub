# @shop-rewards/ui

Shared UI component library based on shadcn/ui.

## Usage

Components are exported individually from the `components` directory:

```tsx
import { Button } from '@shop-rewards/ui/components/button';
import { Input } from '@shop-rewards/ui/components/input';
```

## Adding Components

Use the shadcn CLI to add new components:

```bash
pnpm ui:add button
pnpm ui:add input
pnpm ui:add dialog
```

## Available Components

Components will be added incrementally as needed for the application.
Base components to add first:

- button
- input
- label
- card
- dialog
- dropdown-menu
- select
- toast
- tooltip
- tabs
- progress
- separator

Run `pnpm ui:add <component-name>` to add any of these.
