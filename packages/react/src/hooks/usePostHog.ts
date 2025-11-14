import { useContext } from 'react'
import { Agrid, AgridContext } from '../context'

export const useAgrid = (): Agrid => {
    const { client } = useContext(AgridContext)
    return client
}
