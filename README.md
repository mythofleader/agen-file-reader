# agen-file-reader
[![Build Status](https://travis-ci.com/mythofleader/agen-file-reader.svg?branch=master)](https://travis-ci.com/mythofleader/agen-file-reader)

agen-file-reader is a simple asynchronous file reader using generator.

## Installation
```
$ npm install --save agen-file-reader
```

## Usage
### Javascript
```javascript
const { AGenFileReader } = require("agen-file-reader");

async function main() {
  const filePath = "path you want to read a file";
  const delimiter = 'delimiter for content'; 
  const reader = new AGenFileReader({ filePath, delimiter });
  
  for await (const result of reader.read()) {
      // ... do your job
  }
}

main();
```

### Typescript
```typescript
import { AGenFileReader } from "agen-file-reader"

async function main() {
  const filePath = "path you want to read a file";
  const delimiter = 'delimiter for content'; 
  const reader = new AGenFileReader({ filePath, delimiter });
  
  for await (const result of reader.read()) {
      // ... do your job
  }
}

main();
```

## Test
```
$ npm test
```

## License
[MIT](./LICENSE)
