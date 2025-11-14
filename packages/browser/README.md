# Agrid Browser JS Library

[![npm package](https://img.shields.io/npm/v/agrid-js?style=flat-square)](https://www.npmjs.com/package/agrid-js)
[![MIT License](https://img.shields.io/badge/License-MIT-red.svg?style=flat-square)](https://opensource.org/licenses/MIT)

**Agrid JS** is a comprehensive JavaScript SDK for product analytics, feature flags, session recording, heatmaps, and surveys. This is the main browser SDK package that provides full-featured tracking capabilities for web applications.

For complete documentation and examples, see the [main repository README](https://github.com/advnsoftware-oss/agrid-js#readme).

---

## 📦 Agrid JS Packages

This repository contains multiple packages for different platforms and frameworks:

| Package | npm Package | Description | Use Case |
|---------|-------------|-------------|----------|
| **Browser SDK** | [`agrid-js`](https://www.npmjs.com/package/agrid-js) | Full-featured browser SDK (this package) | Web applications, SPAs |
| **Lite SDK** | [`agrid-js-lite`](https://www.npmjs.com/package/agrid-js-lite) | Lightweight browser SDK | Size-conscious applications |
| **React SDK** | [`@agrid/react`](https://www.npmjs.com/package/@agrid/react) | React components and hooks | React applications |
| **Node.js SDK** | [`agrid-node`](https://www.npmjs.com/package/agrid-node) | Server-side SDK | Node.js backend (Node >= 20) |
| **React Native** | [`agrid-react-native`](https://www.npmjs.com/package/agrid-react-native) | Mobile SDK | React Native apps |
| **Core** | [`@agrid/core`](https://www.npmjs.com/package/@agrid/core) | Shared core functionality | Internal use by other SDKs |
| **Nuxt Module** | [`@agrid/nuxt`](https://www.npmjs.com/package/@agrid/nuxt) | Nuxt.js integration | Nuxt.js applications |
| **Next.js Config** | [`@agrid/nextjs-config`](https://www.npmjs.com/package/@agrid/nextjs-config) | Next.js helper | Next.js applications |
| **AI Integration** | [`@agrid/ai`](https://www.npmjs.com/package/@agrid/ai) | AI integrations | OpenAI, Anthropic, LangChain |

---

## 🚀 Quick Start

### Installation

```bash
npm install agrid-js
# or
yarn add agrid-js
# or
pnpm add agrid-js
```

### Basic Usage

```javascript
import agrid from 'agrid-js'

// Initialize
agrid.init('YOUR_PROJECT_API_KEY', {
  api_host: 'https://us.i.agrid.com'
})

// Track events
agrid.capture('button_clicked', {
  button_name: 'Sign Up',
  page: 'homepage'
})

// Identify users
agrid.identify('user_123', {
  email: 'user@example.com',
  name: 'John Doe'
})

// Feature flags
if (agrid.isFeatureEnabled('new-feature')) {
  // Feature is enabled
}

const flagValue = agrid.getFeatureFlag('button-color')
```

### CDN Usage

```html
<script>
  !function(t,e){var o,n,p,r;e.__SV||(window.agrid=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="agrid",u.people=u.people||[],u.toString=function(t){var e="agrid";return"agrid"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getSurveys getActiveMatchingSurveys".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.agrid||[]);

  agrid.init('YOUR_PROJECT_API_KEY', {
    api_host: 'https://us.i.agrid.com'
  })
</script>
```

### React Integration

```bash
npm install agrid-js @agrid/react
```

```jsx
import { AgridProvider } from '@agrid/react'
import { useAgrid } from '@agrid/react'

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

function MyComponent() {
  const agrid = useAgrid()

  const handleClick = () => {
    agrid?.capture('button_clicked')
  }

  return <button onClick={handleClick}>Click me</button>
}
```

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

---

## 📚 Documentation

- **Main Repository**: [https://github.com/advnsoftware-oss/agrid-js](https://github.com/advnsoftware-oss/agrid-js)
- **npm Package**: [https://www.npmjs.com/package/agrid-js](https://www.npmjs.com/package/agrid-js)
- **Issues**: [https://github.com/advnsoftware-oss/agrid-js/issues](https://github.com/advnsoftware-oss/agrid-js/issues)

---

## 🛠️ Development

This section is for developers working on the library itself.

### Dependencies

We use pnpm. It's best to install using:
```bash
npm install -g pnpm@latest-9
```

### Optional Dependencies

This package has the following optional peer dependencies:

- `@rrweb/types` (2.0.0-alpha.17): Only required if you're using Angular Compiler and need type definitions for the rrweb integration.
- `rrweb-snapshot` (2.0.0-alpha.17): Only required if you're using Angular Compiler and need type definitions for the rrweb integration.

These dependencies are marked as optional to reduce installation size for users who don't need these specific features.

### Setup

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Run tests
pnpm test
```

### Testing

> [!NOTE]
> Run `pnpm build` at least once before running tests.

- **Unit tests**: run `pnpm test`
- **Playwright**: run `pnpm exec playwright test --ui --project webkit --project firefox --project chromium`

### Running TestCafe E2E tests with BrowserStack

Testing on IE11 requires a bit more setup. TestCafe tests will use the playground application to test the locally built array.full.js bundle. It will also verify that the events emitted during the testing of playground are loaded into the Agrid app. By default it uses https://us.i.agrid.com and the project with ID 11213. See the testcafe tests to see how to override these if needed. You'll need to set `AGRID_API_KEY` to your personal API key, and `AGRID_PROJECT_KEY` to the key for the project you are using.

You'll also need to sign up to [BrowserStack](https://www.browserstack.com/). Note that if you are using CodeSpaces, these variables will already be available in your shell env variables.

After all this, you'll be able to run through the below steps:

1. Optional: rebuild array.js on changes: `nodemon -w src/ --exec bash -c "pnpm build-rollup"`.
1. Export browserstack credentials: `export BROWSERSTACK_USERNAME=xxx BROWSERSTACK_ACCESS_KEY=xxx`.
1. Run tests: `npx testcafe "browserstack:ie" testcafe/e2e.spec.js`.

### Running local create react app example

You can use the create react app setup in `packages/browser/playground/nextjs` to test agrid-js as an npm module in a Nextjs application.

1. Run `agrid` locally on port 8000 (`DEBUG=1 TEST=1 ./bin/start`).
1. Run `python manage.py setup_dev --no-data` on agrid repo, which sets up a demo account.
1. Copy Project API key found in `http://localhost:8000/project/settings` and save it for the last step.
1. Run `cd packages/browser/playground/nextjs`.
1. Run `pnpm install-deps` to install dependencies.
1. Run `NEXT_PUBLIC_AGRID_KEY='<your-local-api-key>' NEXT_PUBLIC_AGRID_HOST='http://localhost:8000' pnpm dev` to start the application.

### Tiers of testing

1. Unit tests - this verifies the behavior of the library in bite-sized chunks. Keep this coverage close to 100%, test corner cases and internal behavior here
2. Browser tests - run in real browsers and so capable of testing timing, browser requests, etc. Useful for testing high-level library behavior, ordering and verifying requests. We shouldn't aim for 100% coverage here as it's impossible to test all possible combinations.
3. TestCafe E2E tests - integrates with a real agrid instance sends data to it. Hardest to write and maintain - keep these very high level

## Developing together with another project

Install pnpm to link a local version of `agrid-js` in another JS project: `npm install -g pnpm`

### Run this to link the local version

We have 2 options for linking this project to your local version: via [pnpm link](https://docs.npmjs.com/cli/v8/commands/npm-link) or via [local paths](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#local-paths)

#### local paths (preferred)

- run `pnpm build` and `pnpm package` in the root of this repo to generate a tarball of this project.
- run `pnpm -r update agrid-js@file:[ABSOLUTE_PATH_TO_AGRID_JS_REPO]/target/agrid-js.tgz` in the root of the repo that you want to link to (e.g. the agrid main repo).
- run `pnpm install` in that same repo
- run `cd frontend && pnpm run copy-scripts` if the repo that you want to link to is the agrid main repo.

Then, once this link has been created, any time you need to make a change to `agrid-js`, you can run `pnpm build && pnpm package` from the `agrid-js` root and the changes will appear in the other repo.

#### `pnpm link`

- In the `agrid-js` directory: `pnpm link --global`
- (for `agrid` this means: `pnpm link --global agrid-js && pnpm i && pnpm copy-scripts`)
- You can then remove the link by, e.g., running `pnpm link --global agrid-js` from within `agrid`

---

## 📄 License

MIT License - see [LICENSE](https://github.com/advnsoftware-oss/agrid-js/blob/main/LICENSE) file for details.

---

## 🙏 Acknowledgments

Agrid JS is a fork of PostHog JS, adapted for the Agrid platform. We thank the PostHog team for their excellent work.
