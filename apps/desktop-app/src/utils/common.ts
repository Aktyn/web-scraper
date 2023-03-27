import path from 'path'

export const EXTERNAL_DIRECTORY_PATH = path.join(__dirname, '..', '..', 'external')

export const EXECUTABLE_DIRECTORY_PATH = path.normalize(
  process.env.PORTABLE_EXECUTABLE_DIR ||
    (process.env.APPIMAGE ? path.dirname(process.env.APPIMAGE) : path.resolve('.')),
)
