import { Agrid } from '../agrid-rn'
import React from 'react'
import { AgridContext } from '../AgridContext'

export const useAgrid = (): Agrid => {
  const { client } = React.useContext(AgridContext)
  return client
}
