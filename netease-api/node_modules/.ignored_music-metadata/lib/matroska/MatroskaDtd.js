"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.elements = void 0;
const types_1 = require("./types");
/**
 * Elements of document type description
 * Derived from https://github.com/tungol/EBML/blob/master/doctypes/matroska.dtd
 * Extended with:
 * - https://www.matroska.org/technical/specs/index.html
 */
exports.elements = {
    0x1a45dfa3: {
        name: 'ebml',
        container: {
            0x4286: { name: 'ebmlVersion', value: types_1.DataType.uint },
            0x42f7: { name: 'ebmlReadVersion', value: types_1.DataType.uint },
            0x42f2: { name: 'ebmlMaxIDWidth', value: types_1.DataType.uint },
            0x42f3: { name: 'ebmlMaxSizeWidth', value: types_1.DataType.uint },
            0x4282: { name: 'docType', value: types_1.DataType.string },
            0x4287: { name: 'docTypeVersion', value: types_1.DataType.uint },
            0x4285: { name: 'docTypeReadVersion', value: types_1.DataType.uint } // 5.1.7
        }
    },
    // Matroska segments
    0x18538067: {
        name: 'segment',
        container: {
            // Meta Seek Information
            0x114d9b74: {
                name: 'seekHead',
                container: {
                    0x4dbb: {
                        name: 'seek',
                        container: {
                            0x53ab: { name: 'seekId', value: types_1.DataType.binary },
                            0x53ac: { name: 'seekPosition', value: types_1.DataType.uint }
                        }
                    }
                }
            },
            // Segment Information
            0x1549a966: {
                name: 'info',
                container: {
                    0x73a4: { name: 'uid', value: types_1.DataType.uid },
                    0x7384: { name: 'filename', value: types_1.DataType.string },
                    0x3cb923: { name: 'prevUID', value: types_1.DataType.uid },
                    0x3c83ab: { name: 'prevFilename', value: types_1.DataType.string },
                    0x3eb923: { name: 'nextUID', value: types_1.DataType.uid },
                    0x3e83bb: { name: 'nextFilename', value: types_1.DataType.string },
                    0x2ad7b1: { name: 'timecodeScale', value: types_1.DataType.uint },
                    0x4489: { name: 'duration', value: types_1.DataType.float },
                    0x4461: { name: 'dateUTC', value: types_1.DataType.uint },
                    0x7ba9: { name: 'title', value: types_1.DataType.string },
                    0x4d80: { name: 'muxingApp', value: types_1.DataType.string },
                    0x5741: { name: 'writingApp', value: types_1.DataType.string }
                }
            },
            // Cluster
            0x1f43b675: {
                name: 'cluster',
                multiple: true,
                container: {
                    0xe7: { name: 'timecode', value: types_1.DataType.uid },
                    0xa3: { name: 'unknown', value: types_1.DataType.binary },
                    0xa7: { name: 'position', value: types_1.DataType.uid },
                    0xab: { name: 'prevSize', value: types_1.DataType.uid }
                }
            },
            // Track
            0x1654ae6b: {
                name: 'tracks',
                container: {
                    0xae: {
                        name: 'entries',
                        multiple: true,
                        container: {
                            0xd7: { name: 'trackNumber', value: types_1.DataType.uint },
                            0x73c5: { name: 'uid', value: types_1.DataType.uid },
                            0x83: { name: 'trackType', value: types_1.DataType.uint },
                            0xb9: { name: 'flagEnabled', value: types_1.DataType.bool },
                            0x88: { name: 'flagDefault', value: types_1.DataType.bool },
                            0x55aa: { name: 'flagForced', value: types_1.DataType.bool },
                            0x9c: { name: 'flagLacing', value: types_1.DataType.bool },
                            0x6de7: { name: 'minCache', value: types_1.DataType.uint },
                            0x6de8: { name: 'maxCache', value: types_1.DataType.uint },
                            0x23e383: { name: 'defaultDuration', value: types_1.DataType.uint },
                            0x23314f: { name: 'timecodeScale', value: types_1.DataType.float },
                            0x536e: { name: 'name', value: types_1.DataType.string },
                            0x22b59c: { name: 'language', value: types_1.DataType.string },
                            0x86: { name: 'codecID', value: types_1.DataType.string },
                            0x63a2: { name: 'codecPrivate', value: types_1.DataType.binary },
                            0x258688: { name: 'codecName', value: types_1.DataType.string },
                            0x3a9697: { name: 'codecSettings', value: types_1.DataType.string },
                            0x3b4040: { name: 'codecInfoUrl', value: types_1.DataType.string },
                            0x26b240: { name: 'codecDownloadUrl', value: types_1.DataType.string },
                            0xaa: { name: 'codecDecodeAll', value: types_1.DataType.bool },
                            0x6fab: { name: 'trackOverlay', value: types_1.DataType.uint },
                            // Video
                            0xe0: {
                                name: 'video',
                                container: {
                                    0x9a: { name: 'flagInterlaced', value: types_1.DataType.bool },
                                    0x53b8: { name: 'stereoMode', value: types_1.DataType.uint },
                                    0xb0: { name: 'pixelWidth', value: types_1.DataType.uint },
                                    0xba: { name: 'pixelHeight', value: types_1.DataType.uint },
                                    0x54b0: { name: 'displayWidth', value: types_1.DataType.uint },
                                    0x54ba: { name: 'displayHeight', value: types_1.DataType.uint },
                                    0x54b3: { name: 'aspectRatioType', value: types_1.DataType.uint },
                                    0x2eb524: { name: 'colourSpace', value: types_1.DataType.uint },
                                    0x2fb523: { name: 'gammaValue', value: types_1.DataType.float }
                                }
                            },
                            // Audio
                            0xe1: {
                                name: 'audio',
                                container: {
                                    0xb5: { name: 'samplingFrequency', value: types_1.DataType.float },
                                    0x78b5: { name: 'outputSamplingFrequency', value: types_1.DataType.float },
                                    0x9f: { name: 'channels', value: types_1.DataType.uint },
                                    0x94: { name: 'channels', value: types_1.DataType.uint },
                                    0x7d7b: { name: 'channelPositions', value: types_1.DataType.binary },
                                    0x6264: { name: 'bitDepth', value: types_1.DataType.uint }
                                }
                            },
                            // Content Encoding
                            0x6d80: {
                                name: 'contentEncodings',
                                container: {
                                    0x6240: {
                                        name: 'contentEncoding',
                                        container: {
                                            0x5031: { name: 'order', value: types_1.DataType.uint },
                                            0x5032: { name: 'scope', value: types_1.DataType.bool },
                                            0x5033: { name: 'type', value: types_1.DataType.uint },
                                            0x5034: {
                                                name: 'contentEncoding',
                                                container: {
                                                    0x4254: { name: 'contentCompAlgo', value: types_1.DataType.uint },
                                                    0x4255: { name: 'contentCompSettings', value: types_1.DataType.binary }
                                                }
                                            },
                                            0x5035: {
                                                name: 'contentEncoding',
                                                container: {
                                                    0x47e1: { name: 'contentEncAlgo', value: types_1.DataType.uint },
                                                    0x47e2: { name: 'contentEncKeyID', value: types_1.DataType.binary },
                                                    0x47e3: { name: 'contentSignature ', value: types_1.DataType.binary },
                                                    0x47e4: { name: 'ContentSigKeyID  ', value: types_1.DataType.binary },
                                                    0x47e5: { name: 'contentSigAlgo ', value: types_1.DataType.uint },
                                                    0x47e6: { name: 'contentSigHashAlgo ', value: types_1.DataType.uint }
                                                }
                                            },
                                            0x6264: { name: 'bitDepth', value: types_1.DataType.uint }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            // Cueing Data
            0x1c53bb6b: {
                name: 'cues',
                container: {
                    0xbb: {
                        name: 'cuePoint',
                        container: {
                            0xb3: { name: 'cueTime', value: types_1.DataType.uid },
                            0xb7: {
                                name: 'positions',
                                container: {
                                    0xf7: { name: 'track', value: types_1.DataType.uint },
                                    0xf1: { name: 'clusterPosition', value: types_1.DataType.uint },
                                    0x5378: { name: 'blockNumber', value: types_1.DataType.uint },
                                    0xea: { name: 'codecState', value: types_1.DataType.uint },
                                    0xdb: {
                                        name: 'reference', container: {
                                            0x96: { name: 'time', value: types_1.DataType.uint },
                                            0x97: { name: 'cluster', value: types_1.DataType.uint },
                                            0x535f: { name: 'number', value: types_1.DataType.uint },
                                            0xeb: { name: 'codecState', value: types_1.DataType.uint }
                                        }
                                    },
                                    0xf0: { name: 'relativePosition', value: types_1.DataType.uint } // extended
                                }
                            }
                        }
                    }
                }
            },
            // Attachment
            0x1941a469: {
                name: 'attachments',
                container: {
                    0x61a7: {
                        name: 'attachedFiles',
                        multiple: true,
                        container: {
                            0x467e: { name: 'description', value: types_1.DataType.string },
                            0x466e: { name: 'name', value: types_1.DataType.string },
                            0x4660: { name: 'mimeType', value: types_1.DataType.string },
                            0x465c: { name: 'data', value: types_1.DataType.binary },
                            0x46ae: { name: 'uid', value: types_1.DataType.uid }
                        }
                    }
                }
            },
            // Chapters
            0x1043a770: {
                name: 'chapters',
                container: {
                    0x45b9: {
                        name: 'editionEntry',
                        container: {
                            0xb6: {
                                name: 'chapterAtom',
                                container: {
                                    0x73c4: { name: 'uid', value: types_1.DataType.uid },
                                    0x91: { name: 'timeStart', value: types_1.DataType.uint },
                                    0x92: { name: 'timeEnd', value: types_1.DataType.uid },
                                    0x98: { name: 'hidden', value: types_1.DataType.bool },
                                    0x4598: { name: 'enabled', value: types_1.DataType.uid },
                                    0x8f: { name: 'track', container: {
                                            0x89: { name: 'trackNumber', value: types_1.DataType.uid },
                                            0x80: {
                                                name: 'display', container: {
                                                    0x85: { name: 'string', value: types_1.DataType.string },
                                                    0x437c: { name: 'language ', value: types_1.DataType.string },
                                                    0x437e: { name: 'country ', value: types_1.DataType.string }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            // Tagging
            0x1254c367: {
                name: 'tags',
                container: {
                    0x7373: {
                        name: 'tag',
                        multiple: true,
                        container: {
                            0x63c0: {
                                name: 'target',
                                container: {
                                    0x63c5: { name: 'tagTrackUID', value: types_1.DataType.uid },
                                    0x63c4: { name: 'tagChapterUID', value: types_1.DataType.uint },
                                    0x63c6: { name: 'tagAttachmentUID', value: types_1.DataType.uid },
                                    0x63ca: { name: 'targetType', value: types_1.DataType.string },
                                    0x68ca: { name: 'targetTypeValue', value: types_1.DataType.uint },
                                    0x63c9: { name: 'tagEditionUID', value: types_1.DataType.uid } // extended
                                }
                            },
                            0x67c8: {
                                name: 'simpleTags',
                                multiple: true,
                                container: {
                                    0x45a3: { name: 'name', value: types_1.DataType.string },
                                    0x4487: { name: 'string', value: types_1.DataType.string },
                                    0x4485: { name: 'binary', value: types_1.DataType.binary },
                                    0x447a: { name: 'language', value: types_1.DataType.string },
                                    0x447b: { name: 'languageIETF', value: types_1.DataType.string },
                                    0x4484: { name: 'default', value: types_1.DataType.bool } // extended
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};
