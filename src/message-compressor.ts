import { findArrayElementIndices } from "./find-array-element-indices.js";
import { isRecord, mapToRecord, setToArray } from "./util.js";

type StopHandle = () => void;

export function joinKeys(keys: string[]): string {
  return keys.join(",");
}

export class MessageCompressor {
  private ID_GENERAL_MESSAGE = 0;

  constructor(private timeoutEmitQueueInMs = 1) {}

  compress(message: Record<string, unknown>): string {
    const messageTypeId = this.getMessageTypeId(message);

    if (messageTypeId === this.ID_GENERAL_MESSAGE) {
      return this.compressGeneralMessage(message);
    }

    return this.compressRegisteredMessage(message, messageTypeId);
  }

  private compressGeneralMessage(message: Record<string, unknown>): string {
    const compressedEntries = Object.entries(message)
      .map(([key, value]) => {
        const registeredId = this.registeredGeneralKeysToIds.get(key);
        const compressedValue = isRecord(value)
          ? this.compressGeneralMessage(value as Record<string, unknown>)
          : JSON.stringify(value);

        if (typeof registeredId === "undefined") {
          const id = this.registerGeneralKey(key);
          return [id, compressedValue];
        }

        return [registeredId, compressedValue];
      })
      .flat(1);
    return `0[${compressedEntries.join(",")}]`;
  }

  private compressRegisteredMessage(
    message: Record<string, unknown>,
    id: number,
  ): string {
    const keysSet = this.registeredMessageTypes.get(id);

    if (typeof keysSet === "undefined") {
      throw new Error(
        "MessageCompressor::compressRegisteredMessage(message) => keySet is undefined?",
      );
    }

    const keys = [...keysSet];
    const transformedMessage = keys.map((key) => {
      const value = message[key];

      if (isRecord(value)) {
        return this.compressGeneralMessage(value as Record<string, unknown>);
      }

      return value;
    });

    return `${id}${JSON.stringify(transformedMessage)}`;
  }

