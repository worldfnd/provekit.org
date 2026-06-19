var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/errors.ts
var VerityErrorCode, VerityError;
var init_errors = __esm({
  "src/errors.ts"() {
    "use strict";
    VerityErrorCode = /* @__PURE__ */ ((VerityErrorCode2) => {
      VerityErrorCode2[VerityErrorCode2["RESOURCE_CLOSED"] = -2] = "RESOURCE_CLOSED";
      VerityErrorCode2[VerityErrorCode2["NOT_INITIALIZED"] = -1] = "NOT_INITIALIZED";
      VerityErrorCode2[VerityErrorCode2["INVALID_INPUT"] = 1] = "INVALID_INPUT";
      VerityErrorCode2[VerityErrorCode2["SCHEME_READ_ERROR"] = 2] = "SCHEME_READ_ERROR";
      VerityErrorCode2[VerityErrorCode2["WITNESS_READ_ERROR"] = 3] = "WITNESS_READ_ERROR";
      VerityErrorCode2[VerityErrorCode2["PROOF_ERROR"] = 4] = "PROOF_ERROR";
      VerityErrorCode2[VerityErrorCode2["SERIALIZATION_ERROR"] = 5] = "SERIALIZATION_ERROR";
      VerityErrorCode2[VerityErrorCode2["UTF8_ERROR"] = 6] = "UTF8_ERROR";
      VerityErrorCode2[VerityErrorCode2["FILE_WRITE_ERROR"] = 7] = "FILE_WRITE_ERROR";
      VerityErrorCode2[VerityErrorCode2["COMPILATION_ERROR"] = 8] = "COMPILATION_ERROR";
      VerityErrorCode2[VerityErrorCode2["UNKNOWN_BACKEND"] = 9] = "UNKNOWN_BACKEND";
      VerityErrorCode2[VerityErrorCode2["OUT_OF_MEMORY"] = 10] = "OUT_OF_MEMORY";
      VerityErrorCode2[VerityErrorCode2["BACKEND_UNAVAILABLE"] = 11] = "BACKEND_UNAVAILABLE";
      return VerityErrorCode2;
    })(VerityErrorCode || {});
    VerityError = class _VerityError extends Error {
      code;
      constructor(code, detail) {
        const message = detail ? `${_VerityError.messageForCode(code)}: ${detail}` : _VerityError.messageForCode(code);
        super(message);
        this.name = "VerityError";
        this.code = code;
      }
      static messageForCode(code) {
        switch (code) {
          case -2 /* RESOURCE_CLOSED */:
            return "Resource has been disposed";
          case -1 /* NOT_INITIALIZED */:
            return "Verity not initialized";
          case 1 /* INVALID_INPUT */:
            return "Invalid input";
          case 2 /* SCHEME_READ_ERROR */:
            return "Failed to read scheme/circuit file";
          case 3 /* WITNESS_READ_ERROR */:
            return "Witness read error";
          case 4 /* PROOF_ERROR */:
            return "Proof generation or verification error";
          case 5 /* SERIALIZATION_ERROR */:
            return "Serialization error";
          case 6 /* UTF8_ERROR */:
            return "UTF-8 error";
          case 7 /* FILE_WRITE_ERROR */:
            return "File write error";
          case 8 /* COMPILATION_ERROR */:
            return "Reserved error code";
          case 9 /* UNKNOWN_BACKEND */:
            return "Unknown or unregistered backend";
          case 10 /* OUT_OF_MEMORY */:
            return "Out of memory";
          case 11 /* BACKEND_UNAVAILABLE */:
            return "Backend not available in this runtime";
          default:
            return `FFI error code: ${code}`;
        }
      }
      /** Map an FFI error code to a VerityError. */
      static fromCode(code, detail) {
        return new _VerityError(code, detail);
      }
    };
  }
});

// src/proof.ts
var Proof;
var init_proof = __esm({
  "src/proof.ts"() {
    "use strict";
    init_errors();
    Proof = class _Proof {
      data;
      size;
      hex;
      constructor(data) {
        this.data = new Uint8Array(data);
        this.size = this.data.length;
        this.hex = Array.from(this.data, (b) => b.toString(16).padStart(2, "0")).join("");
      }
      /** Truncated hex string for display. */
      hexPreview(maxBytes = 32) {
        const slice = this.data.slice(0, maxBytes);
        const preview = Array.from(slice, (b) => b.toString(16).padStart(2, "0")).join("");
        return this.data.length > maxBytes ? preview + "..." : preview;
      }
      /** Create a proof from raw bytes. */
      static fromBytes(data) {
        if (data.length === 0) {
          throw new VerityError(1 /* INVALID_INPUT */, "proof data cannot be empty");
        }
        return new _Proof(data);
      }
      toString() {
        return `Proof(${this.size} bytes)`;
      }
    };
  }
});

