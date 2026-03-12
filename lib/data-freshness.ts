// lib/data-freshness.ts
// Returns the last-updated date for each data category
// Uses build-time data embedded in a generated file

import { DATA_FRESHNESS } from './generated/data-freshness-meta'

export { DATA_FRESHNESS }
export type DataCategory = keyof typeof DATA_FRESHNESS
