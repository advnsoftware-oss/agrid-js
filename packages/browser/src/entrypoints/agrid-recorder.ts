import { record as rrwebRecord } from '@rrweb/record'
import { getRecordConsolePlugin } from '@rrweb/rrweb-plugin-console-record'
import { assignableWindow } from '../utils/globals'
import { getRecordNetworkPlugin } from '../extensions/replay/external/network-plugin'
import { LazyLoadedSessionRecording } from '../extensions/replay/external/lazy-loaded-session-recorder'

assignableWindow.__AgridExtensions__ = assignableWindow.__AgridExtensions__ || {}
assignableWindow.__AgridExtensions__.rrwebPlugins = { getRecordConsolePlugin, getRecordNetworkPlugin }
assignableWindow.__AgridExtensions__.rrweb = { record: rrwebRecord, version: 'v2' }
assignableWindow.__AgridExtensions__.initSessionRecording = (ph) => new LazyLoadedSessionRecording(ph)

// we used to put all of these items directly on window, and now we put it on __AgridExtensions__
// but that means that old clients which lazily load this extension are looking in the wrong place
// yuck,
// so we also put them directly on the window
// when 1.161.1 is the oldest version seen in production we can remove this
assignableWindow.rrweb = { record: rrwebRecord, version: 'v2' }
assignableWindow.rrwebConsoleRecord = { getRecordConsolePlugin }
assignableWindow.getRecordNetworkPlugin = getRecordNetworkPlugin

export default rrwebRecord
