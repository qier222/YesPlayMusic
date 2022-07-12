export interface AppleMusicAlbum {
  attributes: {
    name: string
    artistName: string
    editorialVideo: {
      motionSquareVideo1x1: {
        video: string
      }
    }
    editorialNotes: {
      short: string
      standard: string
    }
  }
}

export interface AppleMusicArtist {
  attributes: {
    name: string
    artistBio: string
    editorialVideo: {
      motionArtistSquare1x1: {
        video: string
      }
    }
    artwork: {
      url: string
    }
  }
}
