// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.

/**
 * A {@linkcode TransformStream} that will only read & enqueue `size` amount of
 * bytes. This operation is chunk based and not BYOB based, and as such will
 * read more than needed.
 *
 * If `options.error` is set, then instead of terminating the stream,
 * an error will be thrown.
 *
 * @example
 * ```ts
 * import { LimitedBytesTransformStream } from "@std/streams/limited-bytes-transform-stream";
 *
 * const res = await fetch("https://example.com");
 * const parts = res.body!
 *   .pipeThrough(new LimitedBytesTransformStream(512 * 1024));
 * ```
 */
export class LimitedBytesTransformStream
  extends TransformStream<Uint8Array, Uint8Array> {
  #read = 0;

  /** Constructs a new instance. */
  constructor(size: number, options: { error?: boolean } = {}) {
    super({
      transform: (chunk, controller) => {
        if ((this.#read + chunk.byteLength) > size) {
          if (options.error) {
            throw new RangeError(`Exceeded byte size limit of '${size}'`);
          } else {
            controller.terminate();
          }
        } else {
          this.#read += chunk.byteLength;
          controller.enqueue(chunk);
        }
      },
    });
  }
}
