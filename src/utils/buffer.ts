export {};
// const base64 = require('base64-js')
// const customInspectSymbol =
//     (typeof Symbol === 'function' && typeof Symbol['for'] === 'function') // eslint-disable-line dot-notation
//         ? Symbol['for']('nodejs.util.inspect.custom') // eslint-disable-line dot-notation
//         : null
//
// exports.INSPECT_MAX_BYTES = 50
//
// const K_MAX_LENGTH = 0x7fffffff
// exports.kMaxLength = K_MAX_LENGTH
//
// function createBuffer(length) {
//     if (length > K_MAX_LENGTH) {
//         throw new RangeError('The value "' + length + '" is invalid for option "size"')
//     }
//     // Return an augmented `Uint8Array` instance
//     const buf = new Uint8Array(length)
//     Object.setPrototypeOf(buf, Buffer.prototype)
//     return buf
// }
//
// /**
//  * The Buffer constructor returns instances of `Uint8Array` that have their
//  * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
//  * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
//  * and the `Uint8Array` methods. Square bracket notation works as expected -- it
//  * returns a single octet.
//  *
//  * The `Uint8Array` prototype remains unmodified.
//  */
//
// export class Buffer extends Uint8Array {
//     private dataView: DataView;
//
//     private constructor(size: number) {
//         super(size);
//         this.dataView = new DataView(this);
//     }
//
//     static from(array: number[]): Buffer;
//     static from(arrayBuffer: ArrayBuffer | SharedArrayBuffer, byteOffset?: number, length?: number): Buffer
//     static from(buffer: Uint8Array): Buffer;
//     static from(object: { [Symbol.toPrimitive](): unknown } | { valueOf(): unknown }, offset?: number, length?: number): Buffer;
//     static from(object: { [Symbol.toPrimitive](): unknown } | { valueOf(): unknown }, encoding?: string, length?: number): Buffer;
//     static from(string: string, encoding?: string): Buffer;
//     static from(value: number[] | Uint8Array | ArrayBuffer | SharedArrayBuffer | string | { [Symbol.toPrimitive](): unknown } | { valueOf(): unknown }, encodingOrOffset?: number | string, length?: number) {
//         if (typeof value === 'string') {
//             return fromString(value, encodingOrOffset)
//         }
//
//         if (ArrayBuffer.isView(value)) {
//             return fromArrayView(value)
//         }
//
//         if (value instanceof ArrayBuffer || value instanceof SharedArrayBuffer) {
//             return fromArrayBuffer(value, encodingOrOffset, length)
//         }
//
//         const valueOf = value.valueOf()
//         if (valueOf != null && valueOf !== value) {
//             return Buffer.from(valueOf, encodingOrOffset, length)
//         }
//
//         const b = fromObject(value)
//         if (b) return b
//
//         if (typeof value[Symbol.toPrimitive] === 'function') {
//             return Buffer.from(value[Symbol.toPrimitive]('string'), encodingOrOffset, length)
//         }
//
//         throw new TypeError(
//             'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
//             'or Array-like Object. Received type ' + (typeof value)
//         )
//     }
//
//     static alloc(size: number): Buffer
//     static alloc(size: number, fill: number | Uint8Array): Buffer
//     static alloc(size: number, fill: string, encoding: string): Buffer
//     static alloc(size: number, fill?: string | Uint8Array | number, encoding?: string) {
//         const buffer = new this(size);
//         if (fill !== undefined) {
//             typeof encoding === 'string'
//                 ? buffer.fill(fill, encoding)
//                 : buffer.fill(fill)
//         }
//         return buffer;
//     }
//
//     static allocUnsafe(size: number) {
//         return new this(size);
//     }
//
//     static allocUnsafeSlow(size: number) {
//         return new this(size);
//     }
//
//     static isBuffer(obj: unknown) {
//         return obj instanceof Buffer;
//     }
//
//     static compare(buf1: Uint8Array, buf2: Uint8Array) {
//         if (!(buf1 instanceof Uint8Array && buf2 instanceof Uint8Array)) {
//             throw new TypeError(
//                 'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
//             )
//         }
//
//         if (buf1 === buf2) return 0;
//
//         for (let i = 0; i < Math.min(buf1.length, buf2.length); ++i) {
//             if (buf1[i] !== buf2[i]) {
//                 return Math.sign(buf1[i] - buf2[i]);
//             }
//         }
//
//         return Math.sign(buf1.length - buf2.length);
//     }
//
//     static isEncoding(encoding: string) {
//         switch (encoding.toLowerCase()) {
//             case 'utf8':
//             case 'utf-8':
//                 return true
//             default:
//                 return false
//         }
//     }
//
//     static concat(list: Uint8Array[], length = list.reduce((v, c) => v + c.length, 0)) {
//         const buffer = Buffer.allocUnsafe(length)
//         let pos = 0
//         for (const buf of list) {
//             buffer.set(buf, pos);
//             pos += buf.length
//         }
//         return buffer
//     }
//
//     swap16() {
//         if (this.length % 2) {
//             throw new RangeError('Buffer size must be a multiple of 16-bits')
//         }
//         for (let i = 0; i < this.length; i += 2) {
//             [this[i], this[i + 1]] = [this[i + 1], this[i]];
//         }
//         return this
//     }
//
//     swap32() {
//         if (this.length % 4) {
//             throw new RangeError('Buffer size must be a multiple of 32-bits')
//         }
//         for (let i = 0; i < this.length; i += 4) {
//             [this[i], this[i + 3]] = [this[i + 3], this[i]];
//             [this[i + 1], this[i + 2]] = [this[i + 2], this[i + 1]];
//         }
//         return this
//     }
//
//     swap64() {
//         if (this.length % 8) {
//             throw new RangeError('Buffer size must be a multiple of 64-bits')
//         }
//         for (let i = 0; i < this.length; i += 8) {
//             [this[i], this[i + 7]] = [this[i + 7], this[i]];
//             [this[i + 1], this[i + 6]] = [this[i + 6], this[i + 1]];
//             [this[i + 2], this[i + 5]] = [this[i + 5], this[i + 2]];
//             [this[i + 3], this[i + 4]] = [this[i + 4], this[i + 3]];
//         }
//         return this
//     }
//
//     toString(encoding = 'utf8', start = 0, end = this.length) {
//         const buffer = super.subarray(start, end);
//         switch (encoding.toLowerCase()) {
//             case 'hex':
//                 return [...buffer].map((i) => i.toString(16).padStart(2, '0')).join('');
//
//             case 'ascii':
//                 return new TextDecoder('ascii').decode(buffer.map((i) => i & 0x7F));
//
//             case 'latin1':
//             case 'binary':
//                 return [...buffer].map((i) => String.fromCharCode(i)).join('')
//
//             case 'base64':
//                 return btoa([...buffer].map((i) => String.fromCharCode(i)).join(''));
//
//             case 'ucs2':
//             case 'utf16le':
//                 return new TextDecoder('utf-16le').decode(buffer);
//
//             default:
//                 return new TextDecoder(encoding).decode(buffer);
//         }
//     }
//
//     toLocaleString() {
//         return this.toString();
//     }
//
//     equals(b: Uint8Array) {
//         return Buffer.compare(this, b) === 0;
//     }
//
//     inspect() {
//         const max = exports.INSPECT_MAX_BYTES
//         let str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
//         if (this.length > max) str += ' ... '
//         return `<Buffer ${str}>`
//     }
//
//     compare(target: Uint8Array, start = 0, end = target.length, thisStart = 0, thisEnd = this.length) {
//         if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
//             throw new RangeError('out of range index')
//         }
//
//         if (thisStart >= thisEnd && start >= end) {
//             return 0
//         }
//         if (thisStart >= thisEnd) {
//             return -1
//         }
//         if (start >= end) {
//             return 1
//         }
//
//         if (this === target) return 0
//
//         let x = thisEnd - thisStart
//         let y = end - start
//
//         for (let i = thisStart, j = start; i < thisEnd && j < end; i++, j++) {
//             if (this[i] !== target[i]) {
//                 return Math.sign(this[i] - target[i]);
//             }
//         }
//
//         return Math.sign(x - y);
//     }
//
//     includes(val: string | number | Buffer, byteOffset?: number, encoding?: BufferEncoding) {
//         return this.indexOf(val, byteOffset, encoding) !== -1
//     }
//
//     indexOf(val: string | number | Buffer, byteOffset?: number, encoding?: BufferEncoding) {
//         return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
//     }
//
//     lastIndexOf(val: string | number | Buffer, byteOffset?: number, encoding?: BufferEncoding) {
//         return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
//     }
//
//     write(string, offset, length, encoding = 'utf8') {
//         // Buffer#write(string)
//         if (offset === undefined) {
//             encoding = 'utf8'
//             length = this.length
//             offset = 0
//             // Buffer#write(string, encoding)
//         } else if (length === undefined && typeof offset === 'string') {
//             encoding = offset
//             length = this.length
//             offset = 0
//             // Buffer#write(string, offset[, length][, encoding])
//         } else if (isFinite(offset)) {
//             offset = offset >>> 0
//             if (isFinite(length)) {
//                 length = length >>> 0
//                 if (encoding === undefined) encoding = 'utf8'
//             } else {
//                 encoding = length
//                 length = undefined
//             }
//         } else {
//             throw new Error(
//                 'Buffer.write(string, encoding, offset[, length]) is no longer supported'
//             )
//         }
//
//         const remaining = this.length - offset
//         if (length === undefined || length > remaining) length = remaining
//
//         if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
//             throw new RangeError('Attempt to write outside buffer bounds')
//         }
//
//         if (!encoding) encoding = 'utf8'
//
//         let loweredCase = false
//         for (; ;) {
//             switch (encoding) {
//                 case 'hex':
//                     return hexWrite(this, string, offset, length)
//
//                 case 'utf8':
//                 case 'utf-8':
//                     return utf8Write(this, string, offset, length)
//
//                 case 'ascii':
//                 case 'latin1':
//                 case 'binary':
//                     return asciiWrite(this, string, offset, length)
//
//                 case 'base64':
//                     // Warning: maxLength not taken into account in base64Write
//                     return base64Write(this, string, offset, length)
//
//                 case 'ucs2':
//                 case 'ucs-2':
//                 case 'utf16le':
//                 case 'utf-16le':
//                     return ucs2Write(this, string, offset, length)
//
//                 default:
//                     if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
//                     encoding = ('' + encoding).toLowerCase()
//                     loweredCase = true
//             }
//         }
//     }
//
//     toJSON() {
//         return {
//             type: 'Buffer',
//             data: [...this]
//         }
//     }
//
//     slice(start: number, end: number) {
//         return super.subarray(start, end);
//     }
//
//     readUIntLE(offset: number, byteLength: number) {
//         offset = offset >>> 0
//         byteLength = byteLength >>> 0
//         checkOffset(offset, byteLength, this.length)
//
//         let val = this[offset]
//         let mul = 1
//         let i = 0
//         while (++i < byteLength && (mul *= 0x100)) {
//             val += this[offset + i] * mul
//         }
//
//         return val
//     }
//
//     readUIntBE(offset: number, byteLength: number) {
//         offset = offset >>> 0
//         byteLength = byteLength >>> 0
//         checkOffset(offset, byteLength, this.length)
//
//         let val = this[offset + --byteLength]
//         let mul = 1
//         while (byteLength > 0 && (mul *= 0x100)) {
//             val += this[offset + --byteLength] * mul
//         }
//         return val
//     }
//
//     readUInt8(offset = 0) {
//         return this.dataView.getUint8(offset);
//     }
//
//     readUInt16LE(offset = 0) {
//         return this.dataView.getUint16(offset, true);
//     }
//
//     readUInt16BE(offset = 0) {
//         return this.dataView.getUint16(offset, false);
//     }
//
//     readUInt32LE(offset = 0) {
//         return this.dataView.getUint32(offset, true);
//     }
//
//     readUInt32BE(offset = 0) {
//         return this.dataView.getUint32(offset, false);
//     }
//
//     readBigUInt64LE(offset = 0) {
//         return this.dataView.getBigUint64(offset, true);
//     }
//
//     readBigUInt64BE(offset = 0) {
//         return this.dataView.getBigUint64(offset, false);
//     }
//
//     readIntLE(offset: number, byteLength: number) {
//         offset = offset >>> 0
//         byteLength = byteLength >>> 0
//         checkOffset(offset, byteLength, this.length)
//
//         let val = this[offset]
//         let mul = 1
//         let i = 0
//         while (++i < byteLength && (mul *= 0x100)) {
//             val += this[offset + i] * mul
//         }
//         mul *= 0x80
//
//         if (val >= mul) val -= Math.pow(2, 8 * byteLength)
//
//         return val
//     }
//
//     readIntBE(offset: number, byteLength: number) {
//         offset = offset >>> 0
//         byteLength = byteLength >>> 0
//         checkOffset(offset, byteLength, this.length)
//
//         let i = byteLength
//         let mul = 1
//         let val = this[offset + --i]
//         while (i > 0 && (mul *= 0x100)) {
//             val += this[offset + --i] * mul
//         }
//         mul *= 0x80
//
//         if (val >= mul) val -= Math.pow(2, 8 * byteLength)
//
//         return val
//     }
//
//     readInt8(offset = 0) {
//         return this.dataView.getInt8(offset);
//     }
//
//     readInt16LE(offset = 0) {
//         return this.dataView.getInt16(offset, true);
//     }
//
//     readInt16BE(offset = 0) {
//         return this.dataView.getInt16(offset, false);
//     }
//
//     readInt32LE(offset = 0) {
//         return this.dataView.getInt32(offset, true);
//     }
//
//     readInt32BE(offset = 0) {
//         return this.dataView.getInt32(offset, false);
//     }
//
//     readBigInt64LE(offset = 0) {
//         return this.dataView.getBigInt64(offset, true);
//     }
//
//     readBigInt64BE(offset = 0) {
//         return this.dataView.getBigInt64(offset, false);
//     }
//
//     readFloatLE(offset = 0) {
//         return this.dataView.getFloat32(offset, true);
//     }
//
//     readFloatBE(offset = 0) {
//         return this.dataView.getFloat32(offset, false);
//     }
//
//     readDoubleLE(offset = 0) {
//         return this.dataView.getFloat64(offset, true);
//     }
//
//     readDoubleBE(offset = 0) {
//         return this.dataView.getFloat64(offset, false);
//     }
//
//     writeUIntLE(value: number, offset: number, byteLength: number) {
//         value = +value
//         offset = offset >>> 0
//         byteLength = byteLength >>> 0
//         {
//             const maxBytes = Math.pow(2, 8 * byteLength) - 1
//             checkInt(this, value, offset, byteLength, maxBytes, 0)
//         }
//
//         let mul = 1
//         let i = 0
//         this[offset] = value & 0xFF
//         while (++i < byteLength && (mul *= 0x100)) {
//             this[offset + i] = (value / mul) & 0xFF
//         }
//
//         return offset + byteLength
//     }
//
//     writeUIntBE(value: number, offset: number, byteLength: number) {
//         value = +value
//         offset = offset >>> 0
//         byteLength = byteLength >>> 0
//         {
//             const maxBytes = Math.pow(2, 8 * byteLength) - 1
//             checkInt(this, value, offset, byteLength, maxBytes, 0)
//         }
//
//         let i = byteLength - 1
//         let mul = 1
//         this[offset + i] = value & 0xFF
//         while (--i >= 0 && (mul *= 0x100)) {
//             this[offset + i] = (value / mul) & 0xFF
//         }
//
//         return offset + byteLength
//     }
//
//     writeUInt8(value: number, offset = 0) {
//         return this.dataView.setUint8(offset, value);
//     }
//
//     writeUInt16LE(value: number, offset = 0) {
//         return this.dataView.setUint16(offset, value, true);
//     }
//
//     writeUInt16BE(value: number, offset = 0) {
//         return this.dataView.setUint16(offset, value, false);
//     }
//
//     writeUInt32LE(value: number, offset = 0) {
//         return this.dataView.setUint32(offset, value, true);
//     }
//
//     writeUInt32BE(value: number, offset = 0) {
//         return this.dataView.setUint32(offset, value, false);
//     }
//
//     writeBigUInt64LE(value: bigint, offset = 0) {
//         return this.dataView.setBigUint64(offset, value, true);
//     }
//
//     writeBigUInt64BE(value: bigint, offset = 0) {
//         return this.dataView.setBigUint64(offset, value, false);
//     }
//
//     writeIntLE(value: number, offset: number, byteLength: number) {
//         value = +value
//         offset = offset >>> 0
//         {
//             const limit = Math.pow(2, (8 * byteLength) - 1)
//
//             checkInt(this, value, offset, byteLength, limit - 1, -limit)
//         }
//
//         let i = 0
//         let mul = 1
//         let sub = 0
//         this[offset] = value & 0xFF
//         while (++i < byteLength && (mul *= 0x100)) {
//             if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
//                 sub = 1
//             }
//             this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
//         }
//
//         return offset + byteLength
//     }
//
//     writeIntBE(value: number, offset: number, byteLength: number) {
//         value = +value
//         offset = offset >>> 0
//         {
//             const limit = Math.pow(2, (8 * byteLength) - 1)
//
//             checkInt(this, value, offset, byteLength, limit - 1, -limit)
//         }
//
//         let i = byteLength - 1
//         let mul = 1
//         let sub = 0
//         this[offset + i] = value & 0xFF
//         while (--i >= 0 && (mul *= 0x100)) {
//             if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
//                 sub = 1
//             }
//             this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
//         }
//
//         return offset + byteLength
//     }
//
//     writeInt8(value: number, offset = 0) {
//         return this.dataView.setInt8(offset, value);
//     }
//
//     writeInt16LE(value: number, offset = 0) {
//         return this.dataView.setInt16(offset, value, true);
//     }
//
//     writeInt16BE(value: number, offset = 0) {
//         return this.dataView.setInt16(offset, value, false);
//     }
//
//     writeInt32LE(value: number, offset = 0) {
//         return this.dataView.setInt32(offset, value, true);
//     }
//
//     writeInt32BE(value: number, offset = 0) {
//         return this.dataView.setInt32(offset, value, false);
//     }
//
//     writeBigInt64LE(value: bigint, offset = 0) {
//         return this.dataView.setBigInt64(offset, value, true);
//     }
//
//     writeBigInt64BE(value: bigint, offset = 0) {
//         return this.dataView.setBigInt64(offset, value, false);
//     }
//
//     writeFloatLE(value: number, offset = 0) {
//         return this.dataView.setFloat32(offset, value, true);
//     }
//
//     writeFloatBE(value: number, offset = 0) {
//         return this.dataView.setFloat32(offset, value, false);
//     }
//
//     writeDoubleLE(value: number, offset = 0) {
//         return this.dataView.setFloat64(offset, value, true);
//     }
//
//     writeDoubleBE(value: number, offset = 0) {
//         return this.dataView.setFloat64(offset, value, false);
//     }
//
//     copy(target: Uint8Array, targetStart = 0, start = 0, end = this.length) {
//         // Fatal error conditions
//         if (targetStart < 0) {
//             throw new RangeError('targetStart out of bounds')
//         }
//         if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
//         if (end < 0) throw new RangeError('sourceEnd out of bounds')
//
//         // Are we oob?
//         if (end > this.length) end = this.length
//         if (target.length - targetStart < end - start) {
//             end = target.length - targetStart + start
//         }
//
//         const len = end - start
//
//         target.set(this.subarray(start, end), targetStart);
//
//         return len
//     }
//
//     fill(val: string | Uint8Array | number, start?: number, end?: number, encoding?: BufferEncoding) {
//         // Handle string cases:
//         if (typeof val === 'string') {
//             if (typeof start === 'string') {
//                 encoding = start
//                 start = 0
//                 end = this.length
//             } else if (typeof end === 'string') {
//                 encoding = end
//                 end = this.length
//             }
//             if (encoding !== undefined && typeof encoding !== 'string') {
//                 throw new TypeError('encoding must be a string')
//             }
//             if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
//                 throw new TypeError('Unknown encoding: ' + encoding)
//             }
//             if (val.length === 1) {
//                 const code = val.charCodeAt(0)
//                 if ((encoding === 'utf8' && code < 128) ||
//                     encoding === 'latin1') {
//                     // Fast path: If `val` fits into a single byte, use that numeric value.
//                     val = code
//                 }
//             }
//         } else if (typeof val === 'number') {
//             val = val & 255
//         } else if (typeof val === 'boolean') {
//             val = Number(val)
//         }
//
//         // Invalid ranges are not set to a default, so can range check early.
//         if (start < 0 || this.length < start || this.length < end) {
//             throw new RangeError('Out of range index')
//         }
//
//         if (end <= start) {
//             return this
//         }
//
//         start = start >>> 0
//         end = end === undefined ? this.length : end >>> 0
//
//         if (!val) val = 0
//
//         let i
//         if (typeof val === 'number') {
//             for (i = start; i < end; ++i) {
//                 this[i] = val
//             }
//         } else {
//             const bytes = Buffer.isBuffer(val)
//                 ? val
//                 : Buffer.from(val, encoding)
//             const len = bytes.length
//             if (len === 0) {
//                 throw new TypeError('The value "' + val +
//                     '" is invalid for argument "value"')
//             }
//             for (i = 0; i < end - start; ++i) {
//                 this[i + start] = bytes[i % len]
//             }
//         }
//
//         return this
//     }
// }
//
// function fromString(string, encoding) {
//     if (typeof encoding !== 'string' || encoding === '') {
//         encoding = 'utf8'
//     }
//
//     if (!Buffer.isEncoding(encoding)) {
//         throw new TypeError('Unknown encoding: ' + encoding)
//     }
//
//     const length = byteLength(string, encoding) | 0
//     let buf = createBuffer(length)
//
//     const actual = buf.write(string, encoding)
//
//     if (actual !== length) {
//         // Writing a hex string, for example, that contains invalid characters will
//         // cause everything after the first invalid character to be ignored. (e.g.
//         // 'abxxcd' will be treated as 'ab')
//         buf = buf.slice(0, actual)
//     }
//
//     return buf
// }
//
// function fromArrayLike(array) {
//     const length = array.length < 0 ? 0 : checked(array.length) | 0
//     const buf = createBuffer(length)
//     for (let i = 0; i < length; i += 1) {
//         buf[i] = array[i] & 255
//     }
//     return buf
// }
//
// function fromArrayView(arrayView) {
//     if (isInstance(arrayView, Uint8Array)) {
//         const copy = new Uint8Array(arrayView)
//         return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength)
//     }
//     return fromArrayLike(arrayView)
// }
//
// function fromArrayBuffer(array, byteOffset, length) {
//     if (byteOffset < 0 || array.byteLength < byteOffset) {
//         throw new RangeError('"offset" is outside of buffer bounds')
//     }
//
//     if (array.byteLength < byteOffset + (length || 0)) {
//         throw new RangeError('"length" is outside of buffer bounds')
//     }
//
//     let buf
//     if (byteOffset === undefined && length === undefined) {
//         buf = new Uint8Array(array)
//     } else if (length === undefined) {
//         buf = new Uint8Array(array, byteOffset)
//     } else {
//         buf = new Uint8Array(array, byteOffset, length)
//     }
//
//     // Return an augmented `Uint8Array` instance
//     Object.setPrototypeOf(buf, Buffer.prototype)
//
//     return buf
// }
//
// function fromObject(obj) {
//     if (Buffer.isBuffer(obj)) {
//         const len = checked(obj.length) | 0
//         const buf = createBuffer(len)
//
//         if (buf.length === 0) {
//             return buf
//         }
//
//         obj.copy(buf, 0, 0, len)
//         return buf
//     }
//
//     if (obj.length !== undefined) {
//         if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
//             return createBuffer(0)
//         }
//         return fromArrayLike(obj)
//     }
//
//     if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
//         return fromArrayLike(obj.data)
//     }
// }
//
// function checked(length) {
//     // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
//     // length is NaN (which is otherwise coerced to zero.)
//     if (length >= K_MAX_LENGTH) {
//         throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
//             'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
//     }
//     return length | 0
// }
//
// function byteLength(string, encoding) {
//     if (Buffer.isBuffer(string)) {
//         return string.length
//     }
//     if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
//         return string.byteLength
//     }
//     if (typeof string !== 'string') {
//         throw new TypeError(
//             'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
//             'Received type ' + typeof string
//         )
//     }
//
//     const len = string.length
//     const mustMatch = (arguments.length > 2 && arguments[2] === true)
//     if (!mustMatch && len === 0) return 0
//
//     // Use a for loop to avoid recursion
//     let loweredCase = false
//     for (; ;) {
//         switch (encoding) {
//             case 'ascii':
//             case 'latin1':
//             case 'binary':
//                 return len
//             case 'utf8':
//             case 'utf-8':
//                 return utf8ToBytes(string).length
//             case 'ucs2':
//             case 'ucs-2':
//             case 'utf16le':
//             case 'utf-16le':
//                 return len * 2
//             case 'hex':
//                 return len >>> 1
//             case 'base64':
//                 return base64ToBytes(string).length
//             default:
//                 if (loweredCase) {
//                     return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
//                 }
//                 encoding = ('' + encoding).toLowerCase()
//                 loweredCase = true
//         }
//     }
// }
//
// Buffer.byteLength = byteLength
//
// if (customInspectSymbol) {
//     Buffer.prototype[customInspectSymbol] = Buffer.prototype.inspect
// }
//
// // Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// // OR the last index of `val` in `buffer` at offset <= `byteOffset`.
// //
// // Arguments:
// // - buffer - a Buffer to search
// // - val - a string, Buffer, or number
// // - byteOffset - an index into `buffer`; will be clamped to an int32
// // - encoding - an optional encoding, relevant is val is a string
// // - dir - true for indexOf, false for lastIndexOf
// function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
//     // Empty buffer means no match
//     if (buffer.length === 0) return -1
//
//     // Normalize byteOffset
//     if (typeof byteOffset === 'string') {
//         encoding = byteOffset
//         byteOffset = 0
//     } else if (byteOffset > 0x7fffffff) {
//         byteOffset = 0x7fffffff
//     } else if (byteOffset < -0x80000000) {
//         byteOffset = -0x80000000
//     }
//     byteOffset = +byteOffset // Coerce to Number.
//     if (numberIsNaN(byteOffset)) {
//         // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
//         byteOffset = dir ? 0 : (buffer.length - 1)
//     }
//
//     // Normalize byteOffset: negative offsets start from the end of the buffer
//     if (byteOffset < 0) byteOffset = buffer.length + byteOffset
//     if (byteOffset >= buffer.length) {
//         if (dir) return -1
//         else byteOffset = buffer.length - 1
//     } else if (byteOffset < 0) {
//         if (dir) byteOffset = 0
//         else return -1
//     }
//
//     // Normalize val
//     if (typeof val === 'string') {
//         val = Buffer.from(val, encoding)
//     }
//
//     // Finally, search either indexOf (if dir is true) or lastIndexOf
//     if (Buffer.isBuffer(val)) {
//         // Special case: looking for empty string/buffer always fails
//         if (val.length === 0) {
//             return -1
//         }
//         return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
//     } else if (typeof val === 'number') {
//         val = val & 0xFF // Search for a byte value [0-255]
//         if (typeof Uint8Array.prototype.indexOf === 'function') {
//             if (dir) {
//                 return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
//             } else {
//                 return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
//             }
//         }
//         return arrayIndexOf(buffer, [val], byteOffset, encoding, dir)
//     }
//
//     throw new TypeError('val must be string, number or Buffer')
// }
//
// function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
//     let indexSize = 1
//     let arrLength = arr.length
//     let valLength = val.length
//
//     if (encoding !== undefined) {
//         encoding = String(encoding).toLowerCase()
//         if (encoding === 'ucs2' || encoding === 'ucs-2' ||
//             encoding === 'utf16le' || encoding === 'utf-16le') {
//             if (arr.length < 2 || val.length < 2) {
//                 return -1
//             }
//             indexSize = 2
//             arrLength /= 2
//             valLength /= 2
//             byteOffset /= 2
//         }
//     }
//
//     function read(buf, i) {
//         if (indexSize === 1) {
//             return buf[i]
//         } else {
//             return buf.readUInt16BE(i * indexSize)
//         }
//     }
//
//     let i
//     if (dir) {
//         let foundIndex = -1
//         for (i = byteOffset; i < arrLength; i++) {
//             if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
//                 if (foundIndex === -1) foundIndex = i
//                 if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
//             } else {
//                 if (foundIndex !== -1) i -= i - foundIndex
//                 foundIndex = -1
//             }
//         }
//     } else {
//         if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
//         for (i = byteOffset; i >= 0; i--) {
//             let found = true
//             for (let j = 0; j < valLength; j++) {
//                 if (read(arr, i + j) !== read(val, j)) {
//                     found = false
//                     break
//                 }
//             }
//             if (found) return i
//         }
//     }
//
//     return -1
// }
//
// function hexWrite(buf, string, offset, length) {
//     offset = Number(offset) || 0
//     const remaining = buf.length - offset
//     if (!length) {
//         length = remaining
//     } else {
//         length = Number(length)
//         if (length > remaining) {
//             length = remaining
//         }
//     }
//
//     const strLen = string.length
//
//     if (length > strLen / 2) {
//         length = strLen / 2
//     }
//     let i
//     for (i = 0; i < length; ++i) {
//         const parsed = parseInt(string.substr(i * 2, 2), 16)
//         if (numberIsNaN(parsed)) return i
//         buf[offset + i] = parsed
//     }
//     return i
// }
//
// function utf8Write(buf, string, offset, length) {
//     return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
// }
//
// function asciiWrite(buf, string, offset, length) {
//     return blitBuffer(asciiToBytes(string), buf, offset, length)
// }
//
// function base64Write(buf, string, offset, length) {
//     return blitBuffer(base64ToBytes(string), buf, offset, length)
// }
//
// function ucs2Write(buf, string, offset, length) {
//     return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
// }
//
// /*
//  * Need to make sure that buffer isn't trying to write out of bounds.
//  */
// function checkOffset(offset, ext, length) {
//     if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
//     if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
// }
//
// function checkInt(buf, value, offset, ext, max, min) {
//     if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
//     if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
//     if (offset + ext > buf.length) throw new RangeError('Index out of range')
// }
//
// // HELPER FUNCTIONS
// // ================
//
// const INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g
//
// function base64clean(str) {
//     // Node takes equal signs as end of the Base64 encoding
//     str = str.split('=')[0]
//     // Node strips out invalid characters like \n and \t from the string, base64-js does not
//     str = str.trim().replace(INVALID_BASE64_RE, '')
//     // Node converts strings with length < 2 to ''
//     if (str.length < 2) return ''
//     // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
//     while (str.length % 4 !== 0) {
//         str = str + '='
//     }
//     return str
// }
//
// function utf8ToBytes(string, units) {
//     units = units || Infinity
//     let codePoint
//     const length = string.length
//     let leadSurrogate = null
//     const bytes = []
//
//     for (let i = 0; i < length; ++i) {
//         codePoint = string.charCodeAt(i)
//
//         // is surrogate component
//         if (codePoint > 0xD7FF && codePoint < 0xE000) {
//             // last char was a lead
//             if (!leadSurrogate) {
//                 // no lead yet
//                 if (codePoint > 0xDBFF) {
//                     // unexpected trail
//                     if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
//                     continue
//                 } else if (i + 1 === length) {
//                     // unpaired lead
//                     if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
//                     continue
//                 }
//
//                 // valid lead
//                 leadSurrogate = codePoint
//
//                 continue
//             }
//
//             // 2 leads in a row
//             if (codePoint < 0xDC00) {
//                 if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
//                 leadSurrogate = codePoint
//                 continue
//             }
//
//             // valid surrogate pair
//             codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
//         } else if (leadSurrogate) {
//             // valid bmp char, but last char was a lead
//             if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
//         }
//
//         leadSurrogate = null
//
//         // encode utf8
//         if (codePoint < 0x80) {
//             if ((units -= 1) < 0) break
//             bytes.push(codePoint)
//         } else if (codePoint < 0x800) {
//             if ((units -= 2) < 0) break
//             bytes.push(
//                 codePoint >> 0x6 | 0xC0,
//                 codePoint & 0x3F | 0x80
//             )
//         } else if (codePoint < 0x10000) {
//             if ((units -= 3) < 0) break
//             bytes.push(
//                 codePoint >> 0xC | 0xE0,
//                 codePoint >> 0x6 & 0x3F | 0x80,
//                 codePoint & 0x3F | 0x80
//             )
//         } else if (codePoint < 0x110000) {
//             if ((units -= 4) < 0) break
//             bytes.push(
//                 codePoint >> 0x12 | 0xF0,
//                 codePoint >> 0xC & 0x3F | 0x80,
//                 codePoint >> 0x6 & 0x3F | 0x80,
//                 codePoint & 0x3F | 0x80
//             )
//         } else {
//             throw new Error('Invalid code point')
//         }
//     }
//
//     return bytes
// }
//
// function asciiToBytes(str) {
//     const byteArray = []
//     for (let i = 0; i < str.length; ++i) {
//         // Node's code seems to be doing this and not & 0x7F..
//         byteArray.push(str.charCodeAt(i) & 0xFF)
//     }
//     return byteArray
// }
//
// function utf16leToBytes(str, units) {
//     let c, hi, lo
//     const byteArray = []
//     for (let i = 0; i < str.length; ++i) {
//         if ((units -= 2) < 0) break
//
//         c = str.charCodeAt(i)
//         hi = c >> 8
//         lo = c % 256
//         byteArray.push(lo)
//         byteArray.push(hi)
//     }
//
//     return byteArray
// }
//
// function base64ToBytes(str) {
//     return base64.toByteArray(base64clean(str))
// }
//
// function blitBuffer(src, dst, offset, length) {
//     let i
//     for (i = 0; i < length; ++i) {
//         if ((i + offset >= dst.length) || (i >= src.length)) break
//         dst[i + offset] = src[i]
//     }
//     return i
// }
//
// // ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// // the `instanceof` check but they should be treated as of that type.
// // See: https://github.com/feross/buffer/issues/166
// function isInstance(obj, type) {
//     return obj instanceof type ||
//         (obj != null && obj.constructor != null && obj.constructor.name != null &&
//             obj.constructor.name === type.name)
// }
//
// function numberIsNaN(obj) {
//     // For IE11 support
//     return obj !== obj // eslint-disable-line no-self-compare
// }
