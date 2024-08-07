import { join } from 'path'

class FileLoader<T> {
    private readonly basePath: string

    constructor(basePath: string) {
        this.basePath = basePath
    }

    async loadAndExecute(fileName: string, ...args: any[]): Promise<void> {
        try {
            const filePath: string = join(this.basePath, fileName)
            const fileModule = await import(filePath)
            const fileInstance = new fileModule.default()

            if (typeof fileInstance.execute === 'function') {
                await fileInstance.execute(...args);
            } else {
                console.warn(`File ${fileName} does not have an 'execute' method.`)
            }
        } catch (error) {
            console.error(`Error loading or executing file ${fileName}\n${error}`)
        }
    }
}

export default FileLoader
