import agridJs, { BootstrapConfig } from 'agrid-js'
import { createContext } from 'react'

export type Agrid = typeof agridJs

export const AgridContext = createContext<{ client: Agrid; bootstrap?: BootstrapConfig }>({
    client: agridJs,
    bootstrap: undefined,
})
