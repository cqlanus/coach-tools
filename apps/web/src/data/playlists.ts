export interface Playlist {
  id: string;
  label: string;
  playlistId: string;
}

export const PLAYLISTS: Playlist[] = [
  { id: "hitting",   label: "Hitting",              playlistId: "PLiyH4Ka2W-FXkQoos-B2TDIkKjLYCpgnA" },
  { id: "throwing",  label: "Throwing & Pitching",  playlistId: "PLiyH4Ka2W-FV0SZOK0Fu1CI77cCYW-p5z" },
  { id: "fielding",  label: "Catching & Fielding",  playlistId: "PLiyH4Ka2W-FWGS97QBBzSPv-T4r3CZIYL" },
  { id: "situations",label: "Situations",            playlistId: "PLiyH4Ka2W-FUkJrWbj1GLrl3wyl4K3hwP" },
];
