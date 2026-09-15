import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common"
import type { Response } from "express"
import {
  AppError,
  ErrorCode,
  RateLimitError,
  ValidationError,
  errorResponse,
  errorResponseFromStatus,
  type ErrorResponse,
} from "@packages/core"
import {
  createLogger,
  serializeError,
} from "@packages/logger"

const logger = createLogger({ service: "api" })

function isAppError(value: unknown): value is AppError {
  return value instanceof AppError
}

function isValidationError(value: unknown): value is ValidationError {
  return value instanceof ValidationError
}

function isRateLimitError(value: unknown): value is RateLimitError {
  return value instanceof RateLimitError
}

/**
 * ============================================================
 *  Global HTTP Exception Filter
 * ============================================================
 *
 * Mengubah SEMUA error menjadi format @packages/core:
 *   { success: false, error: { code, message, details } }
 *
 * Aturan:
 *   - AppError (dari @packages/core)     → code & status dari class
 *   - HttpException (Nest built-in)      → status + pesan dari response
 *   - error lain                         → 500 INTERNAL_ERROR
 * Logging: 5xx → logger.error, 4xx → logger.warn.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    const { status, body } = this.toErrorResponse(exception)

    if (isRateLimitError(exception) && exception.retryAfter !== undefined) {
      response.setHeader("Retry-After", String(exception.retryAfter))
    }

    this.log(status, exception)

    response.status(status).json(body)
  }

  private toErrorResponse(exception: unknown): {
    status: number
    body: ErrorResponse
  } {
    if (isAppError(exception)) {
      const details = isValidationError(exception)
        ? exception.fieldErrors
          ? { fieldErrors: exception.fieldErrors }
          : exception.details
        : exception.details

      return {
        status: exception.status,
        body: errorResponse(
          exception.code,
          exception.message,
          details
        ),
      }
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus()
      const message = this.messageFromHttpException(exception)

      return {
        status,
        body:
          status === HttpStatus.INTERNAL_SERVER_ERROR
            ? errorResponse(ErrorCode.INTERNAL_ERROR, message)
            : errorResponseFromStatus(status, message),
      }
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      body: errorResponse(
        ErrorCode.INTERNAL_ERROR,
        "Internal server error"
      ),
    }
  }

  private messageFromHttpException(exception: HttpException): string {
    const response = exception.getResponse()

    if (typeof response === "string") {
      return response
    }

    if (
      typeof response === "object" &&
      response !== null &&
      "message" in response
    ) {
      const message = (response as { message: unknown }).message
      if (Array.isArray(message)) {
        return message.join(", ")
      }
      if (typeof message === "string") {
        return message
      }
    }

    return exception.message
  }

  private log(status: number, exception: unknown): void {
    const summary: Record<string, unknown> = {
      statusCode: status,
    }

    if (status >= 500) {
      logger.error(
        { ...summary, err: serializeError(exception) },
        "Unhandled error"
      )
    } else {
      logger.warn({ ...summary, err: serializeError(exception) }, "Request error")
    }
  }
}