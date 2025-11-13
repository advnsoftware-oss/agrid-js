<p align="center">
  <img alt="Agrid Logo" src="https://user-images.githubusercontent.com/65415371/205059737-c8a4f836-4889-4654-902e-f302b187b6a0.png" width="200">
</p>

<p align="center">
  <strong>Agrid JS - Product Analytics & Feature Flags SDK</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/agrid-js">
    <img alt="npm version" src="https://img.shields.io/npm/v/agrid-js?style=flat-square">
  </a>
  <a href="https://github.com/agrid/agrid-js/blob/main/LICENSE">
    <img alt="MIT License" src="https://img.shields.io/badge/License-MIT-red.svg?style=flat-square">
  </a>
  <a href="https://github.com/agrid/agrid-js">
    <img alt="GitHub contributors" src="https://img.shields.io/github/contributors/agrid/agrid-js?style=flat-square">
  </a>
  <a href="http://makeapullrequest.com">
    <img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square">
  </a>
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-packages">Packages</a> •
  <a href="#-features">Features</a> •
  <a href="#-documentation">Documentation</a> •
  <a href="#-contributing">Contributing</a>
</p>

---

# Agrid JS

**Agrid JS** is a comprehensive JavaScript SDK for product analytics, feature flags, session recording, and more. This monorepo contains multiple packages to integrate Agrid into your JavaScript applications across different platforms and frameworks.

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

## 📦 Packages

This monorepo contains the following packages:

| Package | Name | Description | Documentation |
|---------|------|-------------|---------------|
| **Browser SDK** | [`agrid-js`](./packages/browser/README.md) | Full-featured browser SDK with analytics, feature flags, session recording, and more | [📖 Docs](./packages/browser/README.md) |
| **Lite SDK** | [`agrid-js-lite`](./packages/web/README.md) | Lightweight browser SDK for size-conscious applications | [📖 Docs](./packages/web/README.md) |
| **Node.js SDK** | [`agrid-node`](./packages/node/README.md) | Server-side SDK for Node.js (requires Node >= 20) | [📖 Docs](./packages/node/README.md) |
| **React SDK** | [`@agrid/react`](./packages/react/README.md) | React components and hooks for Agrid | [📖 Docs](./packages/react/README.md) |
| **React Native** | [`agrid-react-native`](./packages/react-native/README.md) | Mobile SDK for React Native applications | [📖 Docs](./packages/react-native/README.md) |
| **Core** | [`@agrid/core`](./packages/core/README.md) | Shared core functionality used by multiple SDKs | [📖 Docs](./packages/core/README.md) |
| **Nuxt Module** | [`@agrid/nuxt`](./packages/nuxt/README.md) | Nuxt.js framework integration | [📖 Docs](./packages/nuxt/README.md) |
| **Next.js Config** | [`@agrid/nextjs-config`](./packages/nextjs-config/README.md) | Next.js configuration helper | [📖 Docs](./packages/nextjs-config/README.md) |
| **AI Integration** | [`@agrid/ai`](./packages/ai/README.md) | AI integrations for Node.js (OpenAI, Anthropic, etc.) | [📖 Docs](./packages/ai/README.md) |

---

## ✨ Features

### 📊 Product Analytics
- **Event Tracking** - Capture user events with custom properties
- **User Identification** - Identify and track users across sessions
- **User Properties** - Set and update user properties
- **Group Analytics** - Track groups (organizations, teams, etc.)
- **Autocapture** - Automatically capture clicks, form submissions, and pageviews

### 🚩 Feature Flags
- **Boolean Flags** - Simple on/off feature toggles
- **Multivariate Flags** - A/B testing with multiple variants
- **Local Evaluation** - Fast flag evaluation without server round-trips
- **Flag Dependencies** - Chain flags together for complex logic

### 🎥 Session Recording
- **Full Session Replay** - Record complete user sessions
- **Privacy Controls** - Mask sensitive data and inputs
- **Performance Metrics** - Track page load times and performance

### 📝 Surveys
- **In-App Surveys** - Display surveys to users
- **Targeting** - Show surveys to specific user segments
- **Multiple Question Types** - Rating, multiple choice, open text, and more

