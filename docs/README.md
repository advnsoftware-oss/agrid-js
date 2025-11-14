# Tài liệu tích hợp Agrid JS

Chào mừng đến với tài liệu tích hợp Agrid JS! Tài liệu này sẽ hướng dẫn bạn cách tích hợp thư viện Agrid JS vào các ứng dụng web của bạn.

## Tài liệu có sẵn

### 📘 [Hướng dẫn tích hợp chính](./INTEGRATION_GUIDE.md)

Tài liệu chi tiết về cách tích hợp Agrid JS vào:
- **JavaScript thuần** - Hướng dẫn tích hợp cho vanilla JavaScript
- **ReactJS** - Hướng dẫn tích hợp với React hooks và components
- **Các tính năng chính** - Track events, identify users, feature flags, etc.
- **Cấu hình nâng cao** - Tùy chỉnh và tối ưu hóa

### 📗 [Ví dụ tích hợp cụ thể](./INTEGRATION_EXAMPLES.md)

Các ví dụ tích hợp cho các framework phổ biến:
- **Rails** - Tích hợp vào Web 2Nông (Rails application)
- **Next.js** - Tích hợp vào Next.js application
- **Vue.js** - Tích hợp vào Vue.js/Nuxt.js
- **Angular** - Tích hợp vào Angular application

### 📙 [Hướng dẫn Publish lên NPM](./PUBLISH_NPM.md)

Hướng dẫn chi tiết về cách build và publish packages:
- **Quick Publish** - [Tóm tắt nhanh](./QUICK_PUBLISH.md)
- **Chi tiết đầy đủ** - [Hướng dẫn đầy đủ](./PUBLISH_NPM.md)

## Bắt đầu nhanh

### JavaScript thuần

```html
<script>
  !function(t,e){var o,n,p,r;e.__SV||(window.agrid=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="agrid",u.people=u.people||[],u.toString=function(t){var e="agrid";return"agrid"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getSurveys getActiveMatchingSurveys".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.agrid||[]);

  agrid.init('YOUR_API_KEY', {
    api_host: 'https://app.agrid.com'
  });
</script>
```

### ReactJS

```bash
npm install agrid-js @agrid/react
```

```jsx
import { PostHogProvider } from '@agrid/react'

function App() {
  return (
    <PostHogProvider
      apiKey="YOUR_API_KEY"
      options={{ api_host: 'https://app.agrid.com' }}
    >
      <YourApp />
    </PostHogProvider>
  )
}
```

## Tính năng chính

- ✅ **Track Events** - Ghi lại các sự kiện người dùng
- ✅ **User Identification** - Xác định và theo dõi người dùng
- ✅ **Feature Flags** - Quản lý tính năng và A/B testing
- ✅ **Session Recording** - Ghi lại phiên làm việc của người dùng
- ✅ **Surveys** - Tạo và quản lý khảo sát
- ✅ **Heatmaps** - Phân tích hành vi người dùng

## Hỗ trợ

Nếu bạn cần hỗ trợ:

1. Đọc [Hướng dẫn tích hợp chính](./INTEGRATION_GUIDE.md)
2. Xem [Ví dụ tích hợp](./INTEGRATION_EXAMPLES.md)
3. Tạo issue trên [GitHub](https://github.com/agrid/agrid-js/issues)

## Liên kết hữu ích

- [Agrid JS Documentation](https://github.com/advnsoftware-oss/agrid-js#readme)
- [React Integration](https://agrid.com/docs/libraries/react)
- [API Reference](https://agrid.com/docs/api)
- [Publish to NPM Guide](./PUBLISH_NPM.md) - Hướng dẫn build và publish packages

