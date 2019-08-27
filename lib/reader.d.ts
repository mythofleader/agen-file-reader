interface AGenFileReaderConstructor {
    readonly filePath: string;
    readonly delimiter: string;
}
export declare class AGenFileReader {
    private readonly filePath;
    private readonly delimiter;
    private readonly delimiterCharCode;
    private readonly EMPTY;
    private readonly bufferSize;
    private readonly offset;
    private position;
    private fd?;
    constructor(params: AGenFileReaderConstructor);
    private openFile;
    private closeFile;
    private readLine;
    private calculateEndIdx;
    private addPosition;
    private isEmpty;
    read(): AsyncIterableIterator<string>;
}
export {};
