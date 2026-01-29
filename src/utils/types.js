// Converted TypeScript types to JavaScript with JSDoc comments

/**
 * @typedef {Object} VehicleCost
 * @property {number} cs
 * @property {number} cm
 * @property {number} el
 * @property {number} er
 * @property {number} cs_upkeep
 */

/**
 * @typedef {Object} InfantryCost
 * @property {number} time
 * @property {number} er
 */

/**
 * @typedef {Object} SlashCommand
 * @property {string} command
 * @property {Object.<string, string>} args
 */

/**
 * @typedef {Object} ParamBase
 * @property {string} id
 * @property {string} label
 */

/**
 * @typedef {"int" | "uint" | "float" | "ufloat"} NumberType
 */

/**
 * @typedef {ParamBase & {
 *   type: "number",
 *   num_type: NumberType,
 *   range?: { max?: number, min?: number },
 *   step?: number,
 *   default?: number
 * }} ParamNumber
 */

/**
 * @typedef {ParamBase & {
 *   type: "select",
 *   options: Object.<string, string>,
 *   default?: string
 * }} ParamSelect
 */

/**
 * @typedef {ParamBase & {
 *   type: "text",
 *   default?: string
 * }} ParamText
 */

/**
 * @typedef {ParamBase & {
 *   type: "bool",
 *   default?: boolean
 * }} ParamBool
 */

/**
 * @typedef {ParamNumber | ParamSelect | ParamText | ParamBool} ParamType
 */

/**
 * @typedef {Object.<string, ParamType>} Params
 */

export {
  // Export empty object since this is just for type definitions
  // The actual types are used via JSDoc comments
};
