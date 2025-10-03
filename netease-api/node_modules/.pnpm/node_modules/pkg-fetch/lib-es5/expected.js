"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EXPECTED_HASHES = void 0;
exports.EXPECTED_HASHES = {
    // 2a68741776e74f626c83254941a639ab7dcf6332
    // alpine: https://github.com/vercel/pkg-fetch/actions/runs/752615021
    // linux: https://github.com/vercel/pkg-fetch/actions/runs/752615173
    // linuxstatic: https://github.com/vercel/pkg-fetch/actions/runs/752615423
    // macos: https://github.com/vercel/pkg-fetch/actions/runs/752615807
    // win: https://github.com/vercel/pkg-fetch/actions/runs/752615557
    'node-v10.24.1-alpine-arm64': 'f6a59f1ace2ef1f4bf976ff85d9a74bdc71bda098e8aa018e2a089c590aeedea',
    'node-v10.24.1-alpine-x64': '24f862b22a59ac0adb746d5bd3f2226c8eb2f6e1565a1cb4d2418c9cb0f3769e',
    'node-v10.24.1-linux-x64': 'c59574f4ea7b1423bd7ef586887ea41c43cfb2a63431126af0de20291a3a94db',
    'node-v10.24.1-linuxstatic-arm64': '01bc2cfbf7a7dd1a74201ae34a6cfafc1ad1c6d77039f587111738a81637bc5b',
    'node-v10.24.1-linuxstatic-x64': 'a7bbd62b712b3a7ac54953b646f0802e84bc7ecadb0b8a0756323fcffe3310a5',
    'node-v10.24.1-win-x64': '958647af177a9089bb4f3495e352d5348a1b42858d0111004ca26c3a2ece3f73',
    'node-v8.17.0-alpine-arm64': '807df81524ec8e1e266ac7fbed434c6b2281ae20b9fa7eaa524de90f3330c4d7',
    'node-v8.17.0-alpine-x64': '83a3914de57ee6be7d68ebaac8a10c1a2972d554800f1bee218cc4a23650e0fb',
    'node-v8.17.0-linux-arm64': 'f06855896bfa10bead1f08fac080305fb6fbfb2cc691168a3f0f0e834e12bfba',
    'node-v8.17.0-linux-x64': '14d75d43de1ff86469d354bf42a83b9494e09502fa7bc23a975e2cb82b1608b0',
    'node-v8.17.0-linuxstatic-arm64': '84de8fe30b2bd1dcb3615cf1d1b538aa48e1fcf66620ef97dce6b7ae85b45025',
    'node-v8.17.0-linuxstatic-x64': '5206878079f160e75a02ad33b7559b4a869e8181ee03d51d7211b52995f9ca7b',
    'node-v8.17.0-macos-x64': 'dffa71e39100f4daa57de73fda7b4debecd09f552b15cf11854c8475380d3817',
    'node-v8.17.0-win-x64': '4556a06dc59a0196453ba5962ea077ea71fe566e4de1c92f73f057446d422251',
    // 27e00d1d72ab4afda203edcd7a4f9601bc1d641c
    // linux: https://github.com/vercel/pkg-fetch/actions/runs/888438143
    // linuxstatic: https://github.com/vercel/pkg-fetch/actions/runs/888438190
    // macos: https://github.com/vercel/pkg-fetch/actions/runs/888438236
    'node-v10.24.1-linux-arm64': 'e3a3e5197e3f3d1063e3178786890b29493b8dfc31362f3417cce90ca7eb3e98',
    'node-v10.24.1-linuxstatic-armv7': '4933be03e394a82f5aa5fc4600b29392b2ce7eac24bd2ef8759f9a8e8c841990',
    // 55a34ad0afe75749a14260c45d39cc9b265995ed
    // macos: https://github.com/vercel/pkg-fetch/actions/runs/918633749
    'node-v10.24.1-macos-x64': 'f2e4679262a1cc6f3213cc4f0453d662e48c021975b651534fcbf26d6fdab474',
    // e34c57f612d4cf56646450f75fe38e029ff2b0d6
    // alpine: https://github.com/vercel/pkg-fetch/actions/runs/2068735040
    // linux: https://github.com/vercel/pkg-fetch/actions/runs/2068735307
    // linuxstatic: https://github.com/vercel/pkg-fetch/actions/runs/2068735697
    // macos: https://github.com/vercel/pkg-fetch/actions/runs/2068736404
    // win: https://github.com/vercel/pkg-fetch/actions/runs/2068736093
    'node-v12.22.11-alpine-x64': '2ec8d7b761f03b2172bcf3b1b56c648e844116ab08a5484d7932138c374cf18c',
    'node-v12.22.11-linux-x64': '617d58e81711d3a1d34a737db39e751caa05040a1a586e6dd688241cfb3f3eed',
    'node-v12.22.11-linuxstatic-x64': '37714fc3ae8b1d0c92b124f8ab353c77e40494075646e43ce8e20bd4038b5b83',
    'node-v12.22.11-macos-x64': '5394093f0fd2bb5ea38ee2a5eaec9e00d3d1da9e3f7c3c99c68eecfe17354286',
    'node-v12.22.11-win-x64': '24bedd07eb0cad64d505ec731c438765370bbed32d8e1f47129fe3612fadfcdb',
    // e34c57f612d4cf56646450f75fe38e029ff2b0d6
    // alpine: https://github.com/jesec/pkg-fetch/actions/runs/2068737927
    // linux: https://github.com/jesec/pkg-fetch/actions/runs/2068738228
    // linuxstatic: https://github.com/jesec/pkg-fetch/actions/runs/2068738548
    // macos: https://github.com/jesec/pkg-fetch/actions/runs/2068742592
    'node-v12.22.11-alpine-arm64': '0933ab559bb34c720f0a7e0066f32608960a4d6290977c3af15529f7abfe7265',
    'node-v12.22.11-linux-arm64': '3a50d85ebd5ba7e1e62165b9df237925789ef9ed0ed92fd9d0f3a9df7503f751',
    'node-v12.22.11-linuxstatic-arm64': '0c5b03cbe32ce50f16dbb35769a2a897b30e8fdb2137c4799edb55898b475622',
    // 6ffa969bc037f33cd5c926b8706324740c8818af
    // alpine: https://github.com/vercel/pkg-fetch/actions/runs/2638965835
    // linux: https://github.com/vercel/pkg-fetch/actions/runs/2638965968
    // linuxstatic: https://github.com/vercel/pkg-fetch/actions/runs/2638966056
    // macos: https://github.com/vercel/pkg-fetch/actions/runs/2638966552
    // win: https://github.com/vercel/pkg-fetch/actions/runs/2638966247
    'node-v14.20.0-alpine-x64': 'bd48f87a845825d7321ff436ab0ecf59c71ac53356fed3b6ba2a841e06a75945',
    'node-v14.20.0-linux-x64': 'f3149f4772c6bc41180017d325e27b1465213acd684164e26fbc64e1f2f97dcf',
    'node-v14.20.0-linuxstatic-x64': 'a23a2fe6f1d75bb6d1faed1221e47fb3ff4789a23018709d919c5d24a3b17ce2',
    'node-v14.20.0-macos-x64': 'afda9c14e5f3fc18d40b7cd05c6a8ba42284c28928b29e47b9b99125d41ebce6',
    'node-v14.20.0-win-arm64': 'd9911fcdcedd1f5b227bd7d0ac3ef819a411976f6eb9550e2275a3c4fe93b97b',
    'node-v14.20.0-win-x64': 'f71330035700705ae39bfaac80b9270c8f75631b06b25f21b06d7359d9cd6c24',
    'node-v16.16.0-alpine-x64': '2c4caf90c620f4839277edf8dfb4fd1d259294a2bfbed2b90bb6063a6e0c9d23',
    'node-v16.16.0-linux-x64': 'f1a561aadf78e438e73b043a3c5d7b9fe075d7abcaaec6f29d9e2a0ba00d3a69',
    'node-v16.16.0-linuxstatic-x64': '8a888553a4855f3b01ea91a398eb3112b0d5f58f5f0112e9fecf6621615201ce',
    'node-v16.16.0-macos-x64': '321fcef798383c6e19d7ae242bc73dd1f1c7471499b00ee6b105c764645d9263',
    'node-v16.16.0-win-x64': 'b6c5f9a5bce3b451b6d59153eae6db1a87016edc3775ef9eae39f86485735672',
    'node-v18.5.0-alpine-x64': '8cdc988b31d52b5c5e8112f82f798aa9c815b7d861e689f40ba2e33b782e0e35',
    'node-v18.5.0-linux-x64': '25ea58e212ecac6c36df03281676aca934f4fec6a05fe9f0da8d3e01778df12c',
    'node-v18.5.0-linuxstatic-x64': '18f09486dae0ca6ebc48c7bf3f68fa85baeac8279c2b407bb25e8b5941c46556',
    'node-v18.5.0-macos-x64': '63c5a7f59ea2d4c04c4d033be8844be894ce018c43b2ea61ed5ccc38b833e435',
    'node-v18.5.0-win-arm64': '02e317e399fecc4a21facc365ff51268555b1a347c4f2720956a12e843b99783',
    'node-v18.5.0-win-x64': 'e0e9a647d81011612f8cb19c6a41760643eedd27222af548e9ffdff7d8ebb94b',
    // 6ffa969bc037f33cd5c926b8706324740c8818af
    // alpine: https://github.com/jesec/pkg-fetch/actions/runs/2639071916
    // linux: https://github.com/jesec/pkg-fetch/actions/runs/2639072106
    // linuxstatic: https://github.com/jesec/pkg-fetch/actions/runs/2639072371
    // macos: https://github.com/jesec/pkg-fetch/actions/runs/2639072571
    'node-v14.20.0-alpine-arm64': 'b0be3a7904f2c79bdb8e2b61018d9aa7f55e0778c4c768c4d65017931369a762',
    'node-v14.20.0-linux-arm64': 'fa26fed989a0710e82eaf09bd727f3501ab80d487da4baa076ab50267e47bbde',
    'node-v14.20.0-linuxstatic-arm64': 'b645ee721e1f12d9a45e1a529e28038c0eb757de4bb74ba3b585999e3160a767',
    'node-v14.20.0-macos-arm64': 'c101f9378cf40d62400612f57efea3e4b0e9951b110aea6a50dbf3aff84ea45f',
    'node-v16.16.0-alpine-arm64': 'c38f270d190fd1f5d8e74800b62408d06f4492720fec1fd46414a7f504114847',
    'node-v16.16.0-linux-arm64': 'e3913ecef725f83ccbd2181d7d33043f8b3e72466d09897c338ee328cffc3bfe',
    'node-v16.16.0-linuxstatic-arm64': 'aac0039a2b380057085a4b927637c6e5550eabfd55d1ca2f98e022abccfd7390',
    'node-v16.16.0-linuxstatic-armv7': 'cbe14ff111fd3d1ecb82cf6aaec5a53588537008fdcfab4bc2c880d651f5580a',
    'node-v16.16.0-macos-arm64': 'd9140eebaa88620b9692d6e11cc2d92b2b56f791a6bbeddd771f5e07d042e1bc',
    'node-v16.16.0-win-arm64': 'e078fd200f6f0cd2e84ba668711a5cc9c7f0d20d36fae1bfe4bc361f40f5923f',
    'node-v18.5.0-alpine-arm64': 'e227164d7a0683b42a1a5659a997d7b8a843ffe293b291f0063a8afb08b657ca',
    'node-v18.5.0-linux-arm64': 'e562c0d81643de3b06b9900936ebde263373ca7bdaf42a8eacca8d020b2ce21e',
    'node-v18.5.0-linuxstatic-arm64': '073f9252693bd35a4184a24bdc503aa6dc1300def7a96564c83221e4d3272c5a',
    'node-v18.5.0-linuxstatic-armv7': 'eb32af2e74028d303933b4fd4d13e1fc3c6854cfa65e962dfe31903cff69ef74',
    'node-v18.5.0-macos-arm64': '242917bdb26a1b53726f82483bc68ce0609cc8772df401b2eb163dc6b3d6ddfe',
};
//# sourceMappingURL=expected.js.map