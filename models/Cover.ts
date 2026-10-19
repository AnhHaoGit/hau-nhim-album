import mongoose, { Schema, type InferSchemaType } from "mongoose";

const CoverSchema = new Schema({
  key: { type: String, default: "cover", unique: true },
  url: { type: String, default: "" },
  fileId: { type: String, default: "" },
  width: { type: Number, default: 0 },
  height: { type: Number, default: 0 },
});

export type CoverDoc = InferSchemaType<typeof CoverSchema>;
export default (mongoose.models.Cover as mongoose.Model<CoverDoc>) ||
  mongoose.model<CoverDoc>("Cover", CoverSchema);
