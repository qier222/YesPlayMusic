import ArtistInline, { ArtistInlineUI } from './ArtistsInline';

/**
 * 多名歌手的情況。
 */
const multipleArtistsMock = [
    {
        id: 1,
        name: "Bruno Mars",
    },
    {
        // id: 2,
        name: "Jayesslee",
    },
    {
        id: 3,
        name: "Midnight Kids",
    }
] as unknown as Artist[];

/**
 * 單名歌手的情況
 */
const singleArtistMock = [multipleArtistsMock[0]]

export default function ArtistsInlineStory() {
    return <ArtistInlineUI artists={multipleArtistsMock} onArtistClicked={() => null} ></ArtistInlineUI>
}
