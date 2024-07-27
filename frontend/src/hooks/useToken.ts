import { useRouter } from 'next/router'

export const useToken = () => {
  return useRouter().query.token as string
}
