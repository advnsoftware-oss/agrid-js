<p align="center">
  <img alt="Agrid Logo" src="https://user-images.githubusercontent.com/65415371/205059737-c8a4f836-4889-4654-902e-f302b187b6a0.png" width="200">
</p>

<p align="center">
  <strong>Agrid JS — Product Analytics & Feature Flags SDK</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/agrid-js">
    <img alt="npm version" src="https://img.shields.io/npm/v/agrid-js?style=flat-square">
  </a>
  <a href="https://github.com/advnsoftware-oss/agrid-js/blob/main/LICENSE">
    <img alt="MIT License" src="https://img.shields.io/badge/License-MIT-red.svg?style=flat-square">
  </a>
  <a href="https://github.com/advnsoftware-oss/agrid-js">
    <img alt="GitHub contributors" src="https://img.shields.io/github/contributors/advnsoftware-oss/agrid-js?style=flat-square">
  </a>
  <a href="http://makeapullrequest.com">
    <img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square">
  </a>
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-installation-guide">Installation Guide</a> •
  <a href="#-packages">Packages</a> •
  <a href="#-usage-examples">Usage Examples</a> •
  <a href="#-development">Development</a>
</p>

---

# Agrid JS

**Agrid JS** is a comprehensive JavaScript SDK for product analytics, feature flags, session recording, heatmaps, surveys, and more. This monorepo contains multiple packages to integrate Agrid across Browser, Node.js, React, React Native, Nuxt, and NextJS.

## 🚀 Quick Start

### JavaScript (Browser)

```html
<script>
  !function(t,e){var o,n,p,r;e.__SV||(window.agrid=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="agrid",u.people=u.people||[],u.toString=function(t){var e="agrid";return"agrid"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getSurveys getActiveMatchingSurveys".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.agrid||[]);

  agrid.init('YOUR_PROJECT_API_KEY', {
    api_host: 'https://app.agrid.com'
  });
</script>
```

### React

```bash
npm install agrid-js @agrid/react
```

```jsx
import { PostHogProvider } from '@agrid/react'

function App() {
  return (
    <PostHogProvider
      apiKey="YOUR_PROJECT_API_KEY"
      options={{ api_host: 'https://app.agrid.com' }}
    >
      <YourApp />
    </PostHogProvider>
  )
}
```

### Node.js

```bash
npm install agrid-node
```

```javascript
import { PostHog } from 'agrid-node'

const client = new PostHog('YOUR_PROJECT_API_KEY', {
  host: 'https://app.agrid.com'
})

client.capture({
  distinctId: 'user123',
  event: 'purchase_completed',
  properties: {
    product: 'Product Name',
    price: 99.99
  }
})
```

---

## 🧩 Installation Guide

### Browser (primary SDK `agrid-js`)

- Install: `npm install agrid-js`
- Initialize with `agrid.init(apiKey, { api_host })` as shown above.
- Supports autocapture, feature flags, session recording, heatmaps, surveys.

### React (`@agrid/react`)

- Install: `npm install agrid-js @agrid/react`
- Wrap your app with `PostHogProvider` and use hooks `usePostHog`, `useFeatureFlagEnabled`.
- Requires `react >= 16.8.0` and a compatible `agrid-js` per peer dependencies.

### Node.js (`agrid-node`)

- Install: `npm install agrid-node`
- Requires `node >= 20`.
- Use the `PostHog` client to send server-side events, feature flags, and identification.

### React Native (`agrid-react-native`)

- Install: `npm install @agrid/agrid-react-native`
- Optional integrations with common RN packages (AsyncStorage, DeviceInfo, Navigation, SafeArea, etc.).
- Supports mobile autocapture, surveys, and feature flags.

### Lite (`agrid-js-lite`)

- Install: `npm install agrid-js-lite`
- Optimized for bundle size; supports core analytics and feature flags.

### Nuxt (`@agrid/nuxt`)

