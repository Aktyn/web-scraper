import fs from 'fs'
import path from 'path'

import { type ApiError, ErrorCode } from '@web-scraper/common'
// eslint-disable-next-line import/no-extraneous-dependencies
import { dialog, type OpenDialogOptions, type SaveDialogOptions } from 'electron'

import { successResponse } from '../api/internal/helpers'

/* istanbul ignore if */
export const EXTERNAL_DIRECTORY_PATH = path.join(__dirname, '..', '..', 'external')

/* istanbul ignore next */
export const EXECUTABLE_DIRECTORY_PATH = path.normalize(
  process.env.PORTABLE_EXECUTABLE_DIR ||
    (process.env.APPIMAGE ? path.dirname(process.env.APPIMAGE) : path.resolve('.')),
)

export async function saveAsFile(
  options: SaveDialogOptions,
  data: string | NodeJS.ArrayBufferView,
  encoding?: BufferEncoding,
): Promise<ApiError> {
  const file = await dialog.showSaveDialog({
    title: 'Select the File Path to save',
    buttonLabel: 'Save',
    ...options,
  })

  if (file.canceled || !file.filePath) {
    return { errorCode: ErrorCode.ACTION_CANCELLED_BY_USER } satisfies ApiError
  }

  fs.writeFileSync(file.filePath, data, encoding)
  return successResponse
}

export async function loadFile(
  options: OpenDialogOptions,
  encoding: BufferEncoding = 'utf-8',
): Promise<ApiError | { data: string }> {
  const file = await dialog.showOpenDialog({
    title: 'Select the File Path to load',
    buttonLabel: 'Load',
    properties: ['openFile', 'dontAddToRecent'],
    ...options,
  })

  if (file.canceled || !file.filePaths.length) {
    return { errorCode: ErrorCode.ACTION_CANCELLED_BY_USER } satisfies ApiError
  }

  return { data: fs.readFileSync(file.filePaths[0], encoding) }
}
