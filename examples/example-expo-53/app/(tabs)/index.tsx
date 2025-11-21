import { useAgrid } from 'agrid-react-native'
import { StyleSheet, Button } from 'react-native'

import { Text, View } from '@/components/Themed'

export default function TabOneScreen() {
  const agrid = useAgrid()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tab One</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <Button title="Capture Event" onPress={() => agrid.capture('test_event')} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
