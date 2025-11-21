const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const root = path.resolve(__dirname, '../..')
const pkg = require('../../package.json')

const config = getDefaultConfig(__dirname)

config.watchFolders = [root]
config.resolver.nodeModulesPaths = [path.resolve(__dirname, 'node_modules'), path.resolve(root, 'node_modules')]

config.resolver.extraNodeModules = {
    'agrid-react-native': path.resolve(root, 'packages/agrid-react-native'),
    'posthog-react-native-session-replay': path.resolve(root, 'packages/posthog-react-native-session-replay'),
}

module.exports = config
