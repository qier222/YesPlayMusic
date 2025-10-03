import * as wasm from './safe_decode_uri_component2_bg';

let cachegetUint16Memory = null;
function getUint16Memory() {
    if (cachegetUint16Memory === null || cachegetUint16Memory.buffer !== wasm.memory.buffer) {
        cachegetUint16Memory = new Uint16Array(wasm.memory.buffer);
    }
    return cachegetUint16Memory;
}

let WASM_VECTOR_LEN = 0;

function passArray16ToWasm(arg) {
    const ptr = wasm.__wbindgen_malloc(arg.length * 2);
    getUint16Memory().set(arg, ptr / 2);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}
/**
* @param {Uint16Array} bytes
* @returns {number}
*/
export function decode_uri_component(bytes) {
    const ptr0 = passArray16ToWasm(bytes);
    const len0 = WASM_VECTOR_LEN;
    try {
        return wasm.decode_uri_component(ptr0, len0) >>> 0;

    } finally {
        bytes.set(getUint16Memory().subarray(ptr0 / 2, ptr0 / 2 + len0));
        wasm.__wbindgen_free(ptr0, len0 * 2);

    }

}

