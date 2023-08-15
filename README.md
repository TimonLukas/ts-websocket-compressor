# ts-websocket-compressor

This library compresses data sent over a WebSocket connection to improve throughput on devices that can't use compression for one reason or another.

## Usage

This example assumes both compressors are running on the same machine, which is of course unrealistic.
If they are running on multiple machines (e.g. client -> server), you'll have to transfer the messages yourself.

```typescript
import { MessageCompressor } from "ts-websocket-compressor"

const serverCompressor = new MessageCompressor()
const clientCompressor = new MessageCompressor()

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
