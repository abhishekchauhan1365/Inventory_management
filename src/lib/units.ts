// src/lib/units.ts
// All unit conversion logic for the MedChem inventory system.
// All stock and prices are stored in BASE units (g, mL, unit).
// Conversions happen server-side before saving quotations.

import type { BaseUnit, Dimension } from '@/types'

/** Conversion factor to base unit. e.g. 1 kg = 1000 g */
export const UNIT_TO_BASE: Record<BaseUnit, number> = {
  g: 1,
  kg: 1000,
  mL: 1,
  L: 1000,
  unit: 1,
}

/** Compatible units grouped by dimension */
export const COMPATIBLE_UNITS: Record<Dimension, BaseUnit[]> = {
  weight: ['g', 'kg'],
  volume: ['mL', 'L'],
  count: ['unit'],
}

/** The canonical base unit for each dimension */
export const BASE_UNIT_FOR_DIMENSION: Record<Dimension, BaseUnit> = {
  weight: 'g',
  volume: 'mL',
  count: 'unit',
}

/**
 * Convert a quantity from a given unit to its base unit.
 * e.g. convertToBase(2, 'kg') => 2000
 */
export function convertToBase(qty: number, fromUnit: BaseUnit): number {
  return qty * UNIT_TO_BASE[fromUnit]
}

/**
 * Calculate the line total for a quotation item.
 * Formula: qty_in_ordered_unit × factor × price_per_base_unit
 * e.g. calculateLineTotal(2, 'kg', 50) => 2 * 1000 * 50 = 100000
 */
export function calculateLineTotal(
  qty: number,
  unit: BaseUnit,
  pricePerBase: number
): number {
  return convertToBase(qty, unit) * pricePerBase
}

/**
 * Format a number or numeric string as Indian Rupees.
 * e.g. formatINR(1234567.89) => '₹12,34,567.89'
 */
export function formatINR(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return '₹0.00'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

/**
 * Smartly display a quantity in base units as a human-readable string.
 * e.g. displayQty(2000, 'g') => '2 kg'
 * e.g. displayQty(500, 'g') => '500 g'
 * e.g. displayQty(1500, 'mL') => '1.5 L'
 */
export function displayQty(baseQty: number | string, baseUnit: BaseUnit): string {
  const qty = typeof baseQty === 'string' ? parseFloat(baseQty) : baseQty
  if (isNaN(qty)) return '0'

  if (baseUnit === 'g' && qty >= 1000) {
    const kg = qty / 1000
    return `${parseFloat(kg.toFixed(4))} kg`
  }
  if (baseUnit === 'mL' && qty >= 1000) {
    const L = qty / 1000
    return `${parseFloat(L.toFixed(4))} L`
  }
  return `${parseFloat(qty.toFixed(4))} ${baseUnit}`
}
