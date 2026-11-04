import { useMutation } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { runOperation, type Operation } from '../api/operations'
export function useOperation(operation: Operation) {
  const controller = useRef<AbortController | null>(null)
  useEffect(() => () => controller.current?.abort(), [])
  return useMutation({
    mutationKey: ['live-api', operation.id],
    retry: false,
    gcTime: 0,
    mutationFn: (values: Record<string, string>) => {
      controller.current?.abort()
      controller.current = new AbortController()
      return runOperation(operation, values, controller.current.signal)
    },
  })
}
