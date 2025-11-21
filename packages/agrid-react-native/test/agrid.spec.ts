import { Agrid, AgridCustomStorage, PostHogPersistedProperty } from '../src'
import { Linking, AppState, AppStateStatus } from 'react-native'
import { waitForExpect } from './test-utils'
import { AgridRNStorage } from '../src/storage'

Linking.getInitialURL = jest.fn(() => Promise.resolve(null))
AppState.addEventListener = jest.fn()

describe('Agrid React Native', () => {
  describe('evaluation environments', () => {
    it('should send evaluation environments when configured', async () => {
      agrid = new Agrid('test-token', {
        evaluationEnvironments: ['production', 'mobile'],
        flushInterval: 0,
      })
      await agrid.ready()

      await agrid.reloadFeatureFlagsAsync()

      expect((globalThis as any).window.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/flags/?v=2&config=true'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"evaluation_environments":["production","mobile"]'),
        })
      )
    })

    it('should not send evaluation environments when not configured', async () => {
      agrid = new Agrid('test-token', {
        flushInterval: 0,
      })
      await agrid.ready()

      await agrid.reloadFeatureFlagsAsync()

      expect((globalThis as any).window.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/flags/?v=2&config=true'),
        expect.objectContaining({
          method: 'POST',
          body: expect.not.stringContaining('evaluation_environments'),
        })
      )
    })

    it('should not send evaluation environments when configured as empty array', async () => {
      agrid = new Agrid('test-token', {
        evaluationEnvironments: [],
        flushInterval: 0,
      })
      await agrid.ready()

      await agrid.reloadFeatureFlagsAsync()

      expect((globalThis as any).window.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/flags/?v=2&config=true'),
        expect.objectContaining({
          method: 'POST',
          body: expect.not.stringContaining('evaluation_environments'),
        })
      )
    })
  })

  let mockStorage: AgridCustomStorage
  let cache: any = {}

  jest.setTimeout(500)
  jest.useRealTimers()

  let agrid: Agrid

  beforeEach(() => {
    ;(globalThis as any).window.fetch = jest.fn(async (url) => {
      let res: any = { status: 'ok' }
      if (url.includes('flags')) {
        res = {
          featureFlags: {},
        }
      }

      return {
        status: 200,
        json: () => Promise.resolve(res),
      }
    })

    cache = {}
    mockStorage = {
      getItem: async (key) => {
        return cache[key] || null
      },
      setItem: async (key, value) => {
        cache[key] = value
      },
    }
  })

  afterEach(async () => {
    // This ensures there are no open promises / timers
    await agrid.shutdown()
  })

  it('should initialize properly with bootstrap', async () => {
    agrid = new Agrid('test-token', {
      bootstrap: { distinctId: 'bar' },
      persistence: 'memory',
      flushInterval: 0,
    })

    await agrid.ready()

    expect(agrid.getAnonymousId()).toEqual('bar')
    expect(agrid.getDistinctId()).toEqual('bar')
  })

  it('should initialize properly with bootstrap using async storage', async () => {
    agrid = new Agrid('test-token', {
      bootstrap: { distinctId: 'bar' },
      persistence: 'file',
      flushInterval: 0,
    })
    await agrid.ready()

    expect(agrid.getAnonymousId()).toEqual('bar')
    expect(agrid.getDistinctId()).toEqual('bar')
  })

  it('should allow customising of native app properties', async () => {
    agrid = new Agrid('test-token', {
      customAppProperties: { $app_name: 'custom' },
      flushInterval: 0,
    })
    // await agrid.ready()

    expect(agrid.getCommonEventProperties()).toEqual({
      $lib: 'agrid-react-native',
      $lib_version: expect.any(String),
      $screen_height: expect.any(Number),
      $screen_width: expect.any(Number),

      $app_name: 'custom',
    })

    const agrid2 = new Agrid('test-token2', {
      flushInterval: 0,
      customAppProperties: (properties) => {
        properties.$app_name = 'customised!'
        delete properties.$device_name
        return properties
      },
    })
    await agrid.ready()

    expect(agrid2.getCommonEventProperties()).toEqual({
      $lib: 'agrid-react-native',
      $lib_version: expect.any(String),
      $screen_height: expect.any(Number),
      $screen_width: expect.any(Number),

      $app_build: 'mock',
      $app_name: 'customised!', // changed
      $app_namespace: 'mock',
      $app_version: 'mock',
      $device_manufacturer: 'mock',
      $device_type: 'Mobile',
      // $device_name: 'mock', (deleted)
      $os_name: 'mock',
      $os_version: 'mock',
      $locale: 'mock',
      $timezone: 'mock',
    })

    await agrid2.shutdown()
  })

  describe('screen', () => {
    it('should set a $screen_name property on screen', async () => {
      agrid = new Agrid('test-token', {
        customStorage: mockStorage,
        flushInterval: 0,
      })

      await agrid.screen('test-screen')

      expect((agrid as any).sessionProps).toMatchObject({
        $screen_name: 'test-screen',
      })

      expect(agrid.getPersistedProperty(PostHogPersistedProperty.Props)).toEqual(undefined)
    })
  })

  describe('captureAppLifecycleEvents', () => {
    it('should trigger an Application Installed event', async () => {
      // arrange
      const onCapture = jest.fn()

      // act
      agrid = new Agrid('1', {
        customStorage: mockStorage,
        captureAppLifecycleEvents: true,
        customAppProperties: {
          $app_build: '1',
          $app_version: '1.0.0',
        },
      })
      agrid.on('capture', onCapture)

      await waitForExpect(200, () => {
        expect(onCapture).toHaveBeenCalledTimes(2)
        expect(onCapture.mock.calls[0][0]).toMatchObject({
          event: 'Application Installed',
          properties: {
            $app_build: '1',
            $app_version: '1.0.0',
          },
        })
        expect(onCapture.mock.calls[1][0]).toMatchObject({
          event: 'Application Opened',
          properties: {
            $app_build: '1',
            $app_version: '1.0.0',
          },
        })
      })
    })

    it('should trigger an Application Updated event', async () => {
      // arrange
      const onCapture = jest.fn()
      agrid = new Agrid('1', {
        customStorage: mockStorage,
        captureAppLifecycleEvents: true,
        customAppProperties: {
          $app_build: '1',
          $app_version: '1.0.0',
        },
      })
      agrid.on('capture', onCapture)

      await waitForExpect(200, () => {
        expect(onCapture).toHaveBeenCalledTimes(2)
      })

      onCapture.mockClear()
      // act
      agrid = new Agrid('1', {
        customStorage: mockStorage,
        captureAppLifecycleEvents: true,
        customAppProperties: {
          $app_build: '2',
          $app_version: '2.0.0',
        },
      })
      agrid.on('capture', onCapture)

      await waitForExpect(200, () => {
        // assert
        expect(onCapture).toHaveBeenCalledTimes(2)
        expect(onCapture.mock.calls[0][0]).toMatchObject({
          event: 'Application Updated',
          properties: {
            $app_build: '2',
            $app_version: '2.0.0',
            previous_build: '1',
            previous_version: '1.0.0',
          },
        })
        expect(onCapture.mock.calls[1][0]).toMatchObject({
          event: 'Application Opened',
          properties: {
            $app_build: '2',
            $app_version: '2.0.0',
          },
        })
      })
    })

    it('should include the initial url', async () => {
      // arrange
      Linking.getInitialURL = jest.fn(() => Promise.resolve('https://example.com'))
      const onCapture = jest.fn()

      agrid = new Agrid('1', {
        customStorage: mockStorage,
        captureAppLifecycleEvents: true,
        customAppProperties: {
          $app_build: '1',
          $app_version: '1.0.0',
        },
      })
      agrid.on('capture', onCapture)

      await waitForExpect(200, () => {
        expect(onCapture).toHaveBeenCalledTimes(2)
      })

      onCapture.mockClear()

      agrid = new Agrid('1', {
        customStorage: mockStorage,
        captureAppLifecycleEvents: true,
        customAppProperties: {
          $app_build: '1',
          $app_version: '1.0.0',
        },
      })
      agrid.on('capture', onCapture)

      // assert
      await waitForExpect(200, () => {
        expect(onCapture).toHaveBeenCalledTimes(1)
        expect(onCapture.mock.calls[0][0]).toMatchObject({
          event: 'Application Opened',
          properties: {
            $app_build: '1',
            $app_version: '1.0.0',
            url: 'https://example.com',
          },
        })
      })
    })

    it('should track app background and foreground', async () => {
      // arrange
      const onCapture = jest.fn()
      agrid = new Agrid('1', {
        customStorage: mockStorage,
        captureAppLifecycleEvents: true,
        customAppProperties: {
          $app_build: '1',
          $app_version: '1.0.0',
        },
      })
      agrid.on('capture', onCapture)

      await waitForExpect(200, () => {
        expect(onCapture).toHaveBeenCalledTimes(2)
      })

      const cb: (state: AppStateStatus) => void = (AppState.addEventListener as jest.Mock).mock.calls[1][1]

      // act
      cb('background')
      cb('active')

      // assert
      await waitForExpect(200, () => {
        expect(onCapture).toHaveBeenCalledTimes(4)
        expect(onCapture.mock.calls[2][0]).toMatchObject({
          event: 'Application Backgrounded',
          properties: {
            $app_build: '1',
            $app_version: '1.0.0',
          },
        })
        expect(onCapture.mock.calls[3][0]).toMatchObject({
          event: 'Application Became Active',
          properties: {
            $app_build: '1',
            $app_version: '1.0.0',
          },
        })
      })
    })
  })

  describe('async initialization', () => {
    beforeEach(async () => {
      const semiAsyncStorage = new AgridRNStorage(mockStorage)
      await semiAsyncStorage.preloadPromise
      semiAsyncStorage.setItem(PostHogPersistedProperty.AnonymousId, 'my-anonymous-id')
    })

    it('should allow immediate calls but delay for the stored values', async () => {
      const onCapture = jest.fn()
      mockStorage.setItem(PostHogPersistedProperty.AnonymousId, 'my-anonymous-id')
      agrid = new Agrid('1', {
        customStorage: mockStorage,
        captureAppLifecycleEvents: false,
      })
      agrid.on('capture', onCapture)
      agrid.on('identify', onCapture)

      // Should all be empty as the storage isn't ready
      expect(agrid.getDistinctId()).toEqual('')
      expect(agrid.getAnonymousId()).toEqual('')
      expect(agrid.getSessionId()).toEqual('')

      // Fire multiple calls that have dependencies on one another
      agrid.capture('anonymous event')
      agrid.identify('identified-id')
      agrid.capture('identified event')

      await waitForExpect(200, () => {
        expect(agrid.getDistinctId()).toEqual('identified-id')
        expect(agrid.getAnonymousId()).toEqual('my-anonymous-id')

        expect(onCapture).toHaveBeenCalledTimes(3)
        expect(onCapture.mock.calls[0][0]).toMatchObject({
          event: 'anonymous event',
          distinct_id: 'my-anonymous-id',
        })

        expect(onCapture.mock.calls[1][0]).toMatchObject({
          event: '$identify',
          distinct_id: 'identified-id',
          properties: {
            $anon_distinct_id: 'my-anonymous-id',
          },
        })
        expect(onCapture.mock.calls[2][0]).toMatchObject({
          event: 'identified event',
          distinct_id: 'identified-id',
          properties: {},
        })
      })
    })
  })

  describe('sync initialization', () => {
    let storage: AgridCustomStorage
    let cache: { [key: string]: any | undefined }
    let rnStorage: AgridRNStorage

    beforeEach(async () => {
      cache = {}
      storage = {
        getItem: jest.fn((key: string) => cache[key]),
        setItem: jest.fn((key: string, value: string) => {
          cache[key] = value
        }),
      }
      rnStorage = new AgridRNStorage(storage)
      await rnStorage.preloadPromise
    })

    it('should allow immediate calls without delay for stored values', async () => {
      agrid = new Agrid('1', {
        customStorage: storage,
      })

      expect(storage.getItem).toHaveBeenCalledTimes(2)
      expect(agrid.getFeatureFlag('flag')).toEqual(undefined)
      agrid.overrideFeatureFlag({
        flag: true,
      })
      expect(agrid.getFeatureFlag('flag')).toEqual(true)

      // New instance but same sync storage
      agrid = new Agrid('1', {
        customStorage: storage,
      })

      expect(storage.getItem).toHaveBeenCalledTimes(3)
      expect(agrid.getFeatureFlag('flag')).toEqual(true)
    })

    it('do not rotate session id on restart', async () => {
      const sessionId = '0192244d-a627-7ae2-b22a-ccd594bed71d'
      rnStorage.setItem(PostHogPersistedProperty.SessionId, sessionId)
      const now = JSON.stringify(Date.now())
      rnStorage.setItem(PostHogPersistedProperty.SessionLastTimestamp, now)
      rnStorage.setItem(PostHogPersistedProperty.SessionStartTimestamp, now)

      agrid = new Agrid('1', {
        customStorage: storage,
        enablePersistSessionIdAcrossRestart: true,
      })

      expect(agrid.getPersistedProperty(PostHogPersistedProperty.SessionId)).toEqual(sessionId)
      expect(agrid.getPersistedProperty(PostHogPersistedProperty.SessionLastTimestamp)).toEqual(now)
      expect(agrid.getPersistedProperty(PostHogPersistedProperty.SessionStartTimestamp)).toEqual(now)
    })

    it('rotate session id on restart if persist session id across restart is disabled', async () => {
      const sessionId = '0192244d-a627-7ae2-b22a-ccd594bed71d'
      rnStorage.setItem(PostHogPersistedProperty.SessionId, sessionId)
      const now = JSON.stringify(Date.now())
      rnStorage.setItem(PostHogPersistedProperty.SessionLastTimestamp, now)
      rnStorage.setItem(PostHogPersistedProperty.SessionStartTimestamp, now)

      agrid = new Agrid('1', {
        customStorage: storage,
        enablePersistSessionIdAcrossRestart: false,
      })

      expect(agrid.getPersistedProperty(PostHogPersistedProperty.SessionId)).toEqual(undefined)
      expect(agrid.getPersistedProperty(PostHogPersistedProperty.SessionLastTimestamp)).toEqual(undefined)
      expect(agrid.getPersistedProperty(PostHogPersistedProperty.SessionStartTimestamp)).toEqual(undefined)
    })

    it('rotate session id if expired after 30 minutes', async () => {
      const sessionId = '0192244d-a627-7ae2-b22a-ccd594bed71d'
      rnStorage.setItem(PostHogPersistedProperty.SessionId, sessionId)
      const now = Date.now()
      const nowMinus1Hour = JSON.stringify(now - 60 * 60 * 1000)
      const nowMinus45Minutes = JSON.stringify(now - 45 * 60 * 1000)
      rnStorage.setItem(PostHogPersistedProperty.SessionLastTimestamp, nowMinus45Minutes)
      rnStorage.setItem(PostHogPersistedProperty.SessionStartTimestamp, nowMinus1Hour)

      agrid = new Agrid('1', {
        customStorage: storage,
        enablePersistSessionIdAcrossRestart: true,
      })

      const newSessionId = agrid.getSessionId()

      expect(agrid.getPersistedProperty(PostHogPersistedProperty.SessionId)).not.toEqual(sessionId)
      expect(agrid.getPersistedProperty(PostHogPersistedProperty.SessionId)).toEqual(newSessionId)
      expect(agrid.getPersistedProperty(PostHogPersistedProperty.SessionLastTimestamp)).not.toEqual(nowMinus45Minutes)
      expect(agrid.getPersistedProperty(PostHogPersistedProperty.SessionStartTimestamp)).not.toEqual(nowMinus1Hour)
    })

    it('do not rotate session id if not expired', async () => {
      const sessionId = '0192244d-a627-7ae2-b22a-ccd594bed71d'
      rnStorage.setItem(PostHogPersistedProperty.SessionId, sessionId)
      const now = Date.now()
      const nowMinus1Hour = JSON.stringify(now - 60 * 60 * 1000)
      const nowMinus15Minutes = JSON.stringify(now - 15 * 60 * 1000)
      rnStorage.setItem(PostHogPersistedProperty.SessionLastTimestamp, nowMinus15Minutes)
      rnStorage.setItem(PostHogPersistedProperty.SessionStartTimestamp, nowMinus1Hour)

      agrid = new Agrid('1', {
        customStorage: storage,
        enablePersistSessionIdAcrossRestart: true,
      })

      const currentSessionId = agrid.getSessionId()

      expect(agrid.getPersistedProperty(PostHogPersistedProperty.SessionId)).toEqual(currentSessionId)
      expect(agrid.getPersistedProperty(PostHogPersistedProperty.SessionLastTimestamp)).not.toEqual(nowMinus15Minutes)
      expect(agrid.getPersistedProperty(PostHogPersistedProperty.SessionStartTimestamp)).toEqual(nowMinus1Hour)
    })

    it('rotate session id if expired after 24 hours', async () => {
      const sessionId = '0192244d-a627-7ae2-b22a-ccd594bed71d'
      rnStorage.setItem(PostHogPersistedProperty.SessionId, sessionId)
      const now = Date.now()
      const nowMinus25Hour = JSON.stringify(now - 25 * 60 * 60 * 1000)
      const nowMinus15Minutes = JSON.stringify(now - 15 * 60 * 1000)
      rnStorage.setItem(PostHogPersistedProperty.SessionLastTimestamp, nowMinus15Minutes)
      rnStorage.setItem(PostHogPersistedProperty.SessionStartTimestamp, nowMinus25Hour)

      agrid = new Agrid('1', {
        customStorage: storage,
        enablePersistSessionIdAcrossRestart: true,
      })

      const newSessionId = agrid.getSessionId()

      expect(agrid.getPersistedProperty(PostHogPersistedProperty.SessionId)).not.toEqual(sessionId)
      expect(agrid.getPersistedProperty(PostHogPersistedProperty.SessionId)).toEqual(newSessionId)
      expect(agrid.getPersistedProperty(PostHogPersistedProperty.SessionLastTimestamp)).not.toEqual(nowMinus15Minutes)
      expect(agrid.getPersistedProperty(PostHogPersistedProperty.SessionStartTimestamp)).not.toEqual(nowMinus25Hour)
    })

    it('do not rotate session id if not expired after 24 hours', async () => {
      const sessionId = '0192244d-a627-7ae2-b22a-ccd594bed71d'
      rnStorage.setItem(PostHogPersistedProperty.SessionId, sessionId)
      const now = Date.now()
      const nowMinus23Hour = JSON.stringify(now - 23 * 60 * 60 * 1000)
      const nowMinus15Minutes = JSON.stringify(now - 15 * 60 * 1000)
      rnStorage.setItem(PostHogPersistedProperty.SessionLastTimestamp, nowMinus15Minutes)
      rnStorage.setItem(PostHogPersistedProperty.SessionStartTimestamp, nowMinus23Hour)

      agrid = new Agrid('1', {
        customStorage: storage,
        enablePersistSessionIdAcrossRestart: true,
      })

      const currentSessionID = agrid.getSessionId()

      expect(currentSessionID).toEqual(sessionId)
      expect(agrid.getPersistedProperty(PostHogPersistedProperty.SessionId)).toEqual(sessionId)
      expect(agrid.getPersistedProperty(PostHogPersistedProperty.SessionStartTimestamp)).toEqual(nowMinus23Hour)
    })
  })

  describe('person and group properties for flags', () => {
    describe('default person properties', () => {
      afterEach(() => {
        jest.restoreAllMocks()
      })

      it('should set default person properties on initialization when enabled', async () => {
        jest.spyOn(Agrid.prototype, 'getCommonEventProperties').mockReturnValue({
          $lib: 'agrid-react-native',
          $lib_version: '1.2.3',
        })

        agrid = new Agrid('test-api-key', {
          setDefaultPersonProperties: true,
          customAppProperties: {
            $app_version: '1.0.0',
            $app_namespace: 'com.example.app',
            $device_type: 'Mobile',
            $os_name: 'iOS',
          },
        })

        await agrid.ready()

        const cachedProps = agrid.getPersistedProperty(PostHogPersistedProperty.PersonProperties)

        expect(cachedProps).toHaveProperty('$app_version', '1.0.0')
        expect(cachedProps).toHaveProperty('$app_namespace', 'com.example.app')
        expect(cachedProps).toHaveProperty('$device_type', 'Mobile')
        expect(cachedProps).toHaveProperty('$os_name', 'iOS')
        expect(cachedProps.$lib).toBe('agrid-react-native')
        expect(cachedProps.$lib_version).toBe('1.2.3')
      })

      it('should not set default person properties when disabled', async () => {
        agrid = new Agrid('test-api-key', {
          setDefaultPersonProperties: false,
        })
        await agrid.ready()

        const cachedProps = agrid.getPersistedProperty(PostHogPersistedProperty.PersonProperties)

        expect(cachedProps === undefined || Object.keys(cachedProps).length === 0).toBe(true)
      })

      it('should set default person properties by default (true)', async () => {
        agrid = new Agrid('test-api-key', {
          customAppProperties: {
            $device_type: 'Mobile',
          },
        })
        await agrid.ready()

        const cachedProps = agrid.getPersistedProperty(PostHogPersistedProperty.PersonProperties)

        expect(cachedProps).toBeTruthy()
        expect(cachedProps).toHaveProperty('$device_type', 'Mobile')
      })

      it('should only include defined properties', async () => {
        agrid = new Agrid('test-api-key', {
          setDefaultPersonProperties: true,
          customAppProperties: {
            $app_version: '1.0.0',
            $app_namespace: 'com.example.app',
            $device_type: 'Mobile',
            $os_name: null,
          },
        })
        await agrid.ready()

        const cachedProps = agrid.getPersistedProperty(PostHogPersistedProperty.PersonProperties)

        expect(cachedProps).toHaveProperty('$app_version', '1.0.0')
        expect(cachedProps).toHaveProperty('$app_namespace', 'com.example.app')
        expect(cachedProps).toHaveProperty('$device_type', 'Mobile')
        expect(cachedProps).not.toHaveProperty('$os_name')
      })

      it('should restore default properties after reset()', async () => {
        agrid = new Agrid('test-api-key', {
          setDefaultPersonProperties: true,
          customAppProperties: {
            $device_type: 'Mobile',
          },
        })
        await agrid.ready()

        let cachedProps = agrid.getPersistedProperty(PostHogPersistedProperty.PersonProperties)
        expect(cachedProps).toBeTruthy()
        expect(cachedProps).toHaveProperty('$device_type', 'Mobile')

        agrid.reset()

        cachedProps = agrid.getPersistedProperty(PostHogPersistedProperty.PersonProperties)
        expect(cachedProps).toBeTruthy()
        expect(cachedProps).toHaveProperty('$device_type', 'Mobile')
      })

      it('should set default properties synchronously during reset without extra reload', async () => {
        jest.spyOn(Agrid.prototype, 'getCommonEventProperties').mockReturnValue({
          $lib: 'agrid-react-native',
          $lib_version: '1.2.3',
        })
        agrid = new Agrid('test-api-key', {
          setDefaultPersonProperties: true,
          customAppProperties: {
            $device_type: 'Mobile',
            $os_name: 'iOS',
          },
        })
        await agrid.ready()
        ;(globalThis as any).window.fetch.mockClear()

        agrid.reset()

        // `reset` reloads flags asynchronously but does not wait for it
        // we wait for the next tick to allow the event loop to process it
        await new Promise((resolve) => setImmediate(resolve))

        const flagsCalls = (globalThis as any).window.fetch.mock.calls.filter((call: any) =>
          call[0].includes('/flags/')
        )
        expect(flagsCalls.length).toBe(1)

        const flagsCallBody = JSON.parse(flagsCalls[0][1].body)
        expect(flagsCallBody.person_properties).toEqual({
          $device_type: 'Mobile',
          $os_name: 'iOS',
          $lib: 'agrid-react-native',
          $lib_version: '1.2.3',
        })
      })

      it('should merge user properties with default properties', async () => {
        agrid = new Agrid('test-api-key', {
          setDefaultPersonProperties: true,
          customAppProperties: {
            $device_type: 'Mobile',
            $app_version: '1.0.0',
          },
        })
        await agrid.ready()

        let cachedProps = agrid.getPersistedProperty(PostHogPersistedProperty.PersonProperties)
        expect(cachedProps.$device_type).toBe('Mobile')

        agrid.identify('user-123', { $device_type: 'Tablet', email: 'test@example.com' })

        cachedProps = agrid.getPersistedProperty(PostHogPersistedProperty.PersonProperties)
        expect(cachedProps.$device_type).toBe('Tablet')
        expect(cachedProps.$app_version).toBe('1.0.0')
        expect(cachedProps.email).toBe('test@example.com')
      })
    })

    describe('person properties auto-caching from identify()', () => {
      beforeEach(async () => {
        agrid = new Agrid('test-api-key', {
          setDefaultPersonProperties: false,
        })
        await agrid.ready()
      })

      it('should cache person properties from identify() call', async () => {
        agrid.identify('user-123', { email: 'test@example.com', name: 'Test User' })

        const cachedProps = agrid.getPersistedProperty(PostHogPersistedProperty.PersonProperties)
        expect(cachedProps).toEqual({ email: 'test@example.com', name: 'Test User' })
      })

      it('should merge person properties from multiple identify() calls', async () => {
        agrid.identify('user-123', { email: 'test@example.com' })
        agrid.identify('user-123', { name: 'Test User' })

        const cachedProps = agrid.getPersistedProperty(PostHogPersistedProperty.PersonProperties)
        expect(cachedProps).toEqual({ email: 'test@example.com', name: 'Test User' })
      })

      it('should clear person properties on reset()', async () => {
        agrid.identify('user-123', { email: 'test@example.com' })
        expect(agrid.getPersistedProperty(PostHogPersistedProperty.PersonProperties)).toBeTruthy()

        agrid.reset()
        const cachedProps = agrid.getPersistedProperty(PostHogPersistedProperty.PersonProperties)
        expect(cachedProps === undefined || Object.keys(cachedProps).length === 0).toBe(true)
      })

      it('should cache properties from $set when provided', async () => {
        agrid.identify('user-123', {
          $set: { email: 'test@example.com', plan: 'premium' },
        })

        const cachedProps = agrid.getPersistedProperty(PostHogPersistedProperty.PersonProperties)
        expect(cachedProps).toEqual({ email: 'test@example.com', plan: 'premium' })
      })

      it('should ignore $set_once when caching properties', async () => {
        agrid.identify('user-123', {
          $set: { email: 'test@example.com' },
          $set_once: { created_at: '2024-01-01' },
        })

        const cachedProps = agrid.getPersistedProperty(PostHogPersistedProperty.PersonProperties)
        expect(cachedProps).toEqual({ email: 'test@example.com' })
      })

      it('should merge properties from multiple identify() calls with $set', async () => {
        agrid.identify('user-123', { $set: { email: 'test@example.com' } })
        agrid.identify('user-123', { $set: { plan: 'premium' } })

        const cachedProps = agrid.getPersistedProperty(PostHogPersistedProperty.PersonProperties)
        expect(cachedProps).toEqual({ email: 'test@example.com', plan: 'premium' })
      })

      it('should reload flags once when identify() is called with same distinctId and new properties', async () => {
        ;(globalThis as any).window.fetch = jest.fn().mockResolvedValue({ status: 200 })
        agrid = new Agrid('test-api-key', {
          setDefaultPersonProperties: false,
          flushInterval: 0,
          preloadFeatureFlags: false,
        })
        const distinctId = 'user-123'
        jest.spyOn(agrid, 'getDistinctId').mockReturnValue(distinctId)
        await agrid.ready()
        ;(globalThis as any).window.fetch.mockClear()

        agrid.identify(distinctId, { email: 'test@example.com' })

        await new Promise((resolve) => setImmediate(resolve))

        const flagsCalls = (globalThis as any).window.fetch.mock.calls.filter((call: any) =>
          call[0].includes('/flags/')
        )
        expect(flagsCalls.length).toBe(1)
      })

      it('should reload flags once when identify() is called with different distinctId', async () => {
        ;(globalThis as any).window.fetch = jest.fn().mockResolvedValue({ status: 200 })
        agrid = new Agrid('test-api-key', {
          setDefaultPersonProperties: false,
          flushInterval: 0,
          preloadFeatureFlags: false,
        })
        await agrid.ready()
        jest.spyOn(agrid, 'getDistinctId').mockReturnValue('user-123')
        ;(globalThis as any).window.fetch.mockClear()

        agrid.identify('some-new-distinct-id', { email: 'different@example.com' })

        await new Promise((resolve) => setImmediate(resolve))

        const flagsCalls = (globalThis as any).window.fetch.mock.calls.filter((call: any) =>
          call[0].includes('/flags/')
        )
        expect(flagsCalls.length).toBe(1)
      })
    })

    describe('group properties auto-caching from group()', () => {
      beforeEach(async () => {
        agrid = new Agrid('test-api-key', {
          setDefaultPersonProperties: false,
        })
        await agrid.ready()
      })

      it('should cache group properties from group() call', async () => {
        agrid.group('company', 'acme-inc', { name: 'Acme Inc', employees: 50 })

        const cachedProps = agrid.getPersistedProperty(PostHogPersistedProperty.GroupProperties)
        expect(cachedProps).toEqual({ company: { name: 'Acme Inc', employees: '50' } })
      })

      it('should merge group properties from multiple group() calls', async () => {
        agrid.group('company', 'acme-inc', { name: 'Acme Inc' })
        agrid.group('company', 'acme-inc', { employees: 50 })

        const cachedProps = agrid.getPersistedProperty(PostHogPersistedProperty.GroupProperties)
        expect(cachedProps).toEqual({ company: { name: 'Acme Inc', employees: '50' } })
      })

      it('should handle multiple group types', async () => {
        agrid.group('company', 'acme-inc', { name: 'Acme Inc' })
        agrid.group('project', 'proj-1', { name: 'Project 1' })

        const cachedProps = agrid.getPersistedProperty(PostHogPersistedProperty.GroupProperties)
        expect(cachedProps).toEqual({
          company: { name: 'Acme Inc' },
          project: { name: 'Project 1' },
        })
      })

      it('should clear group properties on reset()', async () => {
        agrid.group('company', 'acme-inc', { name: 'Acme Inc' })
        expect(agrid.getPersistedProperty(PostHogPersistedProperty.GroupProperties)).toBeTruthy()

        agrid.reset()
        expect(agrid.getPersistedProperty(PostHogPersistedProperty.GroupProperties)).toBeUndefined()
      })
    })

    describe('reloadFeatureFlags parameter', () => {
      beforeEach(async () => {
        ;(globalThis as any).window.fetch = jest.fn(async (url) => {
          let res: any = { status: 'ok' }
          if (url.includes('flags')) {
            res = {
              featureFlags: { 'test-flag': true },
            }
          }

          return {
            status: 200,
            json: () => Promise.resolve(res),
          }
        })

        agrid = new Agrid('test-api-key', {
          setDefaultPersonProperties: false,
          flushInterval: 0,
          preloadFeatureFlags: false,
        })
        await agrid.ready()
        ;(globalThis as any).window.fetch.mockClear()
      })

      it('should reload feature flags by default when calling setPersonPropertiesForFlags', async () => {
        agrid.setPersonPropertiesForFlags({ email: 'test@example.com' })

        await waitForExpect(200, () => {
          expect((globalThis as any).window.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/flags/'),
            expect.any(Object)
          )
        })
      })

      it('should not reload feature flags when reloadFeatureFlags is false for setPersonPropertiesForFlags', async () => {
        agrid.setPersonPropertiesForFlags({ email: 'test@example.com' }, false)

        await new Promise((resolve) => setTimeout(resolve, 100))

        expect((globalThis as any).window.fetch).not.toHaveBeenCalled()
      })

      it('should reload feature flags by default when calling setGroupPropertiesForFlags', async () => {
        agrid.setGroupPropertiesForFlags({ company: { name: 'Acme Inc' } })

        await waitForExpect(200, () => {
          expect((globalThis as any).window.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/flags/'),
            expect.any(Object)
          )
        })
      })

      it('should not reload feature flags when reloadFeatureFlags is false for setGroupPropertiesForFlags', async () => {
        agrid.setGroupPropertiesForFlags({ company: { name: 'Acme Inc' } }, false)

        await new Promise((resolve) => setTimeout(resolve, 100))

        expect((globalThis as any).window.fetch).not.toHaveBeenCalled()
      })

      it('should reload feature flags by default when calling resetPersonPropertiesForFlags', async () => {
        agrid.setPersonPropertiesForFlags({ email: 'test@example.com' }, false)
        ;(globalThis as any).window.fetch.mockClear()

        agrid.resetPersonPropertiesForFlags()

        await waitForExpect(200, () => {
          expect((globalThis as any).window.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/flags/'),
            expect.any(Object)
          )
        })
      })

      it('should not reload feature flags when reloadFeatureFlags is false for resetPersonPropertiesForFlags', async () => {
        agrid.setPersonPropertiesForFlags({ email: 'test@example.com' }, false)
        ;(globalThis as any).window.fetch.mockClear()

        agrid.resetPersonPropertiesForFlags(false)

        await new Promise((resolve) => setTimeout(resolve, 100))

        expect((globalThis as any).window.fetch).not.toHaveBeenCalled()
      })

      it('should reload feature flags by default when calling resetGroupPropertiesForFlags', async () => {
        agrid.setGroupPropertiesForFlags({ company: { name: 'Acme Inc' } }, false)
        ;(globalThis as any).window.fetch.mockClear()

        agrid.resetGroupPropertiesForFlags()

        await waitForExpect(200, () => {
          expect((globalThis as any).window.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/flags/'),
            expect.any(Object)
          )
        })
      })

      it('should not reload feature flags when reloadFeatureFlags is false for resetGroupPropertiesForFlags', async () => {
        agrid.setGroupPropertiesForFlags({ company: { name: 'Acme Inc' } }, false)
        ;(globalThis as any).window.fetch.mockClear()

        agrid.resetGroupPropertiesForFlags(false)

        await new Promise((resolve) => setTimeout(resolve, 100))

        expect((globalThis as any).window.fetch).not.toHaveBeenCalled()
      })
    })
  })
})
