import { Schema, model } from "mongoose";

export interface IProps {
  length: number;
  is_palindrome: boolean;
  unique_characters: number;
  word_count: number;
  sha256_hash: string;
  character_frequency_map: Record<string, number>;
}

export interface IStringDoc {
  _id: string; // stores sha256 hash as id
  value: string;
  properties: IProps;
  created_at: Date;
}

const PropetiesSchema = new Schema<IProps>({
  length: {
    type: Number,
    required: true,
  },
  is_palindrome: {
    type: Boolean,
    required: true,
  },
  unique_characters: {
    type: Number,
    required: true,
  },
  word_count: {
    type: Number,
    required: true,
  },
  sha256_hash: {
    type: String,
    required: true,
  },
  character_frequency_map: {
    type: Schema.Types.Mixed,
    required: true,
  },
});

const StringSchema = new Schema<IStringDoc>({
  _id: {
    type: String,
  },
  value: {
    type: String,
  },
  properties: {
    type: PropetiesSchema,
    required: true,
  },
  created_at: {
    type: Date,
    default: () => new Date(),
  },
});

export const StringModel = model<IStringDoc>("String", StringSchema);