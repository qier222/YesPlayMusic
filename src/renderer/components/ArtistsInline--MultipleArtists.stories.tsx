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

export const ArtistsInlineStory: Story<ArtistInlineProps> = (props) => (
    <div className="w-24">
        <ArtistInlineUI onArtistClicked={() => null} {...props} />
    </div>
)

ArtistsInlineStory.args = {
    artists: artists,
    className: '',
    disableLink: false,
    clampLine: true,
}