- Install: `npm install @agrid/nuxt`
- Register the module in `nuxt.config.ts` and configure `apiKey`, `apiHost`.
- Internally relies on `agrid-js`/`agrid-node` depending on context.

### Next.js Config (`@agrid/nextjs-config`)

- Install: `npm install @agrid/nextjs-config`
- Helps configure NextJS for analytics/feature flags and CLI version checks.

### AI (`@agrid/ai`)

- Install: `npm install @agrid/ai`
- Peer requirement: `agrid-node ^5.0.0`.
- Integrations for OpenAI, Anthropic, Gemini, LangChain, and Vercel AI SDK.

### Internal Core (`@agrid/core`)

- Install: `npm install @agrid/core`
- Shared core used by multiple SDKs; typically not needed directly unless for advanced use.

### Using pnpm/yarn

- pnpm: `pnpm add <package-name>`
- yarn: `yarn add <package-name>`

---

## 📦 Packages

- `agrid-js` (Browser SDK) — full-featured browser integration
- `agrid-js-lite` (Lite SDK) — smaller bundle, core functionality
- `agrid-node` (Node.js SDK) — server-side analytics and flags
- `@agrid/react` (React SDK) — provider and hooks
- `agrid-react-native` (React Native SDK) — mobile analytics
- `@agrid/core` (Core) — shared core functionality
- `@agrid/nuxt` (Nuxt Module) — Nuxt 3/4 integration
- `@agrid/nextjs-config` (NextJS Config) — NextJS configuration helper
- `@agrid/ai` (AI Integration) — Node.js AI integrations

---

## 💡 Usage Examples

### Track Events

```javascript
agrid.capture('button_clicked', {
  button_name: 'Sign Up',
  page: 'homepage'
})

agrid.capture('purchase_completed', {
  product_id: '123',
  product_name: 'Product Name',
  price: 99.99,
  currency: 'USD'
})
```

### Identify Users

```javascript
agrid.identify('user_123', {
  email: 'user@example.com',
  name: 'John Doe',
  plan: 'premium'
})
```

### Feature Flags

```javascript
if (agrid.isFeatureEnabled('new-checkout-flow')) {
  // Show the new checkout flow
}

const buttonColor = agrid.getFeatureFlag('button-color')
if (buttonColor === 'blue') {
  // Use a blue button
}
```

### React Hooks

```jsx
import { usePostHog, useFeatureFlagEnabled } from '@agrid/react'

function MyComponent() {
  const posthog = usePostHog()
  const isNewFeatureEnabled = useFeatureFlagEnabled('new-feature')

  const handleClick = () => {
    posthog?.capture('button_clicked')
  }

  return (
    <div>
      {isNewFeatureEnabled && <NewFeature />}
      <button onClick={handleClick}>Click me</button>
    </div>
  )
}
```

---

## 🏗️ Development

### Prerequisites

- Node.js `v22.17.1` (see `.nvmrc`)
- pnpm `@10.12.4`
- TypeScript `5.8.2`

### Setup

```bash
pnpm install
pnpm build
pnpm test
pnpm lint
```

### Workflow

```bash
pnpm dev
pnpm --filter=agrid-js build
pnpm --filter=agrid-js test:unit
```

See also: [AGENTS.md](./AGENTS.md), [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## 📄 License

MIT — see [LICENSE](./LICENSE).

---

## 🔗 Links

- Website: https://agrid.com
- Documentation: https://agrid.com/docs
- GitHub: https://github.com/advnsoftware-oss/agrid-js
- npm: https://www.npmjs.com/package/agrid-js
- Issues: https://github.com/advnsoftware-oss/agrid-js/issues

---

## 🙏 Acknowledgments

Agrid JS is a fork of [PostHog JS](https://github.com/PostHog/posthog-js), adapted for the Agrid platform.

<p align="center">
  Made with ❤️ by the Agrid team
</p>
