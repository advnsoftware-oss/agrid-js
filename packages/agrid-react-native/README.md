# Agrid React Native

Thư viện Agrid React Native cho phép bạn tích hợp analytics vào ứng dụng React Native của mình. Thư viện này được xây dựng dựa trên PostHog và hỗ trợ đầy đủ cho cả ứng dụng React Native thuần túy và ứng dụng Expo.

## Mục lục

- [Cài đặt](#cài-đặt)
- [Cấu hình](#cấu-hình)
- [Ghi nhận sự kiện](#ghi-nhận-sự-kiện)
- [Tự động ghi nhận (Autocapture)](#tự-động-ghi-nhận-autocapture)
- [Nhận diện người dùng](#nhận-diện-người-dùng)
- [Super Properties](#super-properties)
- [Feature Flags](#feature-flags)
- [Tùy chọn nâng cao](#tùy-chọn-nâng-cao)

## Cài đặt

### Ứng dụng Expo

```bash
npx expo install @agrid/agrid-react-native expo-file-system expo-application expo-device expo-localization
```

### Ứng dụng React Native

```bash
yarn add @agrid/agrid-react-native @react-native-async-storage/async-storage react-native-device-info react-native-localize
# hoặc
npm i -s @agrid/agrid-react-native @react-native-async-storage/async-storage react-native-device-info react-native-localize
```

Đối với iOS, chạy thêm:

```bash
cd ios && pod install && cd ..
```

### React Native Web và macOS

Nếu bạn đang sử dụng React Native Web hoặc React Native macOS, không sử dụng package `expo-file-system` vì nó không hỗ trợ Web và macOS. Thay vào đó, sử dụng `@react-native-async-storage/async-storage`.

## Thông tin mặc định

Để bắt đầu nhanh, bạn có thể sử dụng các giá trị mặc định sau:

- **Host mặc định**: `https://gw.track-asia.vn`

## Cấu hình

### Cấu hình cơ bản

Có hai cách để khởi tạo Agrid trong ứng dụng của bạn:

#### Cách 1: Sử dụng AgridProvider (Khuyến nghị)

```tsx
import { AgridProvider } from '@agrid/agrid-react-native'

export function App() {
  return (
    <AgridProvider
      apiKey="<your_api_key>"
      options={{
        host: 'https://gw.track-asia.vn',
      }}
    >
      {/* Phần còn lại của ứng dụng */}
    </AgridProvider>
  )
}
```

#### Cách 2: Khởi tạo thủ công

```tsx
// agrid.ts
import Agrid from '@agrid/agrid-react-native'

export const agrid = new Agrid('<your_api_key>', {
  host: 'https://gw.track-asia.vn',
})
```

### Các tùy chọn cấu hình

| Tùy chọn | Mô tả | Giá trị mặc định |
|----------|-------|------------------|
| `host` | URL của Agrid instance | `https://gw.track-asia.vn` |
| `flushAt` | Số lượng sự kiện trước khi tự động gửi | `20` |
| `flushInterval` | Khoảng thời gian (ms) giữa các lần gửi | `10000` |
| `maxBatchSize` | Số lượng sự kiện tối đa trong một batch | `100` |
| `maxQueueSize` | Số lượng sự kiện tối đa trong hàng đợi | `1000` |
| `disabled` | Vô hiệu hóa tracking | `false` |
| `defaultOptIn` | Người dùng mặc định opt-in tracking | `true` |
| `captureAppLifecycleEvents` | Tự động ghi nhận vòng đời app | `false` |
| `persistence` | Loại lưu trữ: `'file'` hoặc `'memory'` | `'file'` |
| `customStorage` | Custom storage implementation | `null` |
| `enableSessionReplay` | Bật Session Replay | `false` |
| `sessionReplayConfig` | Cấu hình Session Replay | `null` |

### Ví dụ cấu hình đầy đủ

```tsx
<AgridProvider
  apiKey="<your_api_key>"
  options={{
    host: 'https://gw.track-asia.vn',
    captureAppLifecycleEvents: true, // Tự động track app lifecycle
    flushAt: 10,
    flushInterval: 5000,
    persistence: 'file',
  }}
>
  {/* App content */}
</AgridProvider>
```

## Ghi nhận sự kiện

### Ghi nhận sự kiện tùy chỉnh

Sử dụng phương thức `capture` để ghi nhận sự kiện:

```tsx
import { useAgrid } from '@agrid/agrid-react-native'

function MyComponent() {
  const agrid = useAgrid()

  const handleButtonPress = () => {
    agrid?.capture('button_clicked', {
      button_name: 'sign_up',
      screen: 'home',
    })
  }

  return <Button onPress={handleButtonPress} title="Sign Up" />
}
```

> **💡 Mẹo:** Chúng tôi khuyến nghị sử dụng định dạng `[đối tượng] [hành động]` cho tên sự kiện, ví dụ: `user_signed_up`, `project_created`, `invite_sent`.

### Thiết lập thuộc tính sự kiện

Bạn có thể thêm thuộc tính bổ sung cho sự kiện:

```tsx
agrid?.capture('purchase_completed', {
  product_id: '12345',
  price: 99.99,
  currency: 'USD',
  category: 'electronics',
})
```

### Ghi nhận màn hình (Screen Views)

#### Tự động với useEffect

```tsx
import { useEffect, useState } from 'react'
import { useAgrid } from '@agrid/agrid-react-native'

function AppContent() {
  const [activeScreen, setActiveScreen] = useState('HOME')
  const agrid = useAgrid()

  // Tự động track khi màn hình thay đổi
  useEffect(() => {
    if (agrid) {
      agrid.screen(activeScreen)
    }
  }, [activeScreen, agrid])

  return (
    // UI của bạn
  )
}
```

#### Thủ công

```tsx
agrid?.screen('ProfileScreen', {
  user_id: '123',
  tab: 'settings',
})
```

#### Với @react-navigation/native (v6 trở xuống)

Khi sử dụng `@react-navigation/native` v6 hoặc thấp hơn, screen tracking được tự động ghi nhận nếu sử dụng thuộc tính `autocapture`:

```tsx
import { PostHogProvider } from '@agrid/agrid-react-native'
import { NavigationContainer } from '@react-navigation/native'

export function App() {
  return (
    <NavigationContainer>
      <AgridProvider apiKey="<your_api_key>" autocapture>
        {/* Rest of app */}
      </AgridProvider>
    </NavigationContainer>
  )
}
```

> **⚠️ Lưu ý:** `AgridProvider` phải là con của `NavigationContainer`.

#### Với @react-navigation/native (v7 trở lên)

Đối với v7 trở lên, bạn cần ghi nhận màn hình thủ công:

```tsx
import { useAgrid } from '@agrid/agrid-react-native'
import { NavigationContainer } from '@react-navigation/native'

export function App() {
  const agrid = useAgrid()

  return (
    <NavigationContainer
      onStateChange={(state) => {
        const currentRouteName = getCurrentRouteName(state)
        agrid?.screen(currentRouteName)
      }}
    >
      <AgridProvider
        apiKey="<your_api_key>"
        autocapture={{
          captureScreens: false, // Xử lý riêng cho v7
          captureTouches: true,
        }}
      >
        {/* Rest of app */}
      </AgridProvider>
    </NavigationContainer>
  )
}
```

## Tự động ghi nhận (Autocapture)

Agrid có thể tự động ghi nhận các sự kiện sau:

- **Application Opened** - khi app được mở từ trạng thái đóng
- **Application Became Active** - khi app chuyển sang foreground
- **Application Backgrounded** - khi app chuyển sang background
- **Application Installed** - khi app được cài đặt lần đầu
- **Application Updated** - khi app được cập nhật
- **$screen** - khi người dùng điều hướng (nếu sử dụng navigation library)
- **$autocapture** - sự kiện chạm khi người dùng tương tác với màn hình

### Bật Autocapture

```tsx
<AgridProvider
  apiKey="<your_api_key>"
  options={{
    captureAppLifecycleEvents: true, // Bật app lifecycle events
  }}
  autocapture={{
    captureScreens: true,  // Tự động capture screen views
    captureTouches: true,  // Tự động capture touch events
  }}
>
  {/* App content */}
</AgridProvider>
```

### Tùy chỉnh nhãn cho phần tử

Agrid sẽ tự động tạo tên cho phần tử được chạm dựa trên `displayName` hoặc `name` của React component. Bạn có thể tùy chỉnh bằng prop `ph-label`:

```tsx
<View ph-label="my-special-button">
  <Text>Click me</Text>
</View>
```

### Ngăn chặn capture dữ liệu nhạy cảm

Sử dụng prop `ph-no-capture` để ngăn Agrid capture một phần tử cụ thể:

```tsx
<TextInput
  ph-no-capture
  placeholder="Nhập mật khẩu"
  secureTextEntry
/>
```

## Nhận diện người dùng

### Identify

Sử dụng `identify` để liên kết sự kiện với người dùng cụ thể:

```tsx
agrid?.identify('user_123', {
  email: 'user@example.com',
  name: 'Nguyễn Văn A',
  plan: 'premium',
})
```

> **💡 Mẹo:** Gọi `identify` ngay sau khi người dùng đăng nhập để đảm bảo tất cả sự kiện được liên kết đúng.

### Lấy Distinct ID hiện tại

```tsx
const distinctId = agrid?.getDistinctId()
```

### Alias

Gán nhiều distinct ID cho cùng một người dùng:

```tsx
agrid?.alias('new_distinct_id')
```

### Thiết lập thuộc tính người dùng

#### Sử dụng $set

```tsx
agrid?.identify('user_123', {
  $set: {
    email: 'user@example.com',
    name: 'Nguyễn Văn A',
  }
})
```

#### Sử dụng $set_once

`$set_once` chỉ thiết lập thuộc tính nếu người dùng chưa có thuộc tính đó:

```tsx
agrid?.identify('user_123', {
  $set: {
    email: 'user@example.com',
  },
  $set_once: {
    first_login_date: '2024-01-01',
  }
})
```

#### Thiết lập thuộc tính trong sự kiện

```tsx
agrid?.capture('purchase_completed', {
  $set: {
    last_purchase_date: new Date().toISOString(),
  },
  product_id: '12345',
})
```

## Super Properties

Super properties là các thuộc tính được gửi kèm với **mọi** sự kiện sau khi được thiết lập:

```tsx
agrid?.register({
  app_version: '1.0.0',
  environment: 'production',
  user_tier: 'premium',
})
```

Sau khi gọi `register`, tất cả sự kiện sẽ tự động bao gồm các thuộc tính này.

### Xóa Super Properties

```tsx
agrid?.unregister('app_version')
```

> **⚠️ Lưu ý:** Super properties khác với person properties. Super properties chỉ áp dụng cho sự kiện, không lưu trữ thông tin người dùng.

## Feature Flags

Feature flags cho phép bạn triển khai và rollback tính năng một cách an toàn.

### Cách 1: Sử dụng Hooks

```tsx
import { useFeatureFlag } from '@agrid/agrid-react-native'

function MyComponent() {
  const showNewFeature = useFeatureFlag('new-feature')

  if (showNewFeature) {
    return <NewFeature />
  }

  return <OldFeature />
}
```

### Cách 2: Kiểm tra trực tiếp

```tsx
import { useAgrid } from '@agrid/agrid-react-native'

function MyComponent() {
  const agrid = useAgrid()
  const isEnabled = agrid?.isFeatureEnabled('new-feature')

  return isEnabled ? <NewFeature /> : <OldFeature />
}
```

### Lấy giá trị Feature Flag

```tsx
const flagValue = agrid?.getFeatureFlag('feature-key')
// Trả về: boolean | string | undefined
```

### Lấy payload của Feature Flag

```tsx
const payload = agrid?.getFeatureFlagPayload('feature-key')
```

### Reload Feature Flags

```tsx
// Reload đồng bộ
agrid?.reloadFeatureFlags()

// Reload bất đồng bộ
const flags = await agrid?.reloadFeatureFlagsAsync()
```

### Thiết lập thuộc tính cho Feature Flags

Đôi khi bạn cần đánh giá feature flags dựa trên thuộc tính chưa được gửi lên server:

```tsx
agrid?.setPersonPropertiesForFlags({
  is_beta_user: 'true',
  organization_size: 'large',
})
```

## Tùy chọn nâng cao

### Flush thủ công

Gửi tất cả sự kiện trong hàng đợi ngay lập tức:

```tsx
await agrid?.flush()
```

### Reset sau khi logout

Xóa tất cả dữ liệu người dùng và bắt đầu session mới:

```tsx
agrid?.reset()
```

### Opt out/in

```tsx
// Opt out - ngừng tracking
await agrid?.optOut()

// Opt in - tiếp tục tracking
await agrid?.optIn()
```

### Group Analytics

Liên kết người dùng với một nhóm (ví dụ: công ty, team):

```tsx
agrid?.group('company', 'company_id_123', {
  name: 'Acme Inc',
  employees: 50,
})
```

### Custom Storage

Bạn có thể cung cấp custom storage implementation:

```tsx
import { MMKV } from 'react-native-mmkv'

const storage = new MMKV()

const customStorage = {
  getItem: (key: string) => storage.getString(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
}

<AgridProvider
  apiKey="<your_api_key>"
  options={{
    customStorage: customStorage,
  }}
>
  {/* App */}
</AgridProvider>
```

### Debug Mode

Bật logging để debug:

```tsx
<AgridProvider
  apiKey="<your_api_key>"
  options={{
    // Bật debug logs
    debug: true,
  }}
>
  {/* App */}
</AgridProvider>
```

### Vô hiệu hóa cho môi trường local

```tsx
<AgridProvider
  apiKey="<your_api_key>"
  options={{
    disabled: __DEV__, // Tắt tracking trong development
  }}
>
  {/* App */}
</AgridProvider>
```

## Session Replay

Ghi lại và phát lại session của người dùng:

```tsx
<AgridProvider
  apiKey="<your_api_key>"
  options={{
    enableSessionReplay: true,
    sessionReplayConfig: {
      maskAllTexts: true,        // Che tất cả text
      maskAllImages: true,        // Che tất cả hình ảnh
      captureNetworkTelemetry: true, // Capture network requests
    },
  }}
>
  {/* App */}
</AgridProvider>
```

## Error Tracking

Tự động ghi nhận lỗi JavaScript:

```tsx
<AgridProvider
  apiKey="<your_api_key>"
  options={{
    errorTracking: {
      captureErrors: true,
      captureUnhandledRejections: true,
    },
  }}
>
  {/* App */}
</AgridProvider>
```

## Surveys

Hiển thị khảo sát cho người dùng:

```tsx
import { AgridSurveyProvider } from '@agrid/agrid-react-native'

<AgridProvider apiKey="<your_api_key>">
  <AgridSurveyProvider>
    {/* App */}
  </AgridSurveyProvider>
</AgridProvider>
```

## Ví dụ hoàn chỉnh

```tsx
import React, { useEffect, useState } from 'react'
import { View, Button, Text } from 'react-native'
import { AgridProvider, useAgrid } from '@agrid/agrid-react-native'

function App() {
  return (
    <AgridProvider
      apiKey="<your_api_key>"
      options={{
        host: 'https://gw.track-asia.vn',
        captureAppLifecycleEvents: true,
        flushAt: 10,
      }}
      autocapture={{
        captureTouches: true,
      }}
    >
      <MyApp />
    </AgridProvider>
  )
}

function MyApp() {
  const agrid = useAgrid()
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Identify user khi đăng nhập
    if (user) {
      agrid?.identify(user.id, {
        email: user.email,
        name: user.name,
      })
    }
  }, [user, agrid])

  const handlePurchase = () => {
    agrid?.capture('purchase_completed', {
      product_id: '12345',
      price: 99.99,
    })
  }

  const handleLogout = () => {
    agrid?.reset()
    setUser(null)
  }

  return (
    <View>
      <Text>Welcome to Agrid!</Text>
      <Button title="Make Purchase" onPress={handlePurchase} />
      <Button title="Logout" onPress={handleLogout} />
    </View>
  )
}

export default App
```

## Câu hỏi?

- Liên hệ với đội ngũ hỗ trợ Agrid qua email (advn.software@gmail.com) để được giúp đỡ.

## Tài liệu tham khảo

- [React Native Documentation](https://reactnative.dev/)
