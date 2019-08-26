# agen-file-reader
agen-file-reader is a simple asynchronous file reader using generator.

[![Build Status](https://travis-ci.com/mythofleader/agen-file-reader.svg?branch=master)](https://travis-ci.com/mythofleader/agen-file-reader)

## Installation
```
$ npm install --save agen-file-reader
```

## Usage
```typescript
import AgenFileReader from "agen-file-reader"

const filePath = "path you want to read a file";
const delimiter = 'delimiter for content'; 
const reader = new AgenFileReader({ filePath, delimiter });

for await (const result of reader.read()) {
    // ... do your job
}
 
```

## Test
```
$ npm test
```

## License
[MIT](./LICENSE)
