import fs from 'fs';
import util from 'util';

const openFile = util.promisify(fs.open);
const closeFile = util.promisify(fs.close);
const readFile = util.promisify(fs.read);

interface AGenFileReaderConstructor {
    readonly filePath: string;
    readonly delimiter: string;
}

interface ReadConfig {
    offset: number;
    readCharLen: number;
    position: number;
}

class Chunk {
    private tempStorage: Array<string> = [];

    init() {
        this.tempStorage = [];
    }

    save(c: string) {
        this.tempStorage.push(c);
    }

    flush(): string {
        return this.tempStorage.join('');
    }
}

export default class AGenFileReader {
    private readonly filePath: string;
    private readonly delimiter: string;

    private readonly readConfig: ReadConfig;
    private readonly EMPTY_CHAR: string = '';
    private chunk?: Chunk;
    private fd?: number;

    constructor(params: AGenFileReaderConstructor) {
        this.filePath = params.filePath;
        this.delimiter = params.delimiter;
        this.readConfig = {
            offset: 0,
            position: 0,
            readCharLen: 1,
        };
    }

    private async openFile(): Promise<void> {
        this.fd = await openFile(this.filePath, 'r');
    }

    private async closeFile(): Promise<void> {
        if (this.fd) await closeFile(this.fd);
    }

    private async readChar(position: number): Promise<string> {
        if (!this.fd) return this.EMPTY_CHAR;

        const buffer = Buffer.alloc(this.readConfig.readCharLen);
        const result = await readFile(this.fd, buffer, this.readConfig.offset, this.readConfig.readCharLen, position);

        return this.isRead(result.bytesRead)
            ? result.buffer.toString()
            : this.EMPTY_CHAR;
    }

    private isRead(byteRead: number): boolean {
        return this.readConfig.readCharLen === byteRead;
    }

    private isEmptyChar(c: string): boolean {
        return this.EMPTY_CHAR === c;
    }

    private isDelimiter(c: string): boolean {
        return this.delimiter === c;
    }

    private nextPosition(): void {
        this.readConfig.position++;
    }

    async *read(): AsyncIterableIterator<string> {
        try {
            await this.openFile();

            this.chunk = new Chunk();
            while (true) {
                const char = await this.readChar(this.readConfig.position);
                const isEmpty = this.isEmptyChar(char);
                const isDelimiter = this.isDelimiter(char);

                if (isEmpty || isDelimiter) {
                    yield this.chunk.flush();
                    if (isEmpty) break;

                    this.chunk.init();
                } else {
                    this.chunk.save(char);
                }

                this.nextPosition();
            }
        } catch (e) {
            throw e;
        } finally {
            await this.closeFile();
        }
    }
}