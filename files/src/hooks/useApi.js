import { useState, useCallback } from 'react'
import { useNotification } from '../components/NotificationCenter'

/**
 * Custom Hook للـ API Calls
 * 
 * مثال الاستخدام:
 * const { data, loading, error, execute } = useApi()
 * 
 * const fetchCommands = () => {
 *   execute(commandApi.getCommands(guildId))
 * }
 */
export const useApi = (options = {}) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const notify = useNotification()

  const execute = useCallback(
    async (apiCall, showNotification = true) => {
      setLoading(true)
      setError(null)

      try {
        const response = await apiCall
        const result = response.data

        setData(result)

        if (showNotification && options.successMessage) {
          notify.success(options.successMessage)
        }

        return result
      } catch (err) {
        const errorMessage = err.response?.data?.message || 
                            err.message || 
                            'حدث خطأ'

        setError(errorMessage)

        if (showNotification) {
          notify.error(errorMessage, options.errorTitle || 'خطأ')
        }

        throw err
      } finally {
        setLoading(false)
      }
    },
    [notify, options]
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    data,
    loading,
    error,
    execute,
    reset,
  }
}

/**
 * مثال كامل:
 */

/*
import { useApi } from '../hooks/useApi'
import { commandApi } from '../services/api'

function CommandsPage() {
  const guildId = 'your-guild-id'
  const { data: commands, loading, error, execute } = useApi({
    successMessage: 'تم تحميل الأوامر'
  })

  const handleFetchCommands = async () => {
    try {
      await execute(commandApi.getCommands(guildId))
    } catch (err) {
      console.error('Failed to fetch commands:', err)
    }
  }

  return (
    <div>
      <button onClick={handleFetchCommands}>
        {loading ? 'جاري التحميل...' : 'تحميل الأوامر'}
      </button>

      {error && <p className="text-red-500">{error}</p>}

      {commands && (
        <ul>
          {commands.map(cmd => (
            <li key={cmd.id}>{cmd.name}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
*/