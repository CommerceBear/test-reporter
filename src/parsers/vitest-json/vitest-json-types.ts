export interface VitestJson {
  numTotalTestSuites: number
  numPassedTestSuites: number
  numFailedTestSuites: number
  numPendingTestSuites: number
  numTotalTests: number
  numPassedTests: number
  numFailedTests: number
  numPendingTests: number
  numTodoTests: number
  startTime: number
  success: boolean
  testResults: VitestTestResult[]
}

type VitestTestState = 'failed' | 'passed' | string

export interface VitestTestResult {
  assertionResults: VitestAssertionResult[]
  startTime: number
  endTime: number
  status: VitestTestState
  message: string
  name: string
}

type VitestAssertionStatus = 'passed' | 'failed' | 'skipped' | 'pending' | 'todo' | 'disabled' | string

export interface VitestAssertionResult {
  ancestorTitles: string[]
  fullName: string
  status: VitestAssertionStatus
  title: string
  duration?: number | null
  failureMessages: string[] | null
  location?: {
    line: number
    column: number
  } | null
}
