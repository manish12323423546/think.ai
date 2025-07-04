import { NextRequest } from 'next/server'

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

interface LogContext {
  userId?: string
  requestId?: string
  component?: string
  action?: string
  metadata?: Record<string, any>
}

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: LogContext
  error?: Error
  stack?: string
}

class Logger {
  private minLevel: LogLevel
  private isDevelopment: boolean

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
    this.minLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel
  }

  private formatLogEntry(entry: LogEntry): string {
    const { timestamp, level, message, context, error, stack } = entry
    
    const logData = {
      timestamp,
      level: LogLevel[level],
      message,
      ...(context && { context }),
      ...(error && { 
        error: {
          name: error.name,
          message: error.message,
          ...(this.isDevelopment && stack && { stack })
        }
      })
    }

    if (this.isDevelopment) {
      return JSON.stringify(logData, null, 2)
    }

    return JSON.stringify(logData)
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    if (!this.shouldLog(level)) return

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error,
      stack: error?.stack
    }

    const formattedLog = this.formatLogEntry(entry)

    if (this.isDevelopment) {
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(formattedLog)
          break
        case LogLevel.INFO:
          console.info(formattedLog)
          break
        case LogLevel.WARN:
          console.warn(formattedLog)
          break
        case LogLevel.ERROR:
        case LogLevel.FATAL:
          console.error(formattedLog)
          break
      }
    } else {
      console.log(formattedLog)
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context)
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context)
  }

  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context)
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, context, error)
  }

  fatal(message: string, error?: Error, context?: LogContext): void {
    this.log(LogLevel.FATAL, message, context, error)
  }

  withContext(baseContext: LogContext) {
    return {
      debug: (message: string, additionalContext?: LogContext) => 
        this.debug(message, { ...baseContext, ...additionalContext }),
      info: (message: string, additionalContext?: LogContext) => 
        this.info(message, { ...baseContext, ...additionalContext }),
      warn: (message: string, additionalContext?: LogContext) => 
        this.warn(message, { ...baseContext, ...additionalContext }),
      error: (message: string, error?: Error, additionalContext?: LogContext) => 
        this.error(message, error, { ...baseContext, ...additionalContext }),
      fatal: (message: string, error?: Error, additionalContext?: LogContext) => 
        this.fatal(message, error, { ...baseContext, ...additionalContext })
    }
  }
}

export const logger = new Logger()

export function createRequestLogger(req: NextRequest, requestId?: string) {
  return logger.withContext({
    requestId: requestId || crypto.randomUUID(),
    component: 'api',
    metadata: {
      method: req.method,
      url: req.url,
      userAgent: req.headers.get('user-agent') || undefined
    }
  })
}

export function createComponentLogger(component: string, userId?: string) {
  return logger.withContext({
    component,
    userId
  })
}

export function createActionLogger(action: string, userId?: string) {
  return logger.withContext({
    action,
    userId,
    component: 'server-action'
  })
}