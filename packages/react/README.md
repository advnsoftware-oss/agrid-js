# @agrid/react

[![npm package](https://img.shields.io/npm/v/@agrid/react?style=flat-square)](https://www.npmjs.com/package/@agrid/react)
[![MIT License](https://img.shields.io/badge/License-MIT-red.svg?style=flat-square)](https://opensource.org/licenses/MIT)

React components and hooks for integrating Agrid into your React applications.

## Installation

```bash
npm install agrid-js @agrid/react
# or
yarn add agrid-js @agrid/react
# or
pnpm add agrid-js @agrid/react
```

## Quick Start

### Using AgridProvider

```jsx
import { AgridProvider } from '@agrid/react'

function App() {
  return (
    <AgridProvider
      apiKey="YOUR_PROJECT_API_KEY"
      options={{ api_host: 'https://us.i.agrid.com' }}
    >
      <YourApp />
    </AgridProvider>
  )
}
```

### Using Hooks

```jsx
import { useAgrid, useFeatureFlagEnabled } from '@agrid/react'

function MyComponent() {
  const agrid = useAgrid()
  const isNewFeatureEnabled = useFeatureFlagEnabled('new-feature')

  const handleClick = () => {
    agrid?.capture('button_clicked', {
      button_name: 'Sign Up'
    })
  }

  return (
    <div>
      {isNewFeatureEnabled && <NewFeature />}
      <button onClick={handleClick}>Click me</button>
    </div>
  )
}
```

## Available Hooks

- `useAgrid()` - Get the Agrid client instance
- `useFeatureFlagEnabled(flag)` - Check if a feature flag is enabled
- `useFeatureFlagPayload(flag)` - Get feature flag payload
- `useFeatureFlagVariantKey(flag)` - Get feature flag variant key
- `useActiveFeatureFlags()` - Get all active feature flags

## Components

- `AgridProvider` - Context provider for Agrid
- `AgridErrorBoundary` - Error boundary component for React error tracking

## Documentation

For complete documentation, see the [main repository README](https://github.com/advnsoftware-oss/agrid-js#readme).

## License

MIT License - see [LICENSE](https://github.com/advnsoftware-oss/agrid-js/blob/main/LICENSE) file for details.
