export const MATRIX_A = {
  name: 'A' as const,
  rows: 2,
  cols: 3,
  values: [
    [1, 2, 3],
    [4, 5, 6],
  ],
}

export const MATRIX_B = {
  name: 'B' as const,
  rows: 3,
  cols: 2,
  values: [
    [7, 8],
    [9, 10],
    [11, 12],
  ],
}

export const MATRIX_C = {
  name: 'C' as const,
  rows: 2,
  cols: 2,
  values: [
    [58, 64],
    [139, 154],
  ],
}

export function computeStep(resultRow: number, resultCol: number) {
  const rowValues = MATRIX_A.values[resultRow]
  const colValues = MATRIX_B.values.map((row) => row[resultCol])
  const products = rowValues.map((v, i) => v * colValues[i])
  const result = products.reduce((a, b) => a + b, 0)
  return { rowValues, colValues, products, result }
}
