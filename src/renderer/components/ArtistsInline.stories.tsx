import { ArtistInlineProps, ArtistInlineUI } from './ArtistsInline';
import type { Story } from "@ladle/react";

const artists = [
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

export const MultipleArtists: Story<ArtistInlineProps> = (props) => (
    <div className="w-24">
        <ArtistInlineUI onArtistClicked={() => null} {...props} />
    </div>
)
MultipleArtists.args = {
    artists: artists,
    className: '',
    disableLink: false,
    clampLine: true,
}

export const SingleArtist: Story<ArtistInlineProps> = (p) => <MultipleArtists {...p} />
SingleArtist.args = {
    artists: [artists[0]],
    className: '',
    disableLink: false,
    clampLine: true,
}
