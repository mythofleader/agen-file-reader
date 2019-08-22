import { promises as fsPromises } from 'fs';

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
        return this.tempStorage.join(' ');
    }
}

export default class AGenFileReader {
    private readonly filePath: string;
    private readonly delimiter: string;

    private readonly readConfig: ReadConfig;
    private readonly EMPTY_CHAR: string = '';
    private chunk?: Chunk;
    private fileHandle?: fsPromises.FileHandle;

    constructor(params: AGenFileReaderConstructor) {
        this.filePath = params.filePath;
        this.delimiter = params.delimiter;
        this.readConfig = {
            offset: 0, 
            position: 0,
            readCharLen: 1,
        };
    }

    private async openFile() {
        this.fileHandle = await fsPromises.open(this.filePath, 'r');
    }

    private async closeFile() {
        if (this.fileHandle) await this.fileHandle.close();
    }

    private async readChar(position: number): Promise<string> {
        const buffer = Buffer.alloc(this.readConfig.readCharLen);
        const result = await this.fileHandle!.read(buffer, this.readConfig.offset, this.readConfig.readCharLen, position);

        return this.isRead(result.bytesRead)
            ? result.buffer.toString()
            : this.EMPTY_CHAR;
    }

    private isRead(byteRead: number) {
        return this.readConfig.readCharLen === byteRead;
    }

    private isEmptyChar(c: string) {
        return this.EMPTY_CHAR === c;
    }

    private isDelimiter(c: string) {
        return this.delimiter === c;
    }

    private nextPosition() {
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