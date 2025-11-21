// Mock OptionalExpoFileSystem with legacy APIs (readAsStringAsync)
jest.mock('../src/optional/OptionalExpoFileSystem', () => ({
  OptionalExpoFileSystem: {
    readAsStringAsync: jest.fn(),
    writeAsStringAsync: jest.fn(),
    documentDirectory: '/mock-doc-dir/',
  },
}))

import { AgridRNStorage } from '../src/storage'
import { buildOptimisiticAsyncStorage } from '../src/native-deps'
import { OptionalExpoFileSystem } from '../src/optional/OptionalExpoFileSystem'

const mockedOptionalFileSystem = jest.mocked(OptionalExpoFileSystem, true)

jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}))

describe('Agrid React Native', () => {
  jest.useRealTimers()

  describe('storage', () => {
    let storage: AgridRNStorage
    beforeEach(() => {
      mockedOptionalFileSystem!.readAsStringAsync.mockImplementation(() => {
        const res = Promise.resolve(
          JSON.stringify({
            version: 'v1',
            content: {
              foo: 'bar',
            },
          })
        )
        return res
      })

      storage = new AgridRNStorage(buildOptimisiticAsyncStorage())
    })

    it('should load storage from the file system', async () => {
      expect(storage.getItem('foo')).toEqual(undefined)
      await storage.preloadPromise
      expect(mockedOptionalFileSystem!.readAsStringAsync).toHaveBeenCalledTimes(1)
      expect(storage.getItem('foo')).toEqual('bar')
    })

    it('should save storage to the file system', async () => {
      storage.setItem('foo', 'bar2')
      expect(storage.getItem('foo')).toEqual('bar2')
      expect(mockedOptionalFileSystem!.writeAsStringAsync).toHaveBeenCalledWith(
        '/mock-doc-dir/.agrid-rn.json',
        JSON.stringify({
          version: 'v1',
          content: {
            foo: 'bar2',
          },
        })
      )
    })
  })
})
