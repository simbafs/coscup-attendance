import { Attendance } from '@/types/attendance'
import { useReducer, useEffect } from 'react'
import { useToken } from './useToken'
import useWS from './useWS'
import { shouldParse } from '@/libs/util'
import { Diff } from './useDiff'

// useAttendance get init value of attendance from server and listen to websocket for updates
export function useAttendance() {
  const token = useToken()
  const { socket, lastMessage } = useWS(`ws://localhost:3000/ws?token=${token}`)
  const [attendance, updateAttendance] = useReducer(
    (
      state: Attendance,
      action: {
        data: Attendance
        overwrite: boolean
      },
    ) => {
      if (action.overwrite) {
        return action.data
      }
      if (!state) return state

      const r = { ...state, ...action.data }
      // r[action.id] = Number(action.attendance)
      return r
    },
    {},
  )

  // get initial attendance
  useEffect(() => {
    console.log({ token })
    console.log('fetching attendance')
    fetch(`/api/attendance?token=${token}`)
      .then(res => res.json())
      .then(data => {
        console.log('!!!', data)
        return data
      })
      .then(data =>
        updateAttendance({
          data: data.attendance,
          overwrite: true,
        }),
      )
      .then(() => console.log('attendance loaded'))
  }, [token])

  // process the incoming message
  useEffect(() => {
    console.log({ lastMessage })
    const dataArray = shouldParse<Diff[]>(lastMessage, [])

    let update: Record<string, number> = {}
    for (let data of dataArray) {
      update[data.id] = data.attendance
    }

    updateAttendance({
      data: update,
      overwrite: false,
    })
  }, [lastMessage])

  return {
    isConnected: !!socket,
    attendance,
    updateAttendance,
  }
}