// src/backends/provekit.ts
var provekit_exports = {};
__export(provekit_exports, {
  ProveKitBinding: () => ProveKitBinding,
  convertWitnessMap: () => convertWitnessMap,
  mapWasmError: () => mapWasmError
});
function mapWasmError(err) {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes("Failed to parse prover") || msg.includes("Failed to parse verifier") || msg.includes("Invalid magic bytes") || msg.includes("Invalid format identifier") || msg.includes("data too short for binary format") || msg.includes("Incompatible prover format") || msg.includes("Incompatible verifier format") || msg.includes("Unknown compression format") || msg.includes("Failed to deserialize prover data") || msg.includes("Failed to deserialize verifier data") || msg.includes("Failed to decompress")) {
    return new VerityError(2 /* SCHEME_READ_ERROR */, msg);
  }
  if (msg.includes("Failed to parse proof")) {
    return new VerityError(1 /* INVALID_INPUT */, msg);
  }
  if (msg.includes("Witness map is empty") || msg.includes("Failed to parse witness") || msg.includes("Failed to parse hex")) {
    return new VerityError(3 /* WITNESS_READ_ERROR */, msg);
  }
  if (msg.includes("Failed to generate proof")) {
    return new VerityError(4 /* PROOF_ERROR */, msg);
  }
  return new VerityError(4 /* PROOF_ERROR */, msg);
}
function convertWitnessMap(witnessMap) {
  const result = {};
  for (const [witness, value] of witnessMap.entries()) {
    const index = typeof witness === "number" ? witness : typeof witness?.inner === "number" ? witness.inner : Number(witness);
    if (Number.isNaN(index)) {
      throw new VerityError(
        3 /* WITNESS_READ_ERROR */,
        `Failed to extract witness index from key: ${witness}`
      );
    }
    result[index] = value;
  }
  return result;
}
function assertNotDisposed(disposed, name) {
  if (disposed) {
    throw new VerityError(-2 /* RESOURCE_CLOSED */, `${name} has been disposed`);
  }
}
function parseJsonInputs(inputs) {
  try {
    const parsed = JSON.parse(inputs);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new VerityError(1 /* INVALID_INPUT */, "JSON input string must decode to an object");
    }
    return parsed;
  } catch (err) {
    if (err instanceof VerityError) {
      throw err;
    }
    throw new VerityError(1 /* INVALID_INPUT */, "Failed to parse JSON input string");
  }
}
async function getWasmModuleSpecifiers(isNode) {
  if (isNode && typeof __dirname === "string") {
    const [{ resolve }, { pathToFileURL }] = await Promise.all([
      import("path"),
      import("url")
    ]);
    return [
      pathToFileURL(resolve(__dirname, "../wasm/provekit_wasm.js")).href,
      pathToFileURL(resolve(__dirname, "../../wasm/provekit_wasm.js")).href
    ];
  }
  return [
    new URL("../wasm/provekit_wasm.js", import.meta.url).href,
    new URL("../../wasm/provekit_wasm.js", import.meta.url).href
  ];
}
async function importFirstAvailable(specifiers) {
  let lastError;
  for (const specifier of specifiers) {
    try {
      return await import(specifier);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}
async function getNodeWasmBinaryPath() {
  const { access } = await import("fs/promises");
  if (typeof __dirname === "string") {
    const { resolve } = await import("path");
    const candidates2 = [
      resolve(__dirname, "../wasm/provekit_wasm_bg.wasm"),
      resolve(__dirname, "../../wasm/provekit_wasm_bg.wasm")
    ];
    for (const candidate of candidates2) {
      try {
        await access(candidate);
        return candidate;
      } catch {
      }
    }
    return candidates2[candidates2.length - 1];
  }
  const { fileURLToPath } = await import("url");
  const candidates = [
    fileURLToPath(new URL("../wasm/provekit_wasm_bg.wasm", import.meta.url)),
    fileURLToPath(new URL("../../wasm/provekit_wasm_bg.wasm", import.meta.url))
  ];
  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
    }
  }
  return candidates[candidates.length - 1];
}
var wasmModule, wasmInitialized, wasmInitPromise, ProveKitProverScheme, ProveKitVerifierScheme, ProveKitBinding;
var init_provekit = __esm({
  "src/backends/provekit.ts"() {
    "use strict";
    init_proof();
    init_errors();
    wasmModule = null;
    wasmInitialized = false;
    wasmInitPromise = null;
    ProveKitProverScheme = class {
      disposed = false;
      pkpBytes;
      circuitJson;
      constructor(pkpBytes, circuitJson) {
        this.pkpBytes = new Uint8Array(pkpBytes);
        this.circuitJson = circuitJson;
      }
      async prove(inputs) {
        assertNotDisposed(this.disposed, "ProverScheme");
        const parsedInputs = typeof inputs === "string" ? parseJsonInputs(inputs) : inputs;
        let Noir;
        let decompressWitnessStack;
        try {
          const noirJs = await import("@noir-lang/noir_js");
          const acvmJs = await import("@noir-lang/acvm_js");
          Noir = noirJs.Noir;
          decompressWitnessStack = acvmJs.decompressWitnessStack;
        } catch {
          throw new VerityError(
            11 /* BACKEND_UNAVAILABLE */,
            "ProveKit browser backend requires @noir-lang/noir_js and @noir-lang/acvm_js. Install with: npm install @noir-lang/noir_js @noir-lang/acvm_js"
          );
        }
        const noir = new Noir(this.circuitJson);
        const { witness: compressedWitness } = await noir.execute(parsedInputs);
        const witnessStack = decompressWitnessStack(compressedWitness);
        const witnessMap = witnessStack[0].witness;
        const converted = convertWitnessMap(witnessMap);
        try {
          const prover = new wasmModule.Prover(this.pkpBytes);
          const proofBytes = prover.proveBytes(converted);
          return Proof.fromBytes(proofBytes);
        } catch (err) {
          throw mapWasmError(err);
        }
      }
      async serialize() {
        assertNotDisposed(this.disposed, "ProverScheme");
        return new Uint8Array(this.pkpBytes);
      }
      dispose() {
        this.disposed = true;
      }
    };
    ProveKitVerifierScheme = class {
      disposed = false;
      pkvBytes;
      verifier;
      constructor(pkvBytes, verifier) {
        this.pkvBytes = new Uint8Array(pkvBytes);
        this.verifier = verifier;
      }
      async verify(proof) {
        assertNotDisposed(this.disposed, "VerifierScheme");
        try {
          this.verifier.verifyBytes(proof.data);
          return true;
        } catch (err) {
          const mapped = mapWasmError(err);
          if (mapped.code === 1 /* INVALID_INPUT */) {
            throw mapped;
          }
          return false;
        }
      }
      async serialize() {
        assertNotDisposed(this.disposed, "VerifierScheme");
        return new Uint8Array(this.pkvBytes);
      }
      dispose() {
        this.disposed = true;
        this.verifier = null;
      }
    };
    ProveKitBinding = class {
      async init(options) {
        if (wasmInitialized) return;
        if (!wasmInitPromise) {
          wasmInitPromise = this.initOnce(options).catch((err) => {
            wasmInitPromise = null;
            throw err;
          });
        }
        await wasmInitPromise;
      }
      async initOnce(options) {
        const isNode = typeof process !== "undefined" && !!process.versions?.node;
        const globalScope = globalThis;
        const hadOwnSelf = Object.prototype.hasOwnProperty.call(globalScope, "self");
        const originalSelf = globalScope.self;
        const wasmModuleSpecifiers = await getWasmModuleSpecifiers(isNode);
        try {
          if (isNode && typeof globalScope.self === "undefined") {
            const workerScopeShim = {
              addEventListener() {
              },
              removeEventListener() {
              }
            };
            Reflect.set(globalScope, "self", workerScopeShim);
          }
          wasmModule = await importFirstAvailable(wasmModuleSpecifiers);
        } catch (err) {
          const detail = err instanceof Error ? err.message : String(err);
          throw new VerityError(
            11 /* BACKEND_UNAVAILABLE */,
            `Failed to load ProveKit WASM module. Ensure WASM artifacts are built (make core-wasm). ${detail}`
          );
        } finally {
          if (isNode) {
            if (hadOwnSelf) {
              Reflect.set(globalScope, "self", originalSelf);
            } else {
              Reflect.deleteProperty(globalScope, "self");
            }
          }
        }
        try {
          const wasmUrl = options?.wasmUrl;
          if (wasmUrl) {
            const wasmResponse = await fetch(wasmUrl);
            const wasmBytes = await wasmResponse.arrayBuffer();
            await wasmModule.default({ module_or_path: wasmBytes });
          } else if (isNode) {
            const { readFile } = await import("fs/promises");
            const wasmBytes = await readFile(await getNodeWasmBinaryPath());
            await wasmModule.default({ module_or_path: wasmBytes });
          } else {
            await wasmModule.default();
          }
        } catch (err) {
          if (err instanceof VerityError) {
            throw err;
          }
          const detail = err instanceof Error ? err.message : String(err);
          throw new VerityError(
            11 /* BACKEND_UNAVAILABLE */,
            `Failed to initialize ProveKit WASM runtime. ${detail}`
          );
        }
        if (wasmModule.initPanicHook) {
          wasmModule.initPanicHook();
        }
        const isBrowser = typeof window !== "undefined" && typeof document !== "undefined" && typeof navigator !== "undefined";
        if (isBrowser && options?.threads !== false) {
          const hasSharedArrayBuffer = typeof SharedArrayBuffer !== "undefined";
          const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
          if (hasSharedArrayBuffer && !isIOS && wasmModule.initThreadPool) {
            const threadCount = typeof options?.threads === "number" ? options.threads : navigator.hardwareConcurrency || 4;
            try {
              await wasmModule.initThreadPool(threadCount);
            } catch {
            }
          }
        }
        wasmInitialized = true;
      }
      async loadProver(data) {
        const tempProver = new wasmModule.Prover(data);
        try {
          const circuitBytes = tempProver.getCircuit();
          const circuitJson = JSON.parse(new TextDecoder().decode(circuitBytes));
          return new ProveKitProverScheme(data, circuitJson);
        } catch (err) {
          throw mapWasmError(err);
        } finally {
          tempProver.free();
        }
      }
      async loadVerifier(data) {
        try {
          const verifier = new wasmModule.Verifier(data);
          return new ProveKitVerifierScheme(data, verifier);
        } catch (err) {
          throw mapWasmError(err);
        }
      }
    };
  }
});

