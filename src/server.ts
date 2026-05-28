import { config } from 'dotenv'
import { architect, methods } from 'neataptic'
import * as fs from 'fs'
import * as path from 'path'

config()

const trainAsync = (network: any, trainingSet: any, options: any): Promise<void> => {
  return new Promise((resolve) => {
    network.train(trainingSet, options)
    resolve()
  })
}

// Load training data from CSV file
const loadTrainingData = (
  csvFilePath: string
): {
  headers: string[]
  trainingSet: Array<{ input: number[]; output: number[] }>
} => {
  const csvContent = fs.readFileSync(csvFilePath, 'utf-8')
  const lines = csvContent.trim().split('\n')

  // Get headers from first row
  const headers = lines[0].split(',').map((h) => h.trim())

  const trainingSet: Array<{ input: number[]; output: number[] }> = []

  // Process each data row (start from index 1 to skip header)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line === '') continue // Skip empty lines

    const values = line.split(',').map((v) => parseFloat(v.trim()))

    // Inputs: all columns except the last one
    const input = values.slice(0, -1)

    // Output: last column
    const output = [values[values.length - 1]]

    trainingSet.push({ input, output })
  }

  return { headers, trainingSet }
}

const startServer = async () => {
  // Load training data from CSV file
  const csvPath = path.join(__dirname, 'data.csv')

  console.log('\n📂 Loading training data from src/data.csv...')

  let headers, trainingSet
  try {
    const data = loadTrainingData(csvPath)
    headers = data.headers
    trainingSet = data.trainingSet
    console.log(`✅ Loaded ${trainingSet.length} training samples\n`)
  } catch (error) {
    console.error('❌ Error loading data.csv:', error)
    console.log('\n📝 Please create src/data.csv with format:')
    console.log('   column1,column2,column3,...,output')
    console.log('   Example:')
    console.log('   temperature,humidity,pressure,output')
    console.log('   22,85,1012,1')
    console.log('   28,45,1020,0\n')
    process.exit(1)
  }

  // Auto-detect dimensions from your data
  const inputSize = trainingSet[0].input.length
  const outputSize = trainingSet[0].output.length

  // Input headers (all except last)
  const inputHeaders = headers.slice(0, -1)
  const outputHeader = headers[headers.length - 1]

  // Calculate optimal hidden layer size
  const hiddenSize = Math.min(Math.max(4, Math.ceil((inputSize + outputSize) * 1.5)), 200)

  // Adjust training parameters based on dataset size
  const hasEnoughData = trainingSet.length >= inputSize * 10
  const iterations = hasEnoughData ? 2000 : Math.min(5000, 2000 + inputSize * 50)
  const errorThreshold = hasEnoughData ? 0.005 : 0.05
  const learningRate = Math.min(0.3, 1.0 / inputSize)

  console.log('🧠 Neural Network Configuration:')
  console.log(`   Inputs: ${inputSize} (${inputHeaders.join(', ')})`)
  console.log(`   Hidden neurons: ${hiddenSize}`)
  console.log(`   Outputs: ${outputSize} (${outputHeader})`)
  console.log(`   Training samples: ${trainingSet.length}`)
  console.log(`   Iterations: ${iterations}`)
  console.log(`   Error threshold: ${errorThreshold}`)
  console.log(`   Learning rate: ${learningRate}`)

  // Warning if not enough data
  if (trainingSet.length < inputSize * 5) {
    console.log(
      `\n⚠️  WARNING: Only ${trainingSet.length} samples for ${inputSize} inputs`
    )
    console.log(`   Recommended: At least ${inputSize * 10} samples for good results\n`)
  } else {
    console.log(`\n✅ Dataset size looks good for ${inputSize} inputs\n`)
  }

  console.log('🏋️  Training Network...\n')

  // Create network with dynamic dimensions
  const network = new architect.Perceptron(inputSize, hiddenSize, outputSize)

  await trainAsync(network, trainingSet, {
    iterations: iterations,
    error: errorThreshold,
    rate: learningRate,
    log: Math.max(100, Math.floor(iterations / 4)),
    cost: methods.cost.MSE
  })

  console.log('\n📊 Results on Training Data:')

  // Build dynamic header row from CSV headers
  let headerLine = ''
  inputHeaders.forEach((header) => {
    headerLine += `${header} | `
  })
  headerLine += `${outputHeader} | Result   | Correct`

  // Calculate separator length based on header length
  const separatorLength = Math.max(headerLine.length, 60)
  const separator = '─'.repeat(separatorLength)

  console.log(separator)
  console.log(headerLine)
  console.log(separator)

  // Test all training samples
  let correctCount = 0
  trainingSet.forEach(({ input, output }) => {
    const result = network.activate(input)[0]
    const rounded = Math.round(result)
    const expected = output[0]
    const correct = rounded === expected
    if (correct) correctCount++

    const correctSymbol = correct ? '✓' : '✗'

    // Build data row dynamically
    let dataLine = ''
    input.forEach((value) => {
      // Format numbers nicely (integers without decimal, floats with 1-2 decimals)
      const formattedValue = Number.isInteger(value) ? value.toString() : value.toFixed(2)
      dataLine += `${formattedValue}${' '.repeat(Math.max(1, headerLine.split('|')[dataLine.split('|').length].length - formattedValue.length))} | `
    })

    // Simple formatting for data row
    dataLine = ''
    input.forEach((value, idx) => {
      const headerWidth = inputHeaders[idx].length
      const formattedValue = Number.isInteger(value) ? value.toString() : value.toFixed(2)
      dataLine += `${formattedValue.padEnd(headerWidth)} | `
    })

    const outputWidth = outputHeader.length
    const expectedStr = expected.toString().padEnd(outputWidth)
    dataLine += `${expectedStr} | ${result.toFixed(4)} |   ${correctSymbol}`
    console.log(dataLine)
  })

  console.log(separator)
  const accuracy = ((correctCount / trainingSet.length) * 100).toFixed(1)
  console.log(`\n📈 Accuracy: ${correctCount}/${trainingSet.length} (${accuracy}%)`)

  // Generate test cases based on data range (no hardcoded assumptions)
  console.log('\n🧪 Smart Test Cases:')

  // Get min/max values from your data
  const allInputs = trainingSet.flatMap((t) => t.input)
  const minVal = Math.min(...allInputs)
  const maxVal = Math.max(...allInputs)
  const avgVal = allInputs.reduce((a, b) => a + b, 0) / allInputs.length

  // Create test inputs based on your data range
  const testInputs = [
    Array(inputSize).fill(minVal), // All minimum values
    Array(inputSize).fill(maxVal), // All maximum values
    Array(inputSize).fill(avgVal), // All average values
    trainingSet[0].input // First training sample
  ]

  // Add a random test
  const randomTest = Array(inputSize)
    .fill(0)
    .map(() => minVal + Math.random() * (maxVal - minVal))
  testInputs.push(randomTest)

  testInputs.forEach((testInput, idx) => {
    const result = network.activate(testInput)[0]
    const rounded = Math.round(result)

    // Build test case display dynamically
    let testStr = ` Test ${idx + 1}: `
    testInput.forEach((value, i) => {
      testStr += `${inputHeaders[i]}=${value.toFixed(2)} `
    })
    testStr += `→ ${result.toFixed(4)} (rounded: ${rounded})`
    console.log(testStr)
  })

  console.log('\n✅ Training complete!')
  console.log('\n💡 To use different data, just replace src/data.csv')
  console.log('   Headers can be anything - they will be used automatically\n')
}

startServer()
