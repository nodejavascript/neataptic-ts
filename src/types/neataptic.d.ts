// src/types/neataptic.d.ts

declare module 'neataptic' {
  export namespace architect {
    class Perceptron {
      constructor(inputs: number, hidden: number, outputs: number)
      activate(input: number[]): number[]
      train(data: TrainingData[], options?: TrainingOptions): void
      toJSON(): any
    }

    class LSTM {
      constructor(inputs: number, hidden: number, outputs: number)
      activate(input: number[]): number[]
      train(data: TrainingData[], options?: TrainingOptions): void
    }

    class Hopfield {
      constructor(size: number)
      learn(patterns: number[][]): void
      feed(pattern: number[]): number[]
    }
  }

  export namespace methods {
    namespace cost {
      const MSE: any
      const CROSS_ENTROPY: any
    }

    namespace mutation {
      const ADD_NODE: any
      const ADD_CONN: any
      const REMOVE_NODE: any
      const REMOVE_CONN: any
      const MOD_WEIGHT: any
      const MOD_BIAS: any
      const MOD_ACTIVATION: any
    }
  }

  export namespace Neat {
    class Neat {
      constructor(inputs: number, outputs: number, fitnessFunction: any, options?: any)
      evolve(): void
      evaluate(): void
      getFittest(): Network
    }
  }

  interface TrainingData {
    input: number[]
    output: number[]
  }

  interface TrainingOptions {
    iterations?: number
    error?: number
    rate?: number
    log?: number
    cost?: any
    clear?: boolean
  }

  class Network {
    activate(input: number[]): number[]
    toJSON(): any
    static fromJSON(json: any): Network
  }
}
