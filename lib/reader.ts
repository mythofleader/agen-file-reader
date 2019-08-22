import { open as openFile, close as closeFile, read as readFile } from 'fs';

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
    private fd: number | undefined;

    constructor(params: AGenFileReaderConstructor) {
        this.filePath = params.filePath;
        this.delimiter = params.delimiter;
        this.readConfig = {
            offset: 0, 
            position: 0,
            readCharLen: 1,
        };
    }

    private openFile(): Promise<void> {
        return new Promise((resolve, reject) => {
            openFile(this.filePath, 'r', (err: NodeJS.ErrnoException | null, fd: number) => {
                if (err) return reject(err);

                this.fd = fd;
                return resolve();
            });
        });
    }

    private closeFile(): Promise<void> {
        return new Promise((resolve, reject) => {
            closeFile(this.fd!, (err: NodeJS.ErrnoException | null) => {
                if (err) return reject(err);

                return resolve();
            });
        });
    }

    private readChar(position: number): Promise<string> {
        return new Promise((resolve, reject) => {
            const buffer = Buffer.alloc(this.readConfig.readCharLen);

            readFile(this.fd!, buffer, this.readConfig.offset, this.readConfig.readCharLen, position,
                (err: NodeJS.ErrnoException | null, byteRead: number, results: Buffer) => {
                    if (err) return reject(err);

                    const char = this.isRead(byteRead)
                        ? results.toString()
                        : this.EMPTY_CHAR;

                    return resolve(char);
            });
        });
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