# ts-websocket-compressor

This library compresses data sent over a WebSocket connection to improve throughput on devices that can't use compression for one reason or another.

## Installation

```shell
npm i ts-websocket-compressor
```

## Usage

This example assumes both compressors are running on the same machine, which is of course unrealistic.
If they are running on multiple machines (e.g. client -> server), you'll have to transfer the messages yourself.

```typescript
import { MessageCompressor } from "ts-websocket-compressor"

const serverCompressor = new MessageCompressor()
const clientCompressor = new MessageCompressor(false)

serverCompressor.on("send-dictionary-updates-to-clients", (dictionary) => clientCompressor.handleDictionaryUpdates(dictionary))

const compressedMessage = serverCompressor.compress({
    foo: true,
    bar: false,
    baz: {
        foo: "foo",
        bar: "bar",
        baz: "baz",
    },
})
console.log(compressedMessage)
// 0[0,true,1,false,2,0[0,"foo",1,"bar",2,"baz"]]

// have to sleep for at least 1 millisecond since dictionary updates are queued per tick
await sleep(1)

const uncompressedMessage = clientCompressor.decompress(compressedMessage)
console.log(uncompressedMessage)
// {
//    "foo": true,
//    "bar": false,
//    "baz": {
//      "foo": "foo",
//      "bar": "bar",
//      "baz": "baz"
//    }
```

### Connecting different compressors

The server compressors should emit a message to all clients which describe the compression dictionaries:

```typescript
import { MessageCompressor } from "ts-websocket-compressor"

const serverCompressor = new MessageCompressor()
const clientCompressor = new MessageCompressor()

serverCompressor.on("send-dictionary-updates-to-clients", (dictionary) => clientCompressor.handleDictionaryUpdates(dictionary))
```

The dictionary can be stringified/parsed as-is.

### Register message types

Without registered message types, the library will compress messages by replacing `objects with string keys` with `flat arrays with key IDs`:

```json5
{
  "foo": true,
  "bar": false,
  "baz": {
    "foo": "foo",
    "bar": "bar",
    "baz": "baz"
  }
}

// turns into:

0[0,true,1,false,2,0[0,"foo",1,"bar",2,"baz"]]
```

This format still has a bit of overhead since we need to store key IDs. If you register messages, you'll save this overhead:

```typescript
import { MessageCompressor } from "ts-websocket-compressor"

const serverCompressor = new MessageCompressor()
serverCompressor.registerMessageType(["foo", "bar", "baz"])

const message = {
    foo: true,
    bar: false,
    baz: {
        foo: "foo",
        bar: "bar",
        baz: "baz",
    },
}

console.log(serverCompressor.compress(message))
// 1[true,false,1["foo","bar","baz"]]
```

Each registered message will get a unique ID. General messages have ID 0.
