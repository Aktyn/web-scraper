import '../test-utils/electronMock'
import { parseScrapperStringValue } from './helpers'

describe(parseScrapperStringValue.name, () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(1705803184165))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should always return at least empty string', () => {
    expect(parseScrapperStringValue('')).toEqual('')
    expect(parseScrapperStringValue(null)).toEqual('')
    expect(parseScrapperStringValue(undefined)).toEqual('')
    expect(parseScrapperStringValue('{{ URL.ORIGIN }}')).toEqual('')
    expect(parseScrapperStringValue('{{ non existing special code}}')).toEqual('')
  })

  it('should recognize and parse special values', () => {
    expect(parseScrapperStringValue('foo {{ TIMESTAMP }} bar')).toEqual('foo 1705803184165 bar')
    expect(parseScrapperStringValue('{{ CURRENT_TIMESTAMP }} bar')).toEqual('1705803184165 bar')
    expect(parseScrapperStringValue('{{NOW}}')).toEqual('1705803184165')
  })

  it('should be case insensitive and ignore additional spaces', () => {
    expect(parseScrapperStringValue('foo {{   CuRrEnT _ TiMeStAmP }} bar')).toEqual(
      'foo 1705803184165 bar',
    )
  })

  it('should utilize helper data', () => {
    expect(parseScrapperStringValue('foo{{ URL.ORIGIN }}')).toEqual('foo')
    expect(
      parseScrapperStringValue('foo {{ URL.ORIGIN }} bar', {
        siteURL: 'http://localhost:1357/route',
      }),
    ).toEqual('foo http://localhost:1357 bar')
    expect(
      parseScrapperStringValue('foo {{ URL.pathname }} bar', {
        siteURL: 'http://localhost:1357/route',
      }),
    ).toEqual('foo /route bar')
  })
})
