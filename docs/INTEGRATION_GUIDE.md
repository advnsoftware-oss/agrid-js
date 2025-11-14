# Hướng dẫn tích hợp Agrid JS

Tài liệu này hướng dẫn cách tích hợp thư viện `agrid-js` vào các ứng dụng web, bao gồm JavaScript thuần và ReactJS.

## Mục lục

1. [Tích hợp với JavaScript thuần](#tích-hợp-với-javascript-thuần)
2. [Tích hợp với ReactJS](#tích-hợp-với-reactjs)
3. [Các tính năng chính](#các-tính-năng-chính)
4. [Cấu hình nâng cao](#cấu-hình-nâng-cao)
5. [Ví dụ thực tế](#ví-dụ-thực-tế)

---

## Tích hợp với JavaScript thuần

### Cài đặt

#### Cách 1: Sử dụng CDN (Khuyến nghị cho production)

Thêm script vào thẻ `<head>` của HTML:

```html
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Web 2Nông</title>

    <!-- Agrid JS SDK -->
    <script>
        !function(t,e){var o,n,p,r;e.__SV||(window.agrid=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="agrid",u.people=u.people||[],u.toString=function(t){var e="agrid";return"agrid"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getSurveys getActiveMatchingSurveys".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.agrid||[]);
    </script>
</head>
<body>
    <!-- Nội dung trang web -->
</body>
</html>
```

#### Cách 2: Cài đặt qua npm

```bash
npm install agrid-js
```

Sau đó import vào file JavaScript:

```javascript
import posthog from 'agrid-js'
```

### Khởi tạo

Thêm đoạn code sau vào file JavaScript của bạn (sau khi trang đã load):

```javascript
// Khởi tạo Agrid
agrid.init('YOUR_PROJECT_API_KEY', {
    api_host: 'https://app.agrid.com', // URL của Agrid instance
    // Các tùy chọn khác
    loaded: function(agrid) {
        // Callback khi Agrid đã load xong
        console.log('Agrid đã sẵn sàng!');
    }
});
```

### Ví dụ tích hợp cơ bản

```html
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Web 2Nông - Tích hợp Agrid</title>
    <script>
        !function(t,e){var o,n,p,r;e.__SV||(window.agrid=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="agrid",u.people=u.people||[],u.toString=function(t){var e="agrid";return"agrid"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getSurveys getActiveMatchingSurveys".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.agrid||[]);
    </script>
</head>
<body>
    <h1>Web 2Nông</h1>
    <button id="btn-dang-ky">Đăng ký</button>
    <button id="btn-dang-nhap">Đăng nhập</button>
    <button id="btn-mua-hang">Mua hàng</button>

    <script>
        // Khởi tạo Agrid
        agrid.init('YOUR_PROJECT_API_KEY', {
            api_host: 'https://app.agrid.com',
            loaded: function(agrid) {
                console.log('Agrid đã sẵn sàng!');
            }
        });

        // Track sự kiện đăng ký
        document.getElementById('btn-dang-ky').addEventListener('click', function() {
            agrid.capture('user_registered', {
                registration_method: 'email',
                timestamp: new Date().toISOString()
            });
        });

        // Track sự kiện đăng nhập
        document.getElementById('btn-dang-nhap').addEventListener('click', function() {
            agrid.capture('user_logged_in', {
                login_method: 'email'
            });
        });

        // Track sự kiện mua hàng
        document.getElementById('btn-mua-hang').addEventListener('click', function() {
            agrid.capture('purchase_completed', {
                product_name: 'Phân bón hữu cơ',
                price: 500000,
                currency: 'VND'
            });
        });
    </script>
</body>
</html>
```

---

## Tích hợp với ReactJS

### Cài đặt

```bash
npm install agrid-js @agrid/react
```

hoặc với yarn:

```bash
yarn add agrid-js @agrid/react
```

### Cấu hình cơ bản

#### 1. Tạo file cấu hình Agrid

Tạo file `src/agrid.js`:

```javascript
import posthog from 'agrid-js'

// Khởi tạo Agrid
posthog.init('YOUR_PROJECT_API_KEY', {
    api_host: 'https://app.agrid.com',
    loaded: function(posthog) {
        if (process.env.NODE_ENV === 'development') {
            console.log('Agrid đã sẵn sàng!', posthog);
        }
    }
})

export default posthog
```

#### 2. Sử dụng PostHogProvider trong App

Cập nhật file `src/App.jsx` hoặc `src/App.tsx`:

```jsx
import React from 'react'
import { PostHogProvider } from '@agrid/react'
import posthog from 'agrid-js'

// Khởi tạo Agrid
posthog.init('YOUR_PROJECT_API_KEY', {
    api_host: 'https://app.agrid.com'
})

function App() {
    return (
        <PostHogProvider client={posthog}>
            {/* Các component của bạn */}
            <YourComponents />
        </PostHogProvider>
    )
}

export default App
```

Hoặc sử dụng với API key trực tiếp:

```jsx
import React from 'react'
import { PostHogProvider } from '@agrid/react'

function App() {
    return (
        <PostHogProvider
            apiKey="YOUR_PROJECT_API_KEY"
            options={{
                api_host: 'https://app.agrid.com'
            }}
        >
            <YourComponents />
        </PostHogProvider>
    )
}

export default App
```

### Sử dụng Hooks

#### usePostHog Hook

```jsx
import React from 'react'
import { usePostHog } from '@agrid/react'

function ProductCard({ product }) {
    const posthog = usePostHog()

    const handlePurchase = () => {
        // Track sự kiện mua hàng
        posthog?.capture('product_purchased', {
            product_id: product.id,
            product_name: product.name,
            price: product.price,
            category: product.category
        })
    }

    return (
        <div className="product-card">
            <h3>{product.name}</h3>
            <p>{product.price} VND</p>
            <button onClick={handlePurchase}>Mua ngay</button>
        </div>
    )
}

export default ProductCard
```

#### useFeatureFlagEnabled Hook

```jsx
import React from 'react'
import { useFeatureFlagEnabled } from '@agrid/react'

function PromoBanner() {
    const isPromoEnabled = useFeatureFlagEnabled('promo-banner')

    if (!isPromoEnabled) {
        return null
    }

    return (
        <div className="promo-banner">
            <h2>Khuyến mãi đặc biệt!</h2>
            <p>Giảm 20% cho đơn hàng đầu tiên</p>
        </div>
    )
}

export default PromoBanner
```

#### useFeatureFlagVariantKey Hook

```jsx
import React from 'react'
import { useFeatureFlagVariantKey } from '@agrid/react'

function CheckoutButton() {
    const buttonVariant = useFeatureFlagVariantKey('checkout-button-style')

    const getButtonClass = () => {
        switch(buttonVariant) {
            case 'primary':
                return 'btn-primary'
            case 'secondary':
                return 'btn-secondary'
            default:
                return 'btn-default'
        }
    }

    return (
        <button className={getButtonClass()}>
            Thanh toán
        </button>
    )
}

export default CheckoutButton
```

### Ví dụ tích hợp đầy đủ cho React App

```jsx
// src/App.jsx
import React from 'react'
import { PostHogProvider } from '@agrid/react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ProductPage from './pages/ProductPage'
import CheckoutPage from './pages/CheckoutPage'

function App() {
    return (
        <PostHogProvider
            apiKey={process.env.REACT_APP_AGRID_API_KEY}
            options={{
                api_host: process.env.REACT_APP_AGRID_API_HOST || 'https://app.agrid.com',
                person_profiles: 'identified_only',
                capture_pageview: true,
                capture_pageleave: true
            }}
        >
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/products/:id" element={<ProductPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                </Routes>
            </BrowserRouter>
        </PostHogProvider>
    )
}

export default App
```

```jsx
// src/pages/ProductPage.jsx
import React, { useEffect } from 'react'
import { usePostHog } from '@agrid/react'
import { useParams } from 'react-router-dom'

function ProductPage() {
    const { id } = useParams()
    const posthog = usePostHog()

    useEffect(() => {
        // Track page view
        posthog?.capture('product_viewed', {
            product_id: id
        })
    }, [id, posthog])

    const handleAddToCart = () => {
        posthog?.capture('product_added_to_cart', {
            product_id: id
        })
    }

    return (
        <div>
            <h1>Chi tiết sản phẩm {id}</h1>
            <button onClick={handleAddToCart}>Thêm vào giỏ</button>
        </div>
    )
}

export default ProductPage
```

---

## Các tính năng chính

### 1. Track Events (Ghi lại sự kiện)

```javascript
// JavaScript thuần
agrid.capture('event_name', {
    property1: 'value1',
    property2: 'value2'
})

// ReactJS
const posthog = usePostHog()
posthog?.capture('event_name', {
    property1: 'value1',
    property2: 'value2'
})
```

### 2. Identify Users (Xác định người dùng)

```javascript
// Khi người dùng đăng nhập
agrid.identify('user_id_123', {
    email: 'user@example.com',
    name: 'Nguyễn Văn A',
    phone: '0123456789'
})
```

### 3. Set User Properties (Thiết lập thuộc tính người dùng)

```javascript
// Set một lần
agrid.people.set_once({
    first_visit: new Date().toISOString()
})

// Set hoặc cập nhật
agrid.people.set({
    plan: 'premium',
    subscription_date: new Date().toISOString()
})

// Increment (tăng giá trị)
agrid.people.increment('purchase_count', 1)
```

### 4. Feature Flags (Cờ tính năng)

```javascript
// Kiểm tra feature flag
const isEnabled = agrid.isFeatureEnabled('new-checkout-flow')

if (isEnabled) {
    // Hiển thị tính năng mới
}

// Lấy giá trị feature flag
const variant = agrid.getFeatureFlag('button-color')
```

### 5. Session Recording (Ghi lại phiên làm việc)

```javascript
agrid.init('YOUR_API_KEY', {
    api_host: 'https://app.agrid.com',
    session_recording: {
        recordCrossOriginIframes: true
    }
})
```

---

## Cấu hình nâng cao

### Cấu hình đầy đủ

```javascript
agrid.init('YOUR_PROJECT_API_KEY', {
    api_host: 'https://app.agrid.com',

    // Tự động capture pageview
    capture_pageview: true,

    // Tự động capture pageleave
    capture_pageleave: true,

    // Session recording
    session_recording: {
        recordCrossOriginIframes: true,
        maskAllInputs: false,
        maskInputOptions: {
            password: true
        }
    },

    // Feature flags
    advanced_disable_feature_flags_on_first_load: false,

    // Person profiles
    person_profiles: 'identified_only', // 'always' | 'identified_only' | 'never'

    // Persistence
    persistence: 'localStorage+cookie',

    // Debug mode (chỉ dùng trong development)
    debug: process.env.NODE_ENV === 'development',

    // Loaded callback
    loaded: function(agrid) {
        console.log('Agrid loaded:', agrid)
    }
})
```

### Environment Variables

Tạo file `.env`:

```env
REACT_APP_AGRID_API_KEY=your_api_key_here
REACT_APP_AGRID_API_HOST=https://app.agrid.com
```

Sử dụng trong code:

```javascript
agrid.init(process.env.REACT_APP_AGRID_API_KEY, {
    api_host: process.env.REACT_APP_AGRID_API_HOST
})
```

---

## Ví dụ thực tế

### E-commerce Website (Web 2Nông)

```jsx
// src/hooks/useTracking.js
import { usePostHog } from '@agrid/react'

export function useTracking() {
    const posthog = usePostHog()

    const trackProductView = (product) => {
        posthog?.capture('product_viewed', {
            product_id: product.id,
            product_name: product.name,
            category: product.category,
            price: product.price
        })
    }

    const trackAddToCart = (product, quantity = 1) => {
        posthog?.capture('product_added_to_cart', {
            product_id: product.id,
            product_name: product.name,
            quantity: quantity,
            price: product.price,
            total: product.price * quantity
        })
    }

    const trackPurchase = (order) => {
        posthog?.capture('purchase_completed', {
            order_id: order.id,
            total: order.total,
            items: order.items,
            payment_method: order.payment_method
        })
    }

    const trackSearch = (query, resultsCount) => {
        posthog?.capture('search_performed', {
            search_query: query,
            results_count: resultsCount
        })
    }

    return {
        trackProductView,
        trackAddToCart,
        trackPurchase,
        trackSearch
    }
}
```

```jsx
// src/components/ProductCard.jsx
import React from 'react'
import { useTracking } from '../hooks/useTracking'

function ProductCard({ product }) {
    const { trackProductView, trackAddToCart } = useTracking()

    useEffect(() => {
        trackProductView(product)
    }, [product])

    const handleAddToCart = () => {
        trackAddToCart(product, 1)
        // Logic thêm vào giỏ hàng
    }

    return (
        <div className="product-card">
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p>{product.price} VND</p>
            <button onClick={handleAddToCart}>Thêm vào giỏ</button>
        </div>
    )
}

export default ProductCard
```

---

## Troubleshooting

### Agrid không load

1. Kiểm tra API key và API host
2. Kiểm tra console để xem có lỗi không
3. Đảm bảo script được load trước khi gọi `agrid.init()`

### Events không được gửi

1. Kiểm tra network tab trong DevTools
2. Đảm bảo không có ad blocker chặn requests
3. Kiểm tra CORS settings trên server

### Feature flags không hoạt động

1. Đảm bảo feature flags đã được bật trong Agrid dashboard
2. Kiểm tra user đã được identify chưa
3. Sử dụng `agrid.getFeatureFlag('flag-name')` để debug

---

## Tài liệu tham khảo

- [Agrid JS Documentation](https://github.com/advnsoftware-oss/agrid-js#readme)
- [React Integration Guide](https://agrid.com/docs/libraries/react)
- [API Reference](https://agrid.com/docs/api)

---

## Hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra [tài liệu chính thức](https://agrid.com/docs)
2. Tạo issue trên [GitHub](https://github.com/agrid/agrid-js/issues)
3. Liên hệ team phát triển