### 🔥 Heatmaps
- **Click Heatmaps** - See where users click
- **Scroll Heatmaps** - Understand scroll behavior
- **Movement Heatmaps** - Track mouse movement patterns

### 🤖 AI Integrations
- **OpenAI** - Track AI usage and costs
- **Anthropic** - Monitor Claude API usage
- **LangChain** - Integrate with LangChain applications
- **Vercel AI SDK** - Support for Vercel AI SDK

---

## 📚 Documentation

### Getting Started
- [**Integration Guide**](./docs/INTEGRATION_GUIDE.md) - Complete guide for JavaScript and ReactJS integration
- [**Integration Examples**](./docs/INTEGRATION_EXAMPLES.md) - Examples for Rails, Next.js, Vue.js, Angular
- [**Quick Start Guide**](./docs/README.md) - Quick reference for common use cases

### Development
- [**Contributing Guide**](./CONTRIBUTING.md) - How to contribute to Agrid JS
- [**Development Guide**](./AGENTS.md) - Detailed development documentation
- [**Publish to NPM**](./docs/PUBLISH_NPM.md) - Guide for building and publishing packages
- [**Release Process**](./docs/RELEASE_PROCESS.md) - Step-by-step guide for releasing packages with GitHub Actions

### API Reference
- [**Agrid Documentation**](https://agrid.com/docs) - Official Agrid documentation
- [**JavaScript SDK Docs**](https://agrid.com/docs/libraries/js) - Browser SDK documentation
- [**React SDK Docs**](https://agrid.com/docs/libraries/react) - React integration guide

---

## 🛠️ Installation

### Browser (CDN)

Add the script tag to your HTML:

```html
<script>
  !function(t,e){var o,n,p,r;e.__SV||(window.agrid=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="agrid",u.people=u.people||[],u.toString=function(t){var e="agrid";return"agrid"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getSurveys getActiveMatchingSurveys".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.agrid||[]);
</script>
```

### npm / yarn / pnpm

```bash
# Browser SDK
npm install agrid-js

# React
npm install agrid-js @agrid/react

# Node.js
npm install agrid-node

# React Native
npm install agrid-react-native

# Lite version (smaller bundle)
npm install agrid-js-lite
```

---

## 💡 Usage Examples

### Track Events

```javascript
// Basic event
agrid.capture('button_clicked', {
  button_name: 'Sign Up',
  page: 'homepage'
})

// E-commerce event
agrid.capture('purchase_completed', {
  product_id: '123',
  product_name: 'Product Name',
  price: 99.99,
  currency: 'USD'
})
```

### Identify Users

```javascript
// When user logs in
agrid.identify('user_123', {
  email: 'user@example.com',
  name: 'John Doe',
  plan: 'premium'
})
```

### Feature Flags

```javascript
// Check if feature is enabled
if (agrid.isFeatureEnabled('new-checkout-flow')) {
  // Show new checkout
}

// Get flag value
const buttonColor = agrid.getFeatureFlag('button-color')
if (buttonColor === 'blue') {
  // Use blue button
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
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Run linting
pnpm lint
```

### Development Workflow

```bash
# Watch mode for development
pnpm dev

# Build specific package
pnpm --filter=agrid-js build

# Test specific package
pnpm --filter=agrid-js test:unit
```

For more details, see [AGENTS.md](./AGENTS.md) and [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Create a changeset (`pnpm changeset`)
5. Commit your changes (`git commit -m 'feat: add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 🔗 Links

- **Website**: [https://agrid.com](https://agrid.com)
- **Documentation**: [https://agrid.com/docs](https://agrid.com/docs)
- **GitHub**: [https://github.com/agrid/agrid-js](https://github.com/agrid/agrid-js)
- **npm**: [https://www.npmjs.com/package/agrid-js](https://www.npmjs.com/package/agrid-js)
- **Issues**: [https://github.com/agrid/agrid-js/issues](https://github.com/agrid/agrid-js/issues)

---

## 🙏 Acknowledgments

Agrid JS is a fork of [PostHog JS](https://github.com/PostHog/posthog-js), adapted for the Agrid platform. We thank the PostHog team for their excellent work.

---

<p align="center">
  Made with ❤️ by the Agrid team
</p>
