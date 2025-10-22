import { Request, Response } from "express";
import { StringModel } from "../models/stringModel";
import { analyzeString, sha256 } from "../utils/analyzer";

export async function createString(req: Request, res: Response) {
  const { value } = req.body ?? {};
  if (typeof value === "undefined")
    return res
      .status(400)
      .json({ error: "Invalid request body or missing 'value' field" });
  if (typeof value !== "string")
    return res
      .status(422)
      .json({ error: "Invalid data type for 'value' (string)" });
  if (value.length === 0)
    return res.status(422).json({ error: "value cannot be empty" });

  const props = analyzeString(value);
  const id = props.sha256_hash;

  const valueExists = await StringModel.findById(id).lean();
  if (valueExists)
    return res
      .status(409)
      .json({ error: "String already exists in the system" });

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
}

export async function getString(req: Request, res: Response) {
  const { value: rawValue } = req.params;
  if (!rawValue)
    return res
      .status(400)
      .json({ error: "Invalid request body or missing 'value' field" });

  const id = sha256(rawValue);
  const doc = await StringModel.findById(id).lean();
  if (!doc)
    return res
      .status(404)
      .json({ error: "String does not exist in the system" });

  return res.status(200).json({
    id: doc._id,
    value: doc.value,
    properties: doc.properties,
    created_at: doc.created_at,
  });
}

export async function getAllStrings(req: Request, res: Response) {
  const filters: any = {};

  // parse query parameters
  if (req.query.is_palindrome !== undefined) {
    const value = String(req.query.is_palindrome).toLowerCase();
    if (value !== "true" && value !== "false") {
      return res.status(400).json({ error: "Invalid value for is_palindrome" });
    }
    filters["properties.is_palindrome"] = value === "true";
  }

  if (req.query.min_length) {
    const value = parseInt(String(req.query.min_length), 10);
    if (isNaN(value)) {
      return res.status(400).json({ error: "Invalid value for min_length" });
    }
    filters["properties.length"] = {
      ...filters["properties.length"],
      $gte: value,
    };
  }

  if (req.query.max_length) {
    const value = parseInt(String(req.query.max_length), 10);
    if (isNaN(value)) {
      return res.status(400).json({ error: "Invalid value for max_length" });
    }
    filters["properties.length"] = {
      ...filters["properties.length"],
      $lte: value,
    };
  }

  if (req.query.word_count) {
    const value = parseInt(String(req.query.word_count), 10);
    if (isNaN(value)) {
      return res.status(400).json({ error: "Invalid value for word_count" });
    }
    filters["properties.word_count"] = value;
  }

  if (req.query.contains_character) {
    const value = String(req.query.contains_character);
    if (value.length !== 1) {
      return res
        .status(400)
        .json({ error: "contains_character must be single character" });
    }
    filters.value = { $regex: value, $options: "i" };
  }

  const data = await StringModel.find(filters).lean();

  return res.status(200).json({
    data: data.map((doc) => ({
      id: doc._id,
      value: doc.value,
      properties: doc.properties,
      created_at: doc.created_at,
    })),
    count: data.length,
    filters_applied: req.query,
  });
}

export async function filterByNaturalLanguage(req: Request, res: Response) {
  const { query } = req.query;

  if (!query || typeof query !== "string") {
    return res
      .status(400)
      .json({ error: "Unable to parse natural language query" });
  }

  const parsedFilters = parseNaturalLanguage(query);

  // check for conflicting filters
  if (parsedFilters.min_length && parsedFilters.max_length) {
    if (parsedFilters.min_length > parsedFilters.max_length) {
      return res.status(422).json({ 
        error: 'Query parsed but resulted in conflicting filters' 
      });
    }
  }

  // Build MongoDB query
  const filters: any = {};

  if (parsedFilters.is_palindrome !== undefined) {
    filters["properties.is_palindrome"] = parsedFilters.is_palindrome;
  }
  if (parsedFilters.min_length) {
    filters["properties.length"] = {
      ...filters["properties.length"],
      $gte: parsedFilters.min_length,
    };
  }
  if (parsedFilters.max_length) {
    filters["properties.length"] = {
      ...filters["properties.length"],
      $lte: parsedFilters.max_length,
    };
  }
  if (parsedFilters.word_count) {
    filters["properties.word_count"] = parsedFilters.word_count;
  }
  if (parsedFilters.contains_character) {
    filters.value = { $regex: parsedFilters.contains_character, $options: "i" };
  }

  const data = await StringModel.find(filters).lean();

  return res.status(200).json({
    data: data.map((doc) => ({
      id: doc._id,
      value: doc.value,
      properties: doc.properties,
      created_at: doc.created_at,
    })),
    count: data.length,
    interpreted_query: {
      original: query,
      parsed_filters: parsedFilters,
    },
  });
}

function parseNaturalLanguage(query: string): any {
  const lowerQuery = query.toLowerCase();
  const filters: any = {};

  // palindrome detection
  if (lowerQuery.includes("palindrome") || lowerQuery.includes("palindromic")) {
    filters.is_palindrome = true;
  }

  // word count
  if (lowerQuery.includes("single word")) filters.word_count = 1;
  if (lowerQuery.includes("two word")) filters.word_count = 2;

  // Length filters
  const longerMatch = lowerQuery.match(/longer than (\d+)/);
  if (longerMatch) filters.min_length = parseInt(longerMatch[1]) + 1;

  const shorterMatch = lowerQuery.match(/shorter than (\d+)/);
  if (shorterMatch) filters.max_length = parseInt(shorterMatch[1]) - 1;

  // character filters
  const letterMatch = lowerQuery.match(/letter ([a-z])/);
  if (letterMatch) filters.contains_character = letterMatch[1];

  if (lowerQuery.includes("first vowel")) filters.contains_character = "a";

  return filters;
}

export async function deleteString(req: Request, res: Response) {
  const { value: rawValue } = req.params;
  if (!rawValue)
    return res
      .status(400)
      .json({ error: "Invalid request body or missing 'value' field" });
  console.log("Deleting value:", rawValue);

  const id = sha256(rawValue);
  const doc = await StringModel.findById(id);
  if (!doc)
    return res
      .status(404)
      .json({ error: "String does not exist in the system" });

  await doc.deleteOne();
  return res.status(204).send();
}
