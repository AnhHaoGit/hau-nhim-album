export type PhotoDTO = {
  slot: number;
  url: string;
  fileId: string;
  width: number;
  height: number;
  caption: string;
  captionColor: string;
  date: string;
};

export type PageDTO = {
  _id: string;
  layout: string;
  order: number;
  photos: PhotoDTO[];
};

export type CoverDTO = {
  url: string;
  fileId: string;
  width: number;
  height: number;
};
