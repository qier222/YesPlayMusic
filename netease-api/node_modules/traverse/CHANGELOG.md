# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v0.6.7](https://github.com/ljharb/js-traverse/compare/v0.6.6...v0.6.7) - 2022-10-12

### Commits

- [eslint] fix indentation and whitespace [`89fc65c`](https://github.com/ljharb/js-traverse/commit/89fc65c5c9f2778cb63d583b1fcd83a31ca104f4)
- [eslint] cleanup [`1921966`](https://github.com/ljharb/js-traverse/commit/1921966fff1933e086d413acc44c2cf43a130fae)
- [meta] add `auto-changelog` [`c291ed2`](https://github.com/ljharb/js-traverse/commit/c291ed225c7b5257372a3d30951eaefc186107e7)
- [actions] add reusable workflows [`9a8fd34`](https://github.com/ljharb/js-traverse/commit/9a8fd34a6111f3f6dff43a7f22d272c46243d68f)
- [Dev Deps] update `tape` [`afd6a95`](https://github.com/ljharb/js-traverse/commit/afd6a95c5ab6b8ed2e29d044b5ff8724ed992c4d)
- [eslint] add eslint [`559372e`](https://github.com/ljharb/js-traverse/commit/559372ec96b460c45953c4c00f931f7fee36dce7)
- [readme] rename, add badges [`0e613fd`](https://github.com/ljharb/js-traverse/commit/0e613fdf7d3712e9b18a678d45cadd639233c79e)
- [meta] create FUNDING.yml; add `funding` in package.json [`26a9ae3`](https://github.com/ljharb/js-traverse/commit/26a9ae3a2e6ff06a3af9f1301ec4ef08ceb99bec)
- [meta] use `npmignore` to autogenerate an npmignore file [`0e09fe6`](https://github.com/ljharb/js-traverse/commit/0e09fe6105466f5e11ff4e1d12fa5cb77848b900)
- Only apps should have lockfiles [`e1ac253`](https://github.com/ljharb/js-traverse/commit/e1ac253acfa4917617c01b7d76d80741cbe379ce)
- [meta] update URLs [`035e2c0`](https://github.com/ljharb/js-traverse/commit/035e2c05c52acde26d5c13599748a901d1bbf237)
- [meta] add `safe-publish-latest` [`c2797ac`](https://github.com/ljharb/js-traverse/commit/c2797ac1218e9c8da1a9dd3863ecf3698e57878f)
- [Tests] add `aud` in `posttest` [`ff93f53`](https://github.com/ljharb/js-traverse/commit/ff93f5380201ccbd0bf22188ed4943b739174589)

## [v0.6.6](https://github.com/ljharb/js-traverse/compare/v0.6.5...v0.6.6) - 2013-09-23

### Commits

- remove tap as a dep to get around the cyclic library issues [`85e1b23`](https://github.com/ljharb/js-traverse/commit/85e1b23ea360b4e6918f998c95ef84d8a0d9a1d2)
- guard for the presence of getTime [`98f278a`](https://github.com/ljharb/js-traverse/commit/98f278a34a957134688e147ec65b1b1115244234)
- use getTime() for firefox browser support [`ee928ca`](https://github.com/ljharb/js-traverse/commit/ee928ca5c2b6a3b19cecd01a743d38d3cddaccf5)

## [v0.6.5](https://github.com/ljharb/js-traverse/compare/v0.6.4...v0.6.5) - 2013-08-30

### Commits

- merge the null fix [`c405df2`](https://github.com/ljharb/js-traverse/commit/c405df2c8a8d49321ac8081b928b4e5df5f80237)
- fix for Cannot convert null to object  at hasOwnProperty (native) when node is null [`d9f52fa`](https://github.com/ljharb/js-traverse/commit/d9f52fa400c53f5bf1b5e388c0dd457c4dc651e3)

## [v0.6.4](https://github.com/ljharb/js-traverse/compare/v0.6.3...v0.6.4) - 2012-12-17

### Commits

- upgraded readme [`c45db75`](https://github.com/ljharb/js-traverse/commit/c45db75c4a606b724156e50b14688b503e146cf3)
- using tape [`5c8e966`](https://github.com/ljharb/js-traverse/commit/5c8e966e8636fdab2c55cac0e4e0958f06f7ca1f)
- using testling-ci [`73f3061`](https://github.com/ljharb/js-traverse/commit/73f306146afa8ccc884cb0d43788338e294320cc)
- hasOwnProperty stub [`c889666`](https://github.com/ljharb/js-traverse/commit/c889666d81d79cbfd99372bea641e6938bd5531c)
- add a comma [`3f8d778`](https://github.com/ljharb/js-traverse/commit/3f8d778dbc0b070c972839fd1ac23b253a99cce2)

## [v0.6.3](https://github.com/ljharb/js-traverse/compare/v0.6.2...v0.6.3) - 2012-06-18

### Commits

- 0.6.3, fixes bugs when the replacement for an object is not an object [`09f560c`](https://github.com/ljharb/js-traverse/commit/09f560c0f910a9ac76fa0fc507655627cda6dd6f)
- fixed merge conflicts [`576832a`](https://github.com/ljharb/js-traverse/commit/576832a2e4d91197b88a002dec643310fa9b3b26)
- Update state with the current node before recursing [`3857dca`](https://github.com/ljharb/js-traverse/commit/3857dcaeaceca9a739300b0b846c1094ddf3b26f)
- Add test for replacing objects with strings and vice-versa [`28d5fb6`](https://github.com/ljharb/js-traverse/commit/28d5fb64e44237e21c01904d6e46b34626d66d33)
- s/Object_keys/objectKeys/g [`ef3694f`](https://github.com/ljharb/js-traverse/commit/ef3694f1fcfe948c39a5caaded33480bcbdafdfa)
- Only set state.keys when necessary [`ee66cd1`](https://github.com/ljharb/js-traverse/commit/ee66cd1c71db7701769323548916ce860f442d03)
- Fix crash when node is a string and this.update is called with an object. [`5c6f161`](https://github.com/ljharb/js-traverse/commit/5c6f161f2006df87f231317f3413bc38ad799b7d)

## [v0.6.2](https://github.com/ljharb/js-traverse/compare/v0.6.1...v0.6.2) - 2012-06-16

### Commits

- using tap [`4f4a3e5`](https://github.com/ljharb/js-traverse/commit/4f4a3e504e702bffa88ea15b687a3712b56938dd)
- re-generate the package.json [`99a0a15`](https://github.com/ljharb/js-traverse/commit/99a0a159b28d8175c159a208e276256a0240c056)
- fix to reconstruct prototypes in browsers without Object.create() [`0cb3f34`](https://github.com/ljharb/js-traverse/commit/0cb3f349e381109287c9fac1391472796b7fc0bd)
- using travis [`57e7ccd`](https://github.com/ljharb/js-traverse/commit/57e7ccd6b10e92e737ef41b332172b38b4d5cc2e)
- s/^js-// [`1c2bae3`](https://github.com/ljharb/js-traverse/commit/1c2bae3a286b38c5f7cd22ffe4bbcc165bab7245)
- drop 0.4 [`2331189`](https://github.com/ljharb/js-traverse/commit/2331189e047b94fc95edc6f6fce11cb0cfcbb435)

## [v0.6.1](https://github.com/ljharb/js-traverse/compare/v0.6.0...v0.6.1) - 2012-04-06

### Commits

- check builtins using the toString.call trick [`459378b`](https://github.com/ljharb/js-traverse/commit/459378b6dd18ea95e9a012fd96a5d0d30ce83d64)
- support for traversing an Error object. [`642dd51`](https://github.com/ljharb/js-traverse/commit/642dd51c41ca7e41774bbde948913d9a7996633e)
- fixed the tests for how typeof a regex is now "object" [`9250084`](https://github.com/ljharb/js-traverse/commit/925008491725beec15216147329f3df907285975)
- less annoying constructor [`2c5f693`](https://github.com/ljharb/js-traverse/commit/2c5f693b60daa8b0f2cc9566fa62ec6b733d6a84)
- bump for error fixes [`6b78600`](https://github.com/ljharb/js-traverse/commit/6b78600f53284b324e733f836b9fd3b47fa5b28d)

## [v0.6.0](https://github.com/ljharb/js-traverse/compare/v0.5.2...v0.6.0) - 2012-02-20

### Commits

- has() with tests, documented get() and set() too [`aeebf14`](https://github.com/ljharb/js-traverse/commit/aeebf1466c2b7b5660545cc4365b0a66bc54a765)

## [v0.5.2](https://github.com/ljharb/js-traverse/compare/v0.5.1...v0.5.2) - 2011-10-16

### Commits

- Should be able to stop traversing when removing or deleting [`4aa61ef`](https://github.com/ljharb/js-traverse/commit/4aa61ef874d81a633aec4b72c3b2bc5ede64947f)
- relative requires for the tests [`9d4d4c5`](https://github.com/ljharb/js-traverse/commit/9d4d4c5d4c3abb9ef38c6f878a7ee8c61f0264c1)
- Added documentation for stopHere-flag on remove and delete [`2bb8018`](https://github.com/ljharb/js-traverse/commit/2bb80186f15d860cd5e17934c270bd0814236004)
- bump for stopHere on delete and remove [`a23839a`](https://github.com/ljharb/js-traverse/commit/a23839a473d0e91814911210f01d2ec4a95d1098)

## [v0.5.1](https://github.com/ljharb/js-traverse/compare/v0.5.0...v0.5.1) - 2011-08-23

### Commits

- fix for brokenness in IE with using the wrong variable name for the prototype checking [`4cb7bcb`](https://github.com/ljharb/js-traverse/commit/4cb7bcbd155df29268c8b8fc249f0f838aaa94f3)

## [v0.5.0](https://github.com/ljharb/js-traverse/compare/v0.4.6...v0.5.0) - 2011-08-23

### Commits

- spun off deepEqual into a utility library [`9d5148a`](https://github.com/ljharb/js-traverse/commit/9d5148a22dbe1484286c216959625168275457db)
- traverse now works with all the IEs [`96d9e25`](https://github.com/ljharb/js-traverse/commit/96d9e2564fc0f1413a7a1371cfd9cc5600896771)
- tests all updated for the removal of deepEqual from the main lib [`9ebde92`](https://github.com/ljharb/js-traverse/commit/9ebde9226720231d4390ebdaea04a0c4652caf21)
- stubs for non-es5 browsers, didn't break any unit tests [`559a6f1`](https://github.com/ljharb/js-traverse/commit/559a6f18873d48a97b293c058cc2a8f334dfd535)

## [v0.4.6](https://github.com/ljharb/js-traverse/compare/v0.4.5...v0.4.6) - 2011-07-27

### Commits

- some minor adjustments to expose keys for sibling calculations [`a936bea`](https://github.com/ljharb/js-traverse/commit/a936bea1e4d164ab33459352234eaea9a1d84a38)

## [v0.4.5](https://github.com/ljharb/js-traverse/compare/v0.4.4...v0.4.5) - 2011-07-24

### Commits

- include circular ref example in the readme, Traverse =&gt; traverse [`4a6285f`](https://github.com/ljharb/js-traverse/commit/4a6285f71f4220550d4587090fd832ec9fcb10b7)
- scrub example [`ec1fb18`](https://github.com/ljharb/js-traverse/commit/ec1fb18b494f1bcb6b1ce4a2a86dce6560ae746d)
- bump for exposing parents [`5cb4ecb`](https://github.com/ljharb/js-traverse/commit/5cb4ecb37b2af64367f466cd1994d18c45def070)
- export 'parents' to context [`5af2f8d`](https://github.com/ljharb/js-traverse/commit/5af2f8d24e2e9dce5c43ae5abbe2ff23384610fc)

## [v0.4.4](https://github.com/ljharb/js-traverse/compare/v0.4.3...v0.4.4) - 2011-07-20

### Commits

- allow setting of keys (ordering) in before modifier [`9fb8e2c`](https://github.com/ljharb/js-traverse/commit/9fb8e2c126e5bcec59e382b59e040ae764ea9045)
- note about this.keys, bump [`1148bc7`](https://github.com/ljharb/js-traverse/commit/1148bc7603411c423b41a5cb396b27ab6ca2c565)

## [v0.4.3](https://github.com/ljharb/js-traverse/compare/v0.4.2...v0.4.3) - 2011-06-14

### Commits

- bump to 0.4.3 for guybrush's IE fixes [`c74a7ea`](https://github.com/ljharb/js-traverse/commit/c74a7eaa83edb86e20b2427bbd2068339b385aa8)
- another fix for IE [`ed86376`](https://github.com/ljharb/js-traverse/commit/ed86376b826284a858d040f8d0a40532a8d4d919)
- fix for IE [`35949ef`](https://github.com/ljharb/js-traverse/commit/35949ef979662e6a9118beca80d0f6a080828ddc)

## [v0.4.2](https://github.com/ljharb/js-traverse/compare/v0.4.1...v0.4.2) - 2011-06-11

### Commits

- bump to 0.4.2 for this.block() with a passing test [`d945818`](https://github.com/ljharb/js-traverse/commit/d945818e0e489d9ffe2dd25ea64c598085139c69)
- note about stopHere for update() in the readme [`18f3e27`](https://github.com/ljharb/js-traverse/commit/18f3e273c7ec22b7121438d517eaeb7832f18d99)

## [v0.4.1](https://github.com/ljharb/js-traverse/compare/v0.4.0...v0.4.1) - 2011-06-10

### Commits

- moved stop behavior in updates into a second keepGoing argument [`1d31897`](https://github.com/ljharb/js-traverse/commit/1d318974255df34a821da53cb3d573153a0682b2)

## [v0.4.0](https://github.com/ljharb/js-traverse/compare/v0.3.8...v0.4.0) - 2011-06-10

### Commits

- an amazing number of test descriptions were getting ignored [`1d043f0`](https://github.com/ljharb/js-traverse/commit/1d043f09e6eb6ecf8456295efdbe4e7298f7c3c8)
- better failing super deep test [`01d35ce`](https://github.com/ljharb/js-traverse/commit/01d35ce70d514243d1854bd4c50eb0fa5321ef2b)
- stop() passes its test [`79d615f`](https://github.com/ljharb/js-traverse/commit/79d615f8dc60dc491da82d80f0fdab1a53974d3d)
- passing test for deep reduce and this.stop() [`9aea0a1`](https://github.com/ljharb/js-traverse/commit/9aea0a10cdd48f23ef40aeaee54f2d50053d77ff)
- subexpr test passes by checking if update() happened [`44e731b`](https://github.com/ljharb/js-traverse/commit/44e731b972b864b1de1ef315bf1ce4dbba3a7d67)
- passing new tests yay [`3d5057a`](https://github.com/ljharb/js-traverse/commit/3d5057a832c14f51d07ddb7f3331769c37f6192d)
- failing test for this.stop() [`090c3d4`](https://github.com/ljharb/js-traverse/commit/090c3d4d2de99586ad89a8b51ab8ea5664747e3e)
- subexpressions from update()s shouldn't be traversed, failing test [`be2b574`](https://github.com/ljharb/js-traverse/commit/be2b5746670b213d1c57c8f1f6d59a78e8ff88e6)
- passing test for stop map too hooray [`0ee24cc`](https://github.com/ljharb/js-traverse/commit/0ee24cc01673ea3dfd63e854b70bcd7b36b9884d)
- test for arity shows more bugs [`da698d6`](https://github.com/ljharb/js-traverse/commit/da698d6c7f5b712c9d89b3fa42a00b9cf2b42b4c)

## [v0.3.8](https://github.com/ljharb/js-traverse/compare/v0.3.7...v0.3.8) - 2011-06-06

### Commits

- tests for some bugs in deepEqual [`2b15a41`](https://github.com/ljharb/js-traverse/commit/2b15a410f723f0ed5b3bdc019803deff7d70b7c0)
- deep equal tests now pass, delete map tests fail though [`bfdc40e`](https://github.com/ljharb/js-traverse/commit/bfdc40e35f7a3ec3acf96f7f8599602747ef999d)
- delete map redux test also passes for deleted element construction syntax [,,,] etc [`56553ff`](https://github.com/ljharb/js-traverse/commit/56553ff7753e21480023caa488791a4d88f36673)
- now passing all the equality tests again [`6721461`](https://github.com/ljharb/js-traverse/commit/6721461c4fc1323c5784f16ee5efcd7a18d77122)
- tests for remove() and delete() [`f5d429a`](https://github.com/ljharb/js-traverse/commit/f5d429a15a77e2a7ce33c2485a2b3ee43f41d341)
- remove tests [`7010fe2`](https://github.com/ljharb/js-traverse/commit/7010fe2bdc568f59576da576c09b5a7c90291b89)
- better failing levels test for deepEqual [`73efbe5`](https://github.com/ljharb/js-traverse/commit/73efbe5ea5f2c61c8c3f6e4cd6fbc2d290e33188)
- failing deepEqual comparison with undefined throws [`0a6d27d`](https://github.com/ljharb/js-traverse/commit/0a6d27d139baefbd2a19411a6a4805b2bbd5d664)
- remove unused seq devDependency, bump expresso version [`0c1e021`](https://github.com/ljharb/js-traverse/commit/0c1e0218a991fa6fd71468ee54cdd364cab5d1b5)

## [v0.3.7](https://github.com/ljharb/js-traverse/compare/v0.3.6...v0.3.7) - 2011-06-05

### Commits

- now with syntax-highlightable markdown snippets [`d4a7710`](https://github.com/ljharb/js-traverse/commit/d4a771015d6483859784a585912a816bd4d82484)
- failing circular map scrub test [`9f36635`](https://github.com/ljharb/js-traverse/commit/9f3663533d34d4280c6dd49387a8516b40ae67c4)
- fix for immutable removal, bump to 0.3.7 [`9528471`](https://github.com/ljharb/js-traverse/commit/9528471cad4bbe810d7b10133f53ea0937e6667d)

## [v0.3.6](https://github.com/ljharb/js-traverse/compare/v0.3.5...v0.3.6) - 2011-06-03

### Commits

- tests for not-yet-written deepEqual() [`5267ae1`](https://github.com/ljharb/js-traverse/commit/5267ae183ac44d82438da0c3665a31c456e27fdb)
- deepEqual now passes several tests [`6fe06a5`](https://github.com/ljharb/js-traverse/commit/6fe06a5a7e7d76e4cdeaae148fbd40964a8bd478)
- dox for deepEqual [`5eab662`](https://github.com/ljharb/js-traverse/commit/5eab662f486e423e8d1d4bde65c47f99243aa1fe)
- untested get and set [`7fa7247`](https://github.com/ljharb/js-traverse/commit/7fa7247dcfe2b2ddcc0ea9ecd2c7329a1e034151)
- missing comma fixed the regexp test and also an implementation for typeof "function" [`fc23e4f`](https://github.com/ljharb/js-traverse/commit/fc23e4fb50e8adf0891c416c994390b02545a197)
- a passing test for the other case of structural deep circular reference checking [`04e5492`](https://github.com/ljharb/js-traverse/commit/04e54928da73b2d02a4430bfa79e2505af51068a)
- some tests were wrong, regexp test rightly still fails [`b9d1110`](https://github.com/ljharb/js-traverse/commit/b9d11107f62367453eaf707b2cb29df1533043ea)
- circular test for topological circular equality passes [`b423996`](https://github.com/ljharb/js-traverse/commit/b4239962ab0312d660a7895b74fda36368d057f9)
- and another test just in case for non-root circular ref checks [`a914717`](https://github.com/ljharb/js-traverse/commit/a9147171961cbf7ae8a9a45fb73cd3c0591da33b)
- actually check function equality, all tests now passing [`cb7c1b0`](https://github.com/ljharb/js-traverse/commit/cb7c1b04cb7b4b1037419349000e96b13d824ab7)

## [v0.3.5](https://github.com/ljharb/js-traverse/compare/v0.3.4...v0.3.5) - 2011-05-28

### Commits

- took out up-front cloning, only fails date test [`718d01b`](https://github.com/ljharb/js-traverse/commit/718d01b06cdb9f9c948d1ac5886a7a3fc17d1008)
- cleaned up root handling, fails circDubMap still [`9ed99f3`](https://github.com/ljharb/js-traverse/commit/9ed99f3dd74123c17eb2787bfac6207c643d39d6)
- updated tests for expresso updates ages ago [`f95bf5e`](https://github.com/ljharb/js-traverse/commit/f95bf5e0eb7300832d326960289ec7f395630bfd)
- passes all its tests again [`d0dac52`](https://github.com/ljharb/js-traverse/commit/d0dac529201dc8b3e6a7dba3d853d839b746ffbf)

## [v0.3.4](https://github.com/ljharb/js-traverse/compare/v0.3.3...v0.3.4) - 2011-04-16

### Commits

- updated readme for this.delete() and this.remove() [`e4cea30`](https://github.com/ljharb/js-traverse/commit/e4cea309a1f035400c8f4e9ebd55e6e0cecf8a35)
- quote the delete keyword [`42d0460`](https://github.com/ljharb/js-traverse/commit/42d0460fc6624a38775bd65a4788cfa8b3f08825)

## [v0.3.3](https://github.com/ljharb/js-traverse/compare/v0.3.2...v0.3.3) - 2011-04-15

### Commits

- this.remove() and this.delete() with passing tests [`d603771`](https://github.com/ljharb/js-traverse/commit/d603771e1381e0d62c70bc1f47736c8eaa6cfa6f)

## [v0.3.2](https://github.com/ljharb/js-traverse/compare/v0.3.1...v0.3.2) - 2011-04-10

### Commits

- now traverses over dates correctly and should work for other builtins [`bb8d1b5`](https://github.com/ljharb/js-traverse/commit/bb8d1b567489a94507941f4a6bda2224ed2d9692)
- failing date map test [`a504425`](https://github.com/ljharb/js-traverse/commit/a504425aa3021371f67498b27d4a98e6f7a4283f)
- forgot the console.dir [`fb2c472`](https://github.com/ljharb/js-traverse/commit/fb2c4729ac1a7824358ee04ea840a35ac3ea17af)

## [v0.3.1](https://github.com/ljharb/js-traverse/compare/v0.3.0...v0.3.1) - 2011-02-18

### Commits

- updated readme and examples for the new interface changes [`aa2d4f3`](https://github.com/ljharb/js-traverse/commit/aa2d4f3f1cc88a230cdb8fae3b1b416773860ef4)
- mutability tests all pass [`36df874`](https://github.com/ljharb/js-traverse/commit/36df874ae431b0e31dc809c0b949073774f624b4)
- updated tests to not use sys anymore [`7a0969f`](https://github.com/ljharb/js-traverse/commit/7a0969fbb39a7a66f4bd46ca8172edef15b675ea)
- simpler clone implementation [`6a6cb49`](https://github.com/ljharb/js-traverse/commit/6a6cb49f2da571470a6b024b1e8db5ef2080b946)
- double circular ref test failing, not aggressive enough [`d190897`](https://github.com/ljharb/js-traverse/commit/d190897a9763549e2a077c01378520d519b402f7)
- reduce() now too [`c89ae4b`](https://github.com/ljharb/js-traverse/commit/c89ae4be025534494422cc1265f50595828398b3)
- fix for isRoot, check path.length, not node === root [`423066e`](https://github.com/ljharb/js-traverse/commit/423066e821070ffb8f8a29022175b08f4bfc5d99)
- passing circular ref update forEach test but failing for likewise with map [`d411695`](https://github.com/ljharb/js-traverse/commit/d4116955a4fbc00a2fd716e3885e334b9664d670)
- trade some space savings for less agressive circular reference algorithm (the same as console.dir it seems) [`ee52d80`](https://github.com/ljharb/js-traverse/commit/ee52d80d2b18ea069f38039b210f68b00aa29d4b)
- failing test for circular ref updates [`42b6b84`](https://github.com/ljharb/js-traverse/commit/42b6b84917f34f80729339127360c36bd62fa9bd)

## [v0.3.0](https://github.com/ljharb/js-traverse/compare/v0.2.4...v0.3.0) - 2011-02-18

### Commits

- completely rewrote Traverse, deleted hash.js and web.js [`414c726`](https://github.com/ljharb/js-traverse/commit/414c72637807c0e6e86f38f66146d729d0bbf3f2)
- tests pass again with the rewrite [`f0f76cc`](https://github.com/ljharb/js-traverse/commit/f0f76cc6b08849644a79a828e249be2d8896797a)

## [v0.2.4](https://github.com/ljharb/js-traverse/compare/v0.2.3...v0.2.4) - 2011-02-03

### Commits

- for some silly reason I was requiring sys [`95712d9`](https://github.com/ljharb/js-traverse/commit/95712d9de9e6182860418754690bb98c40462d62)

## [v0.2.3](https://github.com/ljharb/js-traverse/compare/v0.2.2...v0.2.3) - 2010-11-19

### Commits

- a hash exclude test and a package bump [`536b93d`](https://github.com/ljharb/js-traverse/commit/536b93dc0474a27a0f5c3f53b8a80cf3eb32e4e4)
- exclude to remove keys [`752f64f`](https://github.com/ljharb/js-traverse/commit/752f64f66da9fb424a4f78fc2d4ad0ef096ba65d)

## [v0.2.2](https://github.com/ljharb/js-traverse/compare/v0.2.1...v0.2.2) - 2010-10-25

### Commits

- detect test, package bump [`04b1d50`](https://github.com/ljharb/js-traverse/commit/04b1d50e73870026fd21ab9ccea609c3f1351080)
- detect like in ruby [`441f3b4`](https://github.com/ljharb/js-traverse/commit/441f3b4bef547cb4b07b10e139fa68ec1b9b4a95)

## [v0.2.1](https://github.com/ljharb/js-traverse/compare/v0.2.0...v0.2.1) - 2010-09-11

### Commits

- better compatability fallbacks for ff, maybe ie [`33577aa`](https://github.com/ljharb/js-traverse/commit/33577aae0ccdc441e40fab0a945d831805cc8148)
- compact and size for Hash (can't do .length since the function prototype has that) [`b9e6db5`](https://github.com/ljharb/js-traverse/commit/b9e6db57addbcc67a1cfec0ab9a380573d0cab8e)
- more correct string behavior in stringify example [`b9750ff`](https://github.com/ljharb/js-traverse/commit/b9750ff32be6ad76892bdf01a533bd13907d92f7)

## [v0.2.0](https://github.com/ljharb/js-traverse/compare/v0.1.4...v0.2.0) - 2010-09-08

### Commits

- deepEquals to make the tests simpler [`a962ed8`](https://github.com/ljharb/js-traverse/commit/a962ed8d0e5e3baf8279e5b3bf2476e5d2c7dbb8)
- top-level Hash functions more closely mirror Hash() functions [`35298be`](https://github.com/ljharb/js-traverse/commit/35298be61b782681f6d0a555a0ab8db673419293)
- .has with tests [`02727cf`](https://github.com/ljharb/js-traverse/commit/02727cfe1d86cf6c36daa700513861fe1f4a8066)
- test for valuesAt and now takes a single non-array key too [`3487771`](https://github.com/ljharb/js-traverse/commit/348777160fe2008186d5089fddd8e5686d0c1c3a)
- take out memoization since it breaks if the hash gets modified outside the fluent interface [`67b6d3d`](https://github.com/ljharb/js-traverse/commit/67b6d3d5ea7d8ed7127f7f9129660510f9292716)
- zip and zip constructor [`616514e`](https://github.com/ljharb/js-traverse/commit/616514ebd72a9c8a4e4b59763ee0462dcae89de0)
- zip test passes [`0226636`](https://github.com/ljharb/js-traverse/commit/0226636db7b8d3a49c2a7cbb26d18f7eeba061c1)

## [v0.1.4](https://github.com/ljharb/js-traverse/compare/v0.1.3...v0.1.4) - 2010-09-08

### Commits

- test for compact passes [`ec171ba`](https://github.com/ljharb/js-traverse/commit/ec171bab4d2b2339752cbab00c0d4b65652de0f0)
- compact like in ruby, but for hashes [`0d8e1e6`](https://github.com/ljharb/js-traverse/commit/0d8e1e624005b58aecd6a6dddaefc20da33cdf4a)

## [v0.1.3](https://github.com/ljharb/js-traverse/compare/v0.1.2...v0.1.3) - 2010-09-04

### Commits

- add stringify to examples [`6683529`](https://github.com/ljharb/js-traverse/commit/668352964878c1f896b3f57b69a989717c0fae5c)
- now isArray and instanceof works for arrays [`fa2d72b`](https://github.com/ljharb/js-traverse/commit/fa2d72b33705adccc74bf12e94e4e68d7261469c)

## [v0.1.2](https://github.com/ljharb/js-traverse/compare/v0.1.1...v0.1.2) - 2010-09-04

### Commits

- pushed walk() out of map [`e7ec7de`](https://github.com/ljharb/js-traverse/commit/e7ec7dee4b33968b0b380e54202d5d01af5e9a80)
- modifiers seem to work [`f0ee567`](https://github.com/ljharb/js-traverse/commit/f0ee567968c4b218ae729d76520ab2f3fe2c372f)
- stringify test for new modifiers [`6de18e5`](https://github.com/ljharb/js-traverse/commit/6de18e5012578b4a71faf442962ce999fc72624c)
- before, after, and between callbacks to fancier traversing [`5662b6f`](https://github.com/ljharb/js-traverse/commit/5662b6f5265bfec32dccb999b9749cf2569e7d9f)
- updated readme and negative example with new style [`5aa3f84`](https://github.com/ljharb/js-traverse/commit/5aa3f84584fb1a74652485e3cf809f5982a4cb88)
- deprecated .get() in favor of .value [`a8d1645`](https://github.com/ljharb/js-traverse/commit/a8d1645665ebb832ff82eca3317e61bf62ca83ed)
- non-coerced root test fixes an odd bug with array traversal [`f22580a`](https://github.com/ljharb/js-traverse/commit/f22580aacec7b2eb60c38ba8ba1b89324ed3e209)

## [v0.1.1](https://github.com/ljharb/js-traverse/compare/v0.1.0...v0.1.1) - 2010-09-04

### Commits

- only update when this.update is still around, tests for Traverse.functions [`cc59d56`](https://github.com/ljharb/js-traverse/commit/cc59d56b994759f6acd9efd70d9063ea40f45fbf)
- deprecate modify in favor of map [`f018025`](https://github.com/ljharb/js-traverse/commit/f018025989afdd6c9474d9e9095331500826d553)
- fix nodes and paths [`78edd30`](https://github.com/ljharb/js-traverse/commit/78edd30685e1d47deac4edd7bdd1e1b360a0244f)
- use return values to auto-update [`bc68fa5`](https://github.com/ljharb/js-traverse/commit/bc68fa5426363872835f1b4b73b8abf7920c9bfc)

## [v0.1.0](https://github.com/ljharb/js-traverse/compare/v0.0.9...v0.1.0) - 2010-09-03

### Commits

- circular refs don't crash it now [`2cdd854`](https://github.com/ljharb/js-traverse/commit/2cdd85460054f91e3130b269a6020e20cb59d7c0)
- new top-level map forEach paths and nodes [`e508823`](https://github.com/ljharb/js-traverse/commit/e5088233c9e09221f2ac766bd95c0ea55e7d0761)
- package bump to 0.1.0 and should work in IE better now too [`4400d88`](https://github.com/ljharb/js-traverse/commit/4400d886d7e33dd811121e7cd5ac5a31a0ca25b0)

## [v0.0.9](https://github.com/ljharb/js-traverse/compare/v0.0.8...v0.0.9) - 2010-08-27

### Commits

- broke up test into separate exports [`92046a4`](https://github.com/ljharb/js-traverse/commit/92046a4e0622d0db9502a2d6090041935d1bede6)
- forgot the return in ('traverse/web').source() [`188ee17`](https://github.com/ljharb/js-traverse/commit/188ee170de8b087a6bbec6dad92b39a0f1ffc67e)

## [v0.0.8](https://github.com/ljharb/js-traverse/compare/v0.0.7...v0.0.8) - 2010-08-26

### Commits

- memoization for keys, values, length [`9cffe15`](https://github.com/ljharb/js-traverse/commit/9cffe158a70f4945a6bf000dace4eddf4ca2c344)
- merge, update, and tap [`df5b737`](https://github.com/ljharb/js-traverse/commit/df5b737a7b82711261be325b7f9aa0e7aedc6804)
- length, clone, and copy [`249ec0f`](https://github.com/ljharb/js-traverse/commit/249ec0fcd2b62c6701488c17083433049060ae15)
- updated readme and f.call(self) [`03f6f1e`](https://github.com/ljharb/js-traverse/commit/03f6f1e03c9ccc2a6afb0525393acde13d2b009f)
- more explicit about the licensing (MIT/X11) [`c452103`](https://github.com/ljharb/js-traverse/commit/c4521038e845878ebb20984204f1db7520df9cad)
- oh right and this example file [`d98c125`](https://github.com/ljharb/js-traverse/commit/d98c125d9f9f17ca08260ed57ede2b1fac26da11)
- updated readme for hash traversal [`a56b629`](https://github.com/ljharb/js-traverse/commit/a56b629aae33e6bfe45bc3ec72b65bc84536f57b)
- tests for update, concat, and merge all pass [`7fc4eca`](https://github.com/ljharb/js-traverse/commit/7fc4ecaf203924becd9c88d800216ddad7ecbd4b)
- updated readme for hash stuff [`094ab55`](https://github.com/ljharb/js-traverse/commit/094ab556f795e554e8227016d8fd6acc36f0257c)
- more tests, all pass [`2d9f7a2`](https://github.com/ljharb/js-traverse/commit/2d9f7a245ac6793e8e58ba4c751e551650cfbaac)
- key and value getters [`459def9`](https://github.com/ljharb/js-traverse/commit/459def9529e381d38909f75b182b330e20d3f2f9)
- stupid markdown parens [`0bd932b`](https://github.com/ljharb/js-traverse/commit/0bd932bc6517d08f02ab3aac8cc551425072ead7)
- new valuesAt and extract functions [`883f015`](https://github.com/ljharb/js-traverse/commit/883f015c79ea79acc188a98be3bfa7ad54186266)
- tests for valuesAt and extract pass [`86d71a9`](https://github.com/ljharb/js-traverse/commit/86d71a97241ff84b071a0ff4aed68a99919014ff)
- hash example, some() [`c7a133c`](https://github.com/ljharb/js-traverse/commit/c7a133cbb59d5fa9aedfe3958b9a0898fc5dea4c)
- key and value tests [`92212e5`](https://github.com/ljharb/js-traverse/commit/92212e55cfb1f16f68c14885d644125a83951589)
- copy instead of clone for merge [`4fcece2`](https://github.com/ljharb/js-traverse/commit/4fcece2de64fbe90ef0250f31f4f399a103ec7ed)

## [v0.0.7](https://github.com/ljharb/js-traverse/compare/v0.0.6...v0.0.7) - 2010-08-26

### Commits

- new hash lib and clone sugar [`586124c`](https://github.com/ljharb/js-traverse/commit/586124cebb2b613ee63d0c76a0d636058c5c9213)
- hash test for map [`393444a`](https://github.com/ljharb/js-traverse/commit/393444a2add24b9dba4f68385518b96a3900de33)
- a test for instances [`1adf75a`](https://github.com/ljharb/js-traverse/commit/1adf75a9cdc13b094b660f17bc496a94fd9576fd)
- new modules format for package.json, boost to 0.0.7 [`0f11600`](https://github.com/ljharb/js-traverse/commit/0f11600d5cfb67b50fb4f4f79dda522d17c9df4f)
- __proto__ trick to make instanceof work on cloned objects [`130a833`](https://github.com/ljharb/js-traverse/commit/130a833014477b7463cb8fbf4de246fd93f990a5)

## [v0.0.6](https://github.com/ljharb/js-traverse/compare/v0.0.5...v0.0.6) - 2010-08-01

### Commits

- magical webified version of traverse with require('dnode/web').source() [`0043cd6`](https://github.com/ljharb/js-traverse/commit/0043cd6b57327a0d1962b7378e9f6897d963e3c0)
- directories.lib, I forgot. Also scrub requires for later [`2a1f530`](https://github.com/ljharb/js-traverse/commit/2a1f5301601984b09a1746bd0b1699fb88a18264)

## [v0.0.5](https://github.com/ljharb/js-traverse/compare/v0.0.4...v0.0.5) - 2010-07-28

### Commits

- test for stupid .constructor() bug [`6b9d85d`](https://github.com/ljharb/js-traverse/commit/6b9d85dac5eedd3e043c63fe2cff4881c25f9f98)
- stupid traversal bug, version bump [`4cf36f3`](https://github.com/ljharb/js-traverse/commit/4cf36f3f987a71704064dd6ab6b695ddce0cac47)

## [v0.0.4](https://github.com/ljharb/js-traverse/compare/v0.0.3...v0.0.4) - 2010-07-27

### Commits

- now using expresso for test suite, json test written [`7d448da`](https://github.com/ljharb/js-traverse/commit/7d448daa7c93444b302095da394f8f47bf3fb61f)
- leaves and negative tests to go with the example, also s/tests/test/ [`13e19bf`](https://github.com/ljharb/js-traverse/commit/13e19bf5441abc903a270eb5abfc985d75a7507b)
- clone in the constructor so updates don't mess up the root object's refs [`fc5903b`](https://github.com/ljharb/js-traverse/commit/fc5903b3b008377d7f06e83ad3bce84957900c8c)
- readme updates for expresso tests and version bump to 0.0.4 [`6993515`](https://github.com/ljharb/js-traverse/commit/69935153c1b54afaee42c58c8e33f15d21f55efe)

## [v0.0.3](https://github.com/ljharb/js-traverse/compare/v0.0.2...v0.0.3) - 2010-07-21

### Commits

- backwards compatible update for var Traverse = require('traverse') style [`d0f50e9`](https://github.com/ljharb/js-traverse/commit/d0f50e9a6f428b68fc51e1c582148196deb9e209)

## [v0.0.2](https://github.com/ljharb/js-traverse/compare/v0.0.1...v0.0.2) - 2010-07-14

### Commits

- special check for null, for which typeof(null) == 'object' [`a4128c0`](https://github.com/ljharb/js-traverse/commit/a4128c01a666132b40c69d57d9176a33a1f5046c)
- installation in readme [`a6fc0d6`](https://github.com/ljharb/js-traverse/commit/a6fc0d641970984fefab29773a930f22c925eb91)
- add output to negative example [`590045e`](https://github.com/ljharb/js-traverse/commit/590045e3bc9daf8dbb884f59b3579bf57a7dc42d)
- license file [`519fd1f`](https://github.com/ljharb/js-traverse/commit/519fd1ff6d225d2465899d102519e93ef5334bba)
- s/127/128/ [`5fcb3f5`](https://github.com/ljharb/js-traverse/commit/5fcb3f5256207e392e9500db720aa2aeb3f85304)

## v0.0.1 - 2010-07-08

### Commits

- initial commit with forEach, modify, get, paths, nodes [`e73bba8`](https://github.com/ljharb/js-traverse/commit/e73bba81dbc8630a0ef6003fa3c12ceaafc4188d)
- more examples [`16bf66e`](https://github.com/ljharb/js-traverse/commit/16bf66e5cf5c537441a98001eae9368d4bae7317)
- readme with json example [`fa8265b`](https://github.com/ljharb/js-traverse/commit/fa8265badad1dfe3df5d1aa6e561a3698e4b1338)
- json example [`607de69`](https://github.com/ljharb/js-traverse/commit/607de691cd1bdeb0ced603d5177e3f855dc20417)
- leaf example [`23ccea5`](https://github.com/ljharb/js-traverse/commit/23ccea575ce9b6984fcd8bb64ccd7f9ee765c258)
- package.json file for version 0.0.1 [`c3266e0`](https://github.com/ljharb/js-traverse/commit/c3266e060d8b5ebfb6472385dba323c7e951fd14)
- npm doesn't like newlines in package.json strings [`6840d4e`](https://github.com/ljharb/js-traverse/commit/6840d4e7c75aaafeca6778a48600759641dfa7f1)
