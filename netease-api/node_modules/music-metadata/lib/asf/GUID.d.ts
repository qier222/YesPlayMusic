/// <reference types="node" />
/**
 * Ref:
 * - https://tools.ietf.org/html/draft-fleischman-asf-01, Appendix A: ASF GUIDs
 * - http://drang.s4.xrea.com/program/tips/id3tag/wmp/10_asf_guids.html
 * - http://drang.s4.xrea.com/program/tips/id3tag/wmp/index.html
 * - http://drang.s4.xrea.com/program/tips/id3tag/wmp/10_asf_guids.html
 *
 * ASF File Structure:
 * - https://msdn.microsoft.com/en-us/library/windows/desktop/ee663575(v=vs.85).aspx
 *
 * ASF GUIDs:
 * - http://drang.s4.xrea.com/program/tips/id3tag/wmp/10_asf_guids.html
 * - https://github.com/dji-sdk/FFmpeg/blob/master/libavformat/asf.c
 */
export default class GUID {
    str: string;
    static HeaderObject: GUID;
    static DataObject: GUID;
    static SimpleIndexObject: GUID;
    static IndexObject: GUID;
    static MediaObjectIndexObject: GUID;
    static TimecodeIndexObject: GUID;
    static FilePropertiesObject: GUID;
    static StreamPropertiesObject: GUID;
    static HeaderExtensionObject: GUID;
    static CodecListObject: GUID;
    static ScriptCommandObject: GUID;
    static MarkerObject: GUID;
    static BitrateMutualExclusionObject: GUID;
    static ErrorCorrectionObject: GUID;
    static ContentDescriptionObject: GUID;
    static ExtendedContentDescriptionObject: GUID;
    static ContentBrandingObject: GUID;
    static StreamBitratePropertiesObject: GUID;
    static ContentEncryptionObject: GUID;
    static ExtendedContentEncryptionObject: GUID;
    static DigitalSignatureObject: GUID;
    static PaddingObject: GUID;
    static ExtendedStreamPropertiesObject: GUID;
    static AdvancedMutualExclusionObject: GUID;
    static GroupMutualExclusionObject: GUID;
    static StreamPrioritizationObject: GUID;
    static BandwidthSharingObject: GUID;
    static LanguageListObject: GUID;
    static MetadataObject: GUID;
    static MetadataLibraryObject: GUID;
    static IndexParametersObject: GUID;
    static MediaObjectIndexParametersObject: GUID;
    static TimecodeIndexParametersObject: GUID;
    static CompatibilityObject: GUID;
    static AdvancedContentEncryptionObject: GUID;
    static AudioMedia: GUID;
    static VideoMedia: GUID;
    static CommandMedia: GUID;
    static JFIF_Media: GUID;
    static Degradable_JPEG_Media: GUID;
    static FileTransferMedia: GUID;
    static BinaryMedia: GUID;
    static ASF_Index_Placeholder_Object: GUID;
    static fromBin(bin: Buffer, offset?: number): GUID;
    /**
     * Decode GUID in format like "B503BF5F-2EA9-CF11-8EE3-00C00C205365"
     * @param objectId Binary GUID
     * @param offset Read offset in bytes, default 0
     * @returns GUID as dashed hexadecimal representation
     */
    static decode(objectId: Buffer, offset?: number): string;
    /**
     * Decode stream type
     * @param mediaType Media type GUID
     * @returns Media type
     */
    static decodeMediaType(mediaType: GUID): 'audio' | 'video' | 'command' | 'degradable-jpeg' | 'file-transfer' | 'binary' | undefined;
    /**
     * Encode GUID
     * @param guid GUID like: "B503BF5F-2EA9-CF11-8EE3-00C00C205365"
     * @returns Encoded Binary GUID
     */
    static encode(str: string): Buffer;
    constructor(str: string);
    equals(guid: GUID): boolean;
    toBin(): Buffer;
}
