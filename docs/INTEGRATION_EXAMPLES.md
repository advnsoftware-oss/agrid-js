# Ví dụ tích hợp Agrid JS - Web 2Nông

Tài liệu này cung cấp các ví dụ cụ thể về cách tích hợp Agrid JS vào Web 2Nông và các ứng dụng web khác.

## Mục lục

1. [Tích hợp vào Web 2Nông (Rails)](#tích-hợp-vào-web-2nông-rails)
2. [Tích hợp vào Next.js](#tích-hợp-vào-nextjs)
3. [Tích hợp vào Vue.js](#tích-hợp-vào-vuejs)
4. [Tích hợp vào Angular](#tích-hợp-vào-angular)

---

## Tích hợp vào Web 2Nông (Rails)

### 1. Thêm vào layout chính

File `app/views/layouts/application.html.erb`:

```erb
<!DOCTYPE html>
<html>
  <head>
    <title>Web 2Nông</title>
    <%= csrf_meta_tags %>
    <%= csp_meta_tag %>

    <!-- Agrid JS -->
    <script>
      !function(t,e){var o,n,p,r;e.__SV||(window.agrid=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="agrid",u.people=u.people||[],u.toString=function(t){var e="agrid";return"agrid"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getSurveys getActiveMatchingSurveys".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.agrid||[]);

      agrid.init('<%= ENV["AGRID_API_KEY"] %>', {
        api_host: '<%= ENV["AGRID_API_HOST"] || "https://app.agrid.com" %>',
        loaded: function(agrid) {
          <% if user_signed_in? %>
            agrid.identify('<%= current_user.id %>', {
              email: '<%= current_user.email %>',
              name: '<%= current_user.name %>',
              phone: '<%= current_user.phone %>'
            });
          <% end %>
        }
      });
    </script>

    <%= stylesheet_link_tag 'application', media: 'all' %>
    <%= javascript_include_tag 'application' %>
  </head>

  <body>
    <%= yield %>
  </body>
</html>
```

### 2. Tạo helper method

File `app/helpers/application_helper.rb`:

```ruby
module ApplicationHelper
  def track_event(event_name, properties = {})
    "agrid.capture('#{event_name}', #{properties.to_json.html_safe});".html_safe
  end

  def track_user_identification(user)
    return unless user

    "agrid.identify('#{user.id}', {
      email: '#{user.email}',
      name: '#{user.name}',
      phone: '#{user.phone}'
    });".html_safe
  end
end
```

### 3. Sử dụng trong controllers

File `app/controllers/application_controller.rb`:

```ruby
class ApplicationController < ActionController::Base
  after_action :track_page_view

  private

  def track_page_view
    @agrid_tracking = {
      page_name: "#{controller_name}##{action_name}",
      user_id: current_user&.id
    }
  end
end
```

### 4. Track events trong views

File `app/views/products/show.html.erb`:

```erb
<div class="product-detail">
  <h1><%= @product.name %></h1>
  <p><%= @product.price %> VND</p>

  <%= button_to "Thêm vào giỏ",
      add_to_cart_path(@product),
      class: "btn-add-cart",
      data: {
        onclick: track_event('product_added_to_cart', {
          product_id: @product.id,
          product_name: @product.name,
          price: @product.price
        })
      } %>
</div>

<script>
  // Track product view
  <%= track_event('product_viewed', {
    product_id: @product.id,
    product_name: @product.name,
    category: @product.category
  }) %>
</script>
```

### 5. Track trong JavaScript (Stimulus)

File `app/javascript/controllers/tracking_controller.js`:

```javascript
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = {
    event: String,
    properties: Object
  }

  connect() {
    if (window.agrid && this.eventValue) {
      window.agrid.capture(this.eventValue, this.propertiesValue || {})
    }
  }

  track(event) {
    event.preventDefault()
    const eventName = event.currentTarget.dataset.eventName
    const properties = JSON.parse(event.currentTarget.dataset.properties || '{}')

    if (window.agrid && eventName) {
      window.agrid.capture(eventName, properties)
    }
  }
}
```

Sử dụng trong HTML:

```erb
<button
  data-controller="tracking"
  data-action="click->tracking#track"
  data-tracking-event-name-value="button_clicked"
  data-tracking-properties-value='{"button_name": "checkout"}'>
  Thanh toán
</button>
```

---

## Tích hợp vào Next.js

### 1. Cài đặt

```bash
npm install agrid-js @agrid/react
```

### 2. Tạo Agrid Provider

File `lib/agrid.js`:

```javascript
import posthog from 'agrid-js'

export function initAgrid() {
    if (typeof window !== 'undefined') {
        const agridApiKey = process.env.NEXT_PUBLIC_AGRID_API_KEY
        const agridHost = process.env.NEXT_PUBLIC_AGRID_API_HOST || 'https://app.agrid.com'

        if (agridApiKey && !window.agrid) {
            posthog.init(agridApiKey, {
                api_host: agridHost,
                loaded: (posthog) => {
                    if (process.env.NODE_ENV === 'development') {
                        console.log('Agrid loaded', posthog)
                    }
                }
            })
        }
    }
    return posthog
}
```

### 3. Tạo Provider Component

File `components/AgridProvider.jsx`:

```jsx
'use client'

import { PostHogProvider } from '@agrid/react'
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { initAgrid } from '@/lib/agrid'

export function AgridProvider({ children }) {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const posthog = initAgrid()

    useEffect(() => {
        if (pathname && posthog) {
            let url = window.origin + pathname
            if (searchParams && searchParams.toString()) {
                url = url + `?${searchParams.toString()}`
            }
            posthog.capture('$pageview', {
                $current_url: url
            })
        }
    }, [pathname, searchParams, posthog])

    if (!posthog) {
        return <>{children}</>
    }

    return (
        <PostHogProvider client={posthog}>
            {children}
        </PostHogProvider>
    )
}
```

### 4. Sử dụng trong app layout

File `app/layout.jsx`:

```jsx
import { AgridProvider } from '@/components/AgridProvider'

export default function RootLayout({ children }) {
    return (
        <html lang="vi">
            <body>
                <AgridProvider>
                    {children}
                </AgridProvider>
            </body>
        </html>
    )
}
```

### 5. Track events trong pages

File `app/products/[id]/page.jsx`:

```jsx
'use client'

import { usePostHog } from '@agrid/react'
import { useEffect } from 'react'

export default function ProductPage({ params }) {
    const posthog = usePostHog()

    useEffect(() => {
        posthog?.capture('product_viewed', {
            product_id: params.id
        })
    }, [params.id, posthog])

    const handleAddToCart = () => {
        posthog?.capture('product_added_to_cart', {
            product_id: params.id
        })
    }

    return (
        <div>
            <h1>Product {params.id}</h1>
            <button onClick={handleAddToCart}>Thêm vào giỏ</button>
        </div>
    )
}
```

### 6. Environment variables

File `.env.local`:

```env
NEXT_PUBLIC_AGRID_API_KEY=your_api_key_here
NEXT_PUBLIC_AGRID_API_HOST=https://app.agrid.com
```

---

## Tích hợp vào Vue.js

### 1. Cài đặt

```bash
npm install agrid-js
```

### 2. Tạo plugin

File `plugins/agrid.js`:

```javascript
import posthog from 'agrid-js'

export default function ({ app }, inject) {
    const agridApiKey = process.env.AGRID_API_KEY
    const agridHost = process.env.AGRID_API_HOST || 'https://app.agrid.com'

    if (agridApiKey) {
        posthog.init(agridApiKey, {
            api_host: agridHost
        })
    }

    inject('agrid', posthog)
}
```

### 3. Đăng ký plugin

File `nuxt.config.js`:

```javascript
export default {
    plugins: [
        { src: '~/plugins/agrid.js', mode: 'client' }
    ],
    env: {
        AGRID_API_KEY: process.env.AGRID_API_KEY,
        AGRID_API_HOST: process.env.AGRID_API_HOST || 'https://app.agrid.com'
    }
}
```

### 4. Sử dụng trong components

File `components/ProductCard.vue`:

```vue
<template>
    <div class="product-card">
        <h3>{{ product.name }}</h3>
        <p>{{ product.price }} VND</p>
        <button @click="handleAddToCart">Thêm vào giỏ</button>
    </div>
</template>

<script>
export default {
    props: {
        product: {
            type: Object,
            required: true
        }
    },
    mounted() {
        this.$agrid.capture('product_viewed', {
            product_id: this.product.id,
            product_name: this.product.name
        })
    },
    methods: {
        handleAddToCart() {
            this.$agrid.capture('product_added_to_cart', {
                product_id: this.product.id,
                product_name: this.product.name,
                price: this.product.price
            })
        }
    }
}
</script>
```

### 5. Track trong middleware

File `middleware/tracking.js`:

```javascript
export default function ({ route, app }) {
    if (process.client && app.$agrid) {
        app.$agrid.capture('$pageview', {
            $current_url: window.location.href,
            route: route.path
        })
    }
}
```

---

## Tích hợp vào Angular

### 1. Cài đặt

```bash
npm install agrid-js
```

### 2. Tạo service

File `src/app/services/agrid.service.ts`:

```typescript
import { Injectable } from '@angular/core'
import posthog from 'agrid-js'

@Injectable({
    providedIn: 'root'
})
export class AgridService {
    private initialized = false

    constructor() {
        this.init()
    }

    init() {
        if (this.initialized) return

        const apiKey = environment.agridApiKey
        const apiHost = environment.agridApiHost || 'https://app.agrid.com'

        if (apiKey) {
            posthog.init(apiKey, {
                api_host: apiHost
            })
            this.initialized = true
        }
    }

    capture(eventName: string, properties?: any) {
        if (this.initialized) {
            posthog.capture(eventName, properties)
        }
    }

    identify(userId: string, properties?: any) {
        if (this.initialized) {
            posthog.identify(userId, properties)
        }
    }

    reset() {
        if (this.initialized) {
            posthog.reset()
        }
    }
}
```

### 3. Environment config

File `src/environments/environment.ts`:

```typescript
export const environment = {
    production: false,
    agridApiKey: 'your_api_key_here',
    agridApiHost: 'https://app.agrid.com'
}
```

### 4. Sử dụng trong components

File `src/app/components/product-card/product-card.component.ts`:

```typescript
import { Component, Input, OnInit } from '@angular/core'
import { AgridService } from '../../services/agrid.service'

@Component({
    selector: 'app-product-card',
    templateUrl: './product-card.component.html'
})
export class ProductCardComponent implements OnInit {
    @Input() product: any

    constructor(private agrid: AgridService) {}

    ngOnInit() {
        this.agrid.capture('product_viewed', {
            product_id: this.product.id,
            product_name: this.product.name
        })
    }

    addToCart() {
        this.agrid.capture('product_added_to_cart', {
            product_id: this.product.id,
            product_name: this.product.name,
            price: this.product.price
        })
    }
}
```

---

## Best Practices

### 1. Không track thông tin nhạy cảm

```javascript
// ❌ Không làm thế này
agrid.capture('user_registered', {
    password: user.password, // KHÔNG BAO GIỜ track password
    credit_card: user.cardNumber // KHÔNG track thông tin thẻ
})

// ✅ Làm thế này
agrid.capture('user_registered', {
    registration_method: 'email',
    has_phone: !!user.phone
})
```

### 2. Sử dụng consistent event names

```javascript
// ✅ Consistent naming
'agrid.product_viewed'
'agrid.product_added_to_cart'
'agrid.purchase_completed'

// ❌ Inconsistent
'viewProduct'
'addToCart'
'purchase'
```

### 3. Batch events khi có thể

```javascript
// Thay vì track nhiều events riêng lẻ
agrid.capture('page_viewed')
agrid.capture('user_logged_in')
agrid.capture('cart_updated')

// Có thể combine thành một event với nhiều properties
agrid.capture('user_session_started', {
    page: 'home',
    is_logged_in: true,
    cart_items_count: 3
})
```

### 4. Sử dụng feature flags để A/B testing

```javascript
const showNewCheckout = agrid.isFeatureEnabled('new-checkout-flow')

if (showNewCheckout) {
    // Render new checkout
} else {
    // Render old checkout
}
```

---

## Troubleshooting

### Agrid không load trong production

- Kiểm tra environment variables
- Đảm bảo API key và host đúng
- Kiểm tra CORS settings

### Events không được gửi

- Kiểm tra network tab
- Kiểm tra ad blockers
- Verify API key permissions

### Feature flags không hoạt động

- Đảm bảo user đã được identify
- Kiểm tra feature flags đã được enable trong dashboard
- Sử dụng `agrid.getFeatureFlag()` để debug

