import { Request, Response } from "express";
import { StringModel } from "../models/stringModel";
import { analyzeString, sha256 } from "../utils/analyzer";

export async function createString(req: Request, res: Response) {
  const { value } = req.body ?? {};
  if (typeof value === "undefined")
    return res.status(400).json({ error: "missing value" });
  if (typeof value !== "string")
    return res.status(422).json({ error: "value must be a string" });
  if (value.length === 0)
    return res.status(422).json({ error: "value cannot be empty" });

  const props = analyzeString(value);
  const id = props.sha256_hash;

  const valueExists = await StringModel.findById(id).lean();
  if (valueExists)
    return res.status(409).json({ error: "value already exists" });

  const newDoc = await StringModel.create({
    _id: id,
    value,
    properties: props,
  });
  return res.status(201).json({
    id: newDoc._id,
    value: newDoc.value,
    properties: newDoc.properties,
    created_at: newDoc.created_at,
  });
};

export async function getString(req: Request, res: Response) {
  const { value: rawValue } = req.params;
  if (!rawValue) return res.status(400).json({ error: "missing value" });

  const id = sha256(rawValue);
  const doc = await StringModel.findById(id).lean();
  if (!doc) return res.status(404).json({ error: "value not found" });

  return res.status(200).json({
    id: doc._id,
    value: doc.value,
    properties: doc.properties,
    created_at: doc.created_at,
  });
};

export async function deleteString(req: Request, res: Response) {
  const { value: rawValue } = req.params;
  if (!rawValue) return res.status(400).json({ error: "missing value" });
  console.log("Deleting value:", rawValue);

  const id = sha256(rawValue);
  const doc = await StringModel.findById(id);
  if (!doc) return res.status(404).json({ error: "value not found" });
  
  await doc.deleteOne();
  return res.status(204).send();
}