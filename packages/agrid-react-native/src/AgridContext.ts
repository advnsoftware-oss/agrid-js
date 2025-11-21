import React from 'react'
import { Agrid } from './agrid-rn'

export const AgridContext = React.createContext<{ client: Agrid }>({ client: undefined as unknown as Agrid })
