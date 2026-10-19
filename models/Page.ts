import mongoose, { Schema, type InferSchemaType } from "mongoose";

const PhotoSchema = new Schema(
  {
    slot: { type: Number, required: true, min: 0, max: 3 }, // vị trí ảnh trong layout
    url: { type: String, default: "" }, // rỗng = chưa có ảnh
    fileId: { type: String, default: "" }, // id của ImageKit, dùng để xoá file
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    caption: { type: String, default: "" },
    captionColor: { type: String, default: "#f4f1ea" },
    date: { type: String, default: "", maxlength: 40 }, // Nhãn ngày/ghi chú dạng text
  },
  { _id: false },
);

const PageSchema = new Schema(
  {
    layout: { type: String, required: true }, // id layout (bước 4)
    order: { type: Number, required: true, index: true },
    photos: { type: [PhotoSchema], default: [] },
  },
  { timestamps: true },
);

export type PageDoc = InferSchemaType<typeof PageSchema>;
export default (mongoose.models.Page as mongoose.Model<PageDoc>) ||
  mongoose.model<PageDoc>("Page", PageSchema);
