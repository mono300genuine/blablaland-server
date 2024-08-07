import * as fs from 'fs'
import * as path from 'path'
import * as zlib from 'zlib'
import { promisify } from 'util'
import 'dotenv/config'

interface ResultEntry {
    type: number;
    fileId: number;
    bytes: number;
}

class ExternalFile {

    private readonly basePath: string
    private readonly fileNames: Record<string, string> = {
        skin: 'skin',
        fx: 'fx',
        map: 'map',
        smiley: 'SmileyPack',
    }
    private readonly typeNumbers: Record<string, number> = {
        skin: 1,
        fx: 2,
        map: 3,
        smiley: 4,
    }
    private readonly resultData: ResultEntry[] = [];

    constructor(basePath: string) {
        this.basePath = basePath;
    }

    private getFilePath(type: string, id: number): string {
        const fileName = this.fileNames[type] || type
        return path.join(this.basePath, type, id.toString(), `${fileName}.swf`)
    }


    private async getFileByte(filePath: string): Promise<number> {
        const inflateAsync = promisify(zlib.inflate)
        try {
            const swfData = await fs.promises.readFile(filePath)
            const buff = await inflateAsync(swfData.slice(8))

            const header = Buffer.from(swfData.slice(0, 8))
            const data = Buffer.concat([header, buff])

            let byte = 0
            for (let loc4 = 0; loc4 < data.length - 8; loc4 += 5) {
                byte += loc4 * data[loc4 + 8]
            }

            return this.uint(byte)
        } catch (err) {
            console.error(`Error reading or inflating ${filePath}: ${err}`)
            throw err
        }
    }

    public async processFiles(): Promise<void> {
        const types = ['skin', 'fx', 'map', 'smiley']

        for (const type of types) {
            const typePath = path.join(this.basePath, type)
            const subFolders = await fs.promises.readdir(typePath)

            for (const subFolder of subFolders) {
                const id = parseInt(subFolder, 10)
                if (!isNaN(id)) {
                    const filePath = this.getFilePath(type, id);
                    const fileSize = await this.getFileByte(filePath)

                    const resultEntry: ResultEntry = { type: this.typeNumbers[type], fileId: id, bytes: fileSize }
                    this.resultData.push(resultEntry)

                    console.log('\x1b[33m%s\x1b[0m', `Result for file ${filePath}:`, resultEntry)
                }
            }
        }

        const jsonData = JSON.stringify(this.resultData, null, 2);
        const outputDir = path.join('src', 'json');
        const outputPath = path.join(outputDir, 'externalFiles.json')
        try {
            await fs.promises.mkdir(outputDir, { recursive: true });
            await fs.promises.writeFile(outputPath, jsonData);
            console.info('\x1b[32m%s\x1b[0m', `Result data has been saved to ${outputPath}`)
        } catch (err) {
            console.error(`Error writing ${outputPath}: ${err}`)
            throw err
        }
    }

    private modulo(a: number, b: number): number {
        return a - Math.floor(a / b) * b
    }

    private uint(v: number): number {
        return this.modulo(parseInt(v.toString()), 2 ** 32)
    }
}

export default ExternalFile

if (process.env.DATA) {
    const externalFile = new ExternalFile(process.env.DATA)
    externalFile.processFiles().then()
}