  private REGEX_MATCH_MESSAGE_ID = /^(?<id>\d+)\[/;
  decompress(message: string): Record<string, unknown> | null {
    const match = this.REGEX_MATCH_MESSAGE_ID.exec(message);

    if (match === null) {
      return null;
    }

    const messageTypeIdString = match.groups?.id ?? "-1";
    const messageTypeId = Number(messageTypeIdString);

    if (messageTypeId === -1) {
      throw new Error(
        `MessageCompressor::decompress got unexpected messageTypeId == -1, start of message: ${message.substring(
          0,
          50,
        )}`,
      );
    }

    if (messageTypeId === this.ID_GENERAL_MESSAGE) {
      // substring to cut off initial "0"
      return this.decompressGeneralMessage(message.substring(1));
    }

    return this.decompressRegisteredMessage(
      message.substring(messageTypeIdString.length),
      messageTypeId,
    );
  }

  private decompressGeneralMessage(message: string): Record<string, unknown> {
    const indices = findArrayElementIndices(message);
    if (indices.length % 2 !== 0) {
      throw new Error(
        `MessageCompressor::decompressGeneralMessage(message) => expected indices to have even count, found uneven: ${indices.length}`,
      );
    }

    const decompressedMessage = [];
    for (let keyIndex = 0; keyIndex < indices.length - 1; keyIndex += 2) {
      const valueIndex = keyIndex + 1;

      const keyIndices = indices[keyIndex];
      const valueIndices = indices[valueIndex];

      if (typeof keyIndices === "undefined") {
        throw new Error(
          `MessageCompressor::decompressGeneralMessage(message) => couldn't find keyIndex == ${keyIndex} in indices`,
        );
      }
      if (typeof valueIndices === "undefined") {
        throw new Error(
          `MessageCompressor::decompressGeneralMessage(message) => couldn't find valueIndex == ${valueIndex} in indices`,
        );
      }

      const [keyStart, keyEnd] = keyIndices;
      const [valueStart, valueEnd] = valueIndices;

      const keyString = message.substring(keyStart, keyEnd);
      const keyId = Number(keyString);
      const key = this.registeredIdsToGeneralKeys.get(keyId);

      if (typeof key === "undefined") {
        throw new Error(
          `MessageCompressor::decompressGeneralMessage(message) => couldn't find key with ID ${keyId} in dictionary`,
        );
      }

      const value = message.substring(valueStart, valueEnd).trim();
      const decompressedValue = this.decompress(value);

      if (decompressedValue === null) {
        decompressedMessage.push([key, JSON.parse(value)]);
        continue;
      }

      decompressedMessage.push([key, decompressedValue]);
    }

    return Object.fromEntries(decompressedMessage) as Record<string, unknown>;
  }

  private decompressRegisteredMessage(
    message: string,
    id: number,
  ): Record<string, unknown> {
    const keysSet = this.registeredMessageTypes.get(id);

    if (typeof keysSet === "undefined") {
      throw new Error(
        `MessageCompressor::decompressRegisteredMessage(message, id) got unexpected id ${id}`,
      );
    }

    const indices = findArrayElementIndices(message);
    const values = indices.map(([start, end]) =>
      message.substring(start, end).trim(),
    );
    return Object.fromEntries(
      [...keysSet].map((key, index) => {
        const value = values[index];

        if (typeof value === "undefined") {
          throw new Error(
            `MessageCompressor::decompressRegisteredMessage(message, id) => couldn't find value with index ${index}`,
          );
        }

        const decompressedValue = this.decompress(value);

        if (decompressedValue === null) {
          return [key, JSON.parse(value)];
        }

        return [key, decompressedValue];
      }),
    ) as Record<string, unknown>;
  }

  private registeredMessageTypes: Map<number, Set<string>> = new Map();
  private registeredMessageTypeKeysToIndex: Map<string, number> = new Map();

  registerMessageType(messageTypeKeys: string[]): this {
    const id = this.getNextRegisteredMessageId();

    const sortedKeys = messageTypeKeys.slice().sort();
    const keysSet = new Set(sortedKeys);
    this.registeredMessageTypes.set(id, keysSet);

    const joinedKey = joinKeys(sortedKeys);
    this.registeredMessageTypeKeysToIndex.set(joinedKey, id);

    this.queueEmitSendDictionaryUpdatesToClients();

    return this;
  }

  getMessageTypeId(message: Record<string, unknown>): number {
    const keys = Object.keys(message);
    const sortedKeys = keys.slice().sort();
    const joinedKey = joinKeys(sortedKeys);

    const registeredMessageId =
      this.registeredMessageTypeKeysToIndex.get(joinedKey);
    if (typeof registeredMessageId !== "undefined") {
      return registeredMessageId;
    }

    return this.ID_GENERAL_MESSAGE;
  }

  private nextRegisteredMessageId = 1;
  private getNextRegisteredMessageId(): number {
    const nextId = this.nextRegisteredMessageId;
    this.nextRegisteredMessageId++;
    return nextId;
  }

  private registeredGeneralKeysToIds: Map<string, number> = new Map();
  private registeredIdsToGeneralKeys: Map<number, string> = new Map();

  private registerGeneralKey(key: string): number {
    const id = this.getNextGeneralKeyId();

    this.registeredGeneralKeysToIds.set(key, id);
    this.registeredIdsToGeneralKeys.set(id, key);

    this.queueEmitSendDictionaryUpdatesToClients();

    return id;
  }

  private nextGeneralKeyId = 0;
  private getNextGeneralKeyId(): number {
    const nextId = this.nextGeneralKeyId;
    this.nextGeneralKeyId++;
    return nextId;
  }

  handleDictionaryUpdates(
    dictionary: [Record<number, string[]>, Record<string, number>],
  ): void {
    const [registeredMessageTypes, registeredGeneralKeysToIds] = dictionary;

    const parsedRegisteredMessageTypes = Object.entries(
      registeredMessageTypes,
    ).map(([stringId, keys]): [number, Set<string>] => {
      const id = Number(stringId);
      const keysSet = new Set(keys);

      return [id, keysSet];
    });
    this.registeredMessageTypes = new Map(parsedRegisteredMessageTypes);
    this.registeredMessageTypeKeysToIndex = new Map();
    for (const [id, keysSet] of this.registeredMessageTypes.entries()) {
      const joinedKey = joinKeys([...keysSet]);
      this.registeredMessageTypeKeysToIndex.set(joinedKey, id);
    }

    this.registeredGeneralKeysToIds = new Map(
      Object.entries(registeredGeneralKeysToIds),
    );
    for (const [key, id] of this.registeredGeneralKeysToIds.entries()) {
      this.registeredIdsToGeneralKeys.set(id, key);
    }
  }

  private eventHandlers: {
    "send-dictionary-updates-to-clients": ((
      dictionary: [Record<string, string[]>, Record<string, number>],
    ) => void)[];
  } = {
    "send-dictionary-updates-to-clients": [],
  };

  on<
    K extends keyof typeof this.eventHandlers,
    T extends (typeof this.eventHandlers)[K][number],
  >(event: K, handler: T): StopHandle {
    this.eventHandlers[event].push(handler);

    return () => {
      const index = this.eventHandlers[event].indexOf(handler);

      if (index === -1) {
        return;
      }

      this.eventHandlers[event].splice(index, 1);
    };
  }

  private emit<
    K extends keyof typeof this.eventHandlers,
    T extends (typeof this.eventHandlers)[K][number],
  >(event: K, args: Parameters<T>) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    this.eventHandlers[event].forEach((handler) => handler(...(args as [any])));
  }

  private emitSendDictionaryUpdatesToClients(): void {
    const registeredMessageTypes: Record<string, string[]> = mapToRecord(
      this.registeredMessageTypes,
      setToArray,
    );
    const registeredGeneralKeysToIds: Record<string, number> = mapToRecord(
      this.registeredGeneralKeysToIds,
    );

    this.emit("send-dictionary-updates-to-clients", [
      [registeredMessageTypes, registeredGeneralKeysToIds],
    ]);
  }

  private timeoutEmit: ReturnType<typeof setTimeout> | null = null;
  private queueEmitSendDictionaryUpdatesToClients(): void {
    if (this.timeoutEmit !== null) {
      clearTimeout(this.timeoutEmit);
    }

    this.timeoutEmit = setTimeout(
      () => this.emitSendDictionaryUpdatesToClients(),
      this.timeoutEmitQueueInMs,
    );
  }
}
