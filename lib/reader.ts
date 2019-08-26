import fs from 'fs';
import util from 'util';

const openFile = util.promisify(fs.open);
const closeFile = util.promisify(fs.close);
const readFile = util.promisify(fs.read);

interface AGenFileReaderConstructor {
    readonly filePath: string;
    readonly delimiter: string;
}

export default class AGenFileReader {
    private readonly filePath: string;
    private readonly delimiter: string;
    private readonly delimiterCharCode: number;

    private readonly EMPTY: string = '';
    private readonly bufferSize = 1024;
    private readonly offset = 0;
    private position = 0;
    private fd?: number;

    constructor(params: AGenFileReaderConstructor) {
        this.filePath = params.filePath;
        this.delimiter = params.delimiter;
        this.delimiterCharCode = this.delimiter.charCodeAt(0);
    }

    private async openFile(): Promise<void> {
        this.fd = await openFile(this.filePath, 'r');
    }

    private async closeFile(): Promise<void> {
        if (this.fd) await closeFile(this.fd);
    }

    private async readLine(): Promise<string> {
        if (!this.fd) return this.EMPTY;

        const buffer = Buffer.alloc(this.bufferSize);
        const result = await readFile(this.fd, buffer, this.offset, this.bufferSize, this.position);
        if (result.bytesRead === 0) return this.EMPTY;

        const startIdx = 0;
        const endIdx = this.calculateEndIdx(result.buffer, result.bytesRead);

        this.addPosition(endIdx);
        return result.buffer.slice(startIdx, endIdx).toString();
    }

    private calculateEndIdx(buffer: Buffer, bytesRead: number): number {
        if (bytesRead < this.bufferSize) return bytesRead;

        const lastIdx = buffer.lastIndexOf(this.delimiterCharCode);
        return lastIdx === -1 ? bytesRead : lastIdx;
    }

    private addPosition(lastReadPosition: number): void {
        this.position += lastReadPosition;
    }

    private isEmpty(s: string): boolean {
        return this.EMPTY === s;
    }

    async *read(): AsyncIterableIterator<string> {
        try {
            await this.openFile();

            while (true) {
                const str = await this.readLine();
                const isEmpty = this.isEmpty(str);
                if (isEmpty) break;

                const results = str.split(this.delimiter);
                for (const result of results) {
                    yield result;
                }
            }
        } catch (e) {
            throw e;
        } finally {
            await this.closeFile();
        }
    }
}