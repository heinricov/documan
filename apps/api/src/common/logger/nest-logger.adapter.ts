import { LoggerService } from "@nestjs/common"
import type { Logger } from "@packages/logger"

/**
 * ============================================================
 *  NestJS → Pino Logger Adapter
 * ============================================================
 *
 * Bridge antara logger internal NestJS dan @packages/logger (pino).
 * Dipakai via `app.useLogger(new NestLoggerAdapter(logger))`.
 *
 * NestJS melewatkan context (nama class) sebagai argumen terakhir;
 * adapter menyetorkannya sebagai field `context` di log.
 */
export class NestLoggerAdapter implements LoggerService {
  constructor(private readonly logger: Logger) {}

  log(message: unknown, ...optionalParams: unknown[]) {
    this.logger.info(this.bindContext(optionalParams), this.toString(message))
  }

  error(message: unknown, ...optionalParams: unknown[]) {
    const [_, trace] = optionalParams
    const extra = this.bindContext(optionalParams)

    if (typeof trace === "string") {
      this.logger.error({ ...extra, stack: trace }, this.toString(message))
    } else {
      this.logger.error(extra, this.toString(message))
    }
  }

  warn(message: unknown, ...optionalParams: unknown[]) {
    this.logger.warn(this.bindContext(optionalParams), this.toString(message))
  }

  debug(message: unknown, ...optionalParams: unknown[]) {
    this.logger.debug(this.bindContext(optionalParams), this.toString(message))
  }

  verbose(message: unknown, ...optionalParams: unknown[]) {
    this.logger.trace(this.bindContext(optionalParams), this.toString(message))
  }

  fatal(message: unknown, ...optionalParams: unknown[]) {
    this.logger.fatal(this.bindContext(optionalParams), this.toString(message))
  }

  private bindContext(optionalParams: unknown[]): Record<string, unknown> {
    const context = optionalParams[optionalParams.length - 1]
    return typeof context === "string" ? { context } : {}
  }

  private toString(message: unknown): string {
    return typeof message === "string" ? message : String(message)
  }
}