// src/backends/barretenberg.ts
var barretenberg_exports = {};
__export(barretenberg_exports, {
  BarretenbergBinding: () => BarretenbergBinding
});
var BarretenbergBinding;
var init_barretenberg = __esm({
  "src/backends/barretenberg.ts"() {
    "use strict";
    init_errors();
    BarretenbergBinding = class {
      async init(_options) {
        throw new VerityError(
          11 /* BACKEND_UNAVAILABLE */,
          "Barretenberg WASM binding not yet implemented"
        );
      }
      async loadProver(_data) {
        throw new VerityError(
          11 /* BACKEND_UNAVAILABLE */,
          "Barretenberg WASM binding not yet implemented"
        );
      }
      async loadVerifier(_data) {
        throw new VerityError(
          11 /* BACKEND_UNAVAILABLE */,
          "Barretenberg WASM binding not yet implemented"
        );
      }
    };
  }
});

// src/types.ts
var Backend = /* @__PURE__ */ ((Backend2) => {
  Backend2[Backend2["ProveKit"] = 0] = "ProveKit";
  Backend2[Backend2["Barretenberg"] = 1] = "Barretenberg";
  return Backend2;
})(Backend || {});

// src/verity.ts
init_errors();
var Verity = class _Verity {
  static version = true ? "0.3.2-alpha" : "0.0.0-dev";
  binding;
  _backend;
  constructor(backend, binding) {
    this._backend = backend;
    this.binding = binding;
  }
  /** The backend this instance was created with. */
  get backend() {
    return this._backend;
  }
  /**
   * Create a Verity instance with the specified backend.
   * Initializes the backend (may load WASM or native addon).
   */
  static async create(backend, options) {
    const binding = await _Verity.resolveBinding(backend);
    await binding.init(options);
    return new _Verity(backend, binding);
  }
  static async resolveBinding(backend) {
    switch (backend) {
      case 0 /* ProveKit */: {
        const { ProveKitBinding: ProveKitBinding2 } = await Promise.resolve().then(() => (init_provekit(), provekit_exports));
        return new ProveKitBinding2();
      }
      case 1 /* Barretenberg */: {
        const { BarretenbergBinding: BarretenbergBinding2 } = await Promise.resolve().then(() => (init_barretenberg(), barretenberg_exports));
        return new BarretenbergBinding2();
      }
      default:
        throw new VerityError(9 /* UNKNOWN_BACKEND */, `Unknown backend: ${backend}`);
    }
  }
  /** Load a prover scheme from bytes (.pkp format). */
  async loadProver(data) {
    if (data.length === 0) {
      throw new VerityError(1 /* INVALID_INPUT */, "prover data cannot be empty");
    }
    return this.binding.loadProver(data);
  }
  /** Load a verifier scheme from bytes (.pkv format). */
  async loadVerifier(data) {
    if (data.length === 0) {
      throw new VerityError(1 /* INVALID_INPUT */, "verifier data cannot be empty");
    }
    return this.binding.loadVerifier(data);
  }
  /** Generate a proof. Convenience — delegates to `prover.prove()`. */
  async prove(prover, inputs) {
    return prover.prove(inputs);
  }
  /** Verify a proof. Convenience — delegates to `verifier.verify()`. */
  async verify(verifier, proof) {
    return verifier.verify(proof);
  }
};

// src/browser.ts
init_proof();
init_errors();
export {
  Backend,
  Proof,
  Verity,
  VerityError,
  VerityErrorCode
};
//# sourceMappingURL=index.js.map