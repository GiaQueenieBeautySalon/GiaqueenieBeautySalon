// src/hooks/useRealtime.js
import { useEffect, useRef } from 'react'
import { supabase } from '../services/supabaseClient'

export const useRealtime = (table, callback, dependencies = []) => {
  const callbackRef = useRef(callback)
  
  // Update ref when callback changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    // Don't set up subscription if no table
    if (!table) return
    
    let isSubscribed = true
    
    const setupSubscription = () => {
      try {
        const subscription = supabase
          .channel(`${table}-changes-${Date.now()}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: table },
            (payload) => {
              if (isSubscribed && callbackRef.current) {
                console.log(`🔄 ${table} changed:`, payload.eventType)
                callbackRef.current(payload)
              }
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log(`✅ Subscribed to ${table} changes`)
            }
            if (status === 'CHANNEL_ERROR') {
              console.error(`❌ Error subscribing to ${table}`)
            }
          })

        return subscription
      } catch (error) {
        console.error(`Failed to setup ${table} subscription:`, error)
        return null
      }
    }

    const subscription = setupSubscription()

    return () => {
      isSubscribed = false
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [table, ...dependencies])
}