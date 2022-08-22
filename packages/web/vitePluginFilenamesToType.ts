import { promises as fs } from 'fs'
import { resolve } from 'path'
import { Plugin } from 'vite'

export type Conversion = {
  dictionary: string
  typeFile: string
}

const filenamesToType = (conversions: Conversion[]): Plugin => {
  const generateTypes = async (conversion: Conversion) => {
    const filenames = await fs.readdir(conversion.dictionary).catch(reason => {
      console.error(
        'vite-plugin-filenames-to-type: unable to read directory. ',
        reason
      )
      return []
    })
    if (!filenames.length) return

    const iconNames = filenames.map(
      fileName => `'${fileName.replace(/\.[^.]+$/, '')}'`
    )
    await fs.writeFile(
      conversion.typeFile,
      `export type IconNames = ${iconNames.join(' | ')}`
    )
  }

  const findConversion = (filePath: string) => {
    return conversions.find(conversion => {
      const path = resolve(__dirname, conversion.dictionary)
      return filePath.startsWith(path)
    })
  }

  return {
    name: 'vite-plugin-filenames-to-type',
    buildStart: async () => {
      conversions.forEach(conversion => generateTypes(conversion))
    },
    handleHotUpdate: context => {
      const conversion = findConversion(context.file)
      if (conversion) generateTypes(conversion)
    },
  }
}

export default filenamesToType
