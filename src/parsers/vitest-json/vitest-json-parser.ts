import {ParseOptions, TestParser} from '../../test-parser'
import {
  TestCaseError,
  TestCaseResult,
  TestExecutionResult,
  TestGroupResult,
  TestRunResult,
  TestSuiteResult
} from '../../test-results'
import {VitestAssertionResult, VitestJson} from './vitest-json-types'
import process from 'process'

export class VitestJsonParser implements TestParser {
  workDir: string

  constructor(readonly options: ParseOptions) {
    this.workDir = options.workDir || process.cwd()
  }

  async parse(path: string, content: string): Promise<TestRunResult> {
    const vitest = this.getVitestJson(path, content)
    const result = this.getTestRunResult(path, vitest)
    result.sort(true)
    return Promise.resolve(result)
  }

  private getVitestJson(path: string, content: string): VitestJson {
    try {
      return JSON.parse(content)
    } catch (e) {
      throw new Error(`Invalid JSON at ${path}\n\n${e}`)
    }
  }

  private getTestRunResult(resultsPath: string, vitest: VitestJson): TestRunResult {
    const suites = vitest.testResults.map(result => {
      let name = result.name
      if (name.startsWith(this.workDir)) {
        name = name.replace(this.workDir, '.')
      }

      const testCases = result.assertionResults.map(assertion => {
        return new TestCaseResult(
          assertion.fullName,
          testCaseResult(assertion),
          assertion.duration ?? 0,
          testCaseError(assertion)
        )
      })
      const group = new TestGroupResult(name, testCases)
      return new TestSuiteResult(name, [group])
    })

    const totalDuration = Math.max(...vitest.testResults.map(r => r.endTime), vitest.startTime) - vitest.startTime
    return new TestRunResult(resultsPath, suites, totalDuration)
  }
}

function testCaseResult(assertion: VitestAssertionResult): TestExecutionResult {
  switch (assertion.status) {
    case 'passed':
      return 'success'
    case 'failed':
      return 'failed'
    case 'skipped':
    case 'disabled':
    case 'todo':
      return 'skipped'
    default:
      return undefined
  }
}

function testCaseError(assertion: VitestAssertionResult): TestCaseError | undefined {
  if (assertion.status !== 'failed') {
    return
  }

  return {
    path: undefined,
    line: assertion.location?.line,
    details: assertion.failureMessages?.join('/n') ?? '[No failure message provided]'
  }
}
