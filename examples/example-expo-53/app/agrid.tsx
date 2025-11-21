import { AgridProvider as AgridRNProvider } from 'agrid-react-native'
import { ReactNode } from 'react'

export function AgridProvider({ children }: { children: ReactNode }) {
    return (
        <AgridRNProvider
            apiKey="phc_..."
            options={{
                host: 'https://gw.track-asia.vn',
            }}
        >
            {children}
        </AgridRNProvider>
    )
}
