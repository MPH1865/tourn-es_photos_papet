import React, { useState, useEffect } from 'react'
import { Terminal, X, Trash2 } from 'lucide-react'

interface LogEntry {
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'success'
  message: string
}

interface LogViewerProps {
  isOpen: boolean
  onClose: () => void
}

const LogViewer: React.FC<LogViewerProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<LogEntry[]>([])

  useEffect(() => {
    if (!isOpen) return

    // Intercepter les console.log
    const originalLog = console.log
    const originalWarn = console.warn
    const originalError = console.error

    const addLog = (level: LogEntry['level'], ...args: any[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')
      
      setLogs(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        level,
        message
      }].slice(-100)) // Garder seulement les 100 derniers logs
    }

    console.log = (...args) => {
      originalLog(...args)
      addLog('info', ...args)
    }

    console.warn = (...args) => {
      originalWarn(...args)
      addLog('warn', ...args)
    }

    console.error = (...args) => {
      originalError(...args)
      addLog('error', ...args)
    }

    return () => {
      console.log = originalLog
      console.warn = originalWarn
      console.error = originalError
    }
  }, [isOpen])

  const clearLogs = () => {
    setLogs([])
  }

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error': return 'text-red-600'
      case 'warn': return 'text-yellow-600'
      case 'success': return 'text-green-600'
      default: return 'text-gray-700'
    }
  }

  const getLevelIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'error': return '❌'
      case 'warn': return '⚠️'
      case 'success': return '✅'
      default: return 'ℹ️'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-3/4 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Terminal className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold">Logs de débogage</h2>
            <span className="text-sm text-gray-500">({logs.length} entrées)</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={clearLogs}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Vider les logs"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-4 bg-gray-50">
          <div className="space-y-2 font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                Aucun log pour le moment. Les logs apparaîtront ici lors des opérations.
              </div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="flex items-start space-x-2 p-2 bg-white rounded border">
                  <span className="text-xs text-gray-400 min-w-[60px]">
                    {log.timestamp}
                  </span>
                  <span className="text-sm">
                    {getLevelIcon(log.level)}
                  </span>
                  <span className={`flex-1 ${getLevelColor(log.level)}`}>
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LogViewer
