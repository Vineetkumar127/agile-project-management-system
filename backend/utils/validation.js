// utils/validation.js (minimal helpers)
const mongoose = require("mongoose");

const isValid = (value) => {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
};

const isValidRequestBody = (data) => {
  if (!data) return false;
  return Object.keys(data).length > 0;
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const isBooleanLike = (val) => {
  if (typeof val === "boolean") return true;
  if (typeof val === "string") {
    const v = val.trim().toLowerCase();
    return v === "true" || v === "false";
  }
  return false;
};

const toBoolean = (val) => {
  if (typeof val === "boolean") return val;
  return String(val).trim().toLowerCase() === "true";
};

module.exports = {
  isValid,
  isValidRequestBody,
  isValidObjectId,
  isBooleanLike,
  toBoolean
};
