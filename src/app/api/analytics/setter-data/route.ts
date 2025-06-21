import { NextRequest, NextResponse } from 'next/server'

// Define the SetterData interface
interface SetterData {
  displayName: string
  email?: string
  totalLeads: number
  qualifiedLeads: number
  conversionRate: number
  teamName?: string
  lastActivity?: string
}

// Fetch and parse Google Sheets CSV for setter data
async function fetchSetterDataFromCSV(): Promise<SetterData[]> {
  try {
    const csvUrl = process.env.GOOGLE_SHEETS_OVERALL_CSV_URL
    if (!csvUrl) throw new Error('Google Sheets CSV URL not configured')

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)
    const response = await fetch(csvUrl, {
      method: 'GET',
      headers: { 'Accept': 'text/csv' },
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

    const csvText = await response.text()
    const lines = csvText.trim().split('\n')
    if (lines.length < 2) throw new Error('CSV file appears to be empty or malformed')

    // Parse header to find column indices
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const setterIndex = headers.findIndex(h => h === 'setter_name')
    const teamIndex = headers.findIndex(h => h === 'team') // may not exist

    if (setterIndex === -1) throw new Error('Required columns not found in CSV')

    // Parse data rows
    const setterMap = new Map<string, SetterData & { totalLeadsSum: number }>()
    for (let i = 1; i < Math.min(lines.length, 1000); i++) {
      const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',')
      const setter = setterIndex >= 0 ? row[setterIndex]?.replace(/['"]/g, '').trim() : ''
      if (!setter) continue
      const teamName = teamIndex >= 0 ? row[teamIndex]?.replace(/['"]/g, '').trim() : undefined
      // Aggregate by setter
      if (!setterMap.has(setter)) {
        setterMap.set(setter, {
          displayName: setter,
          teamName,
          totalLeads: 0,
          qualifiedLeads: 0,
          conversionRate: 0,
          lastActivity: undefined,
          totalLeadsSum: 0
        })
      }
      const entry = setterMap.get(setter)!
      entry.totalLeadsSum += 1
    }
    // Finalize output
    const setters: SetterData[] = Array.from(setterMap.values()).map(s => ({
      displayName: s.displayName,
      teamName: s.teamName,
      totalLeads: s.totalLeadsSum,
      qualifiedLeads: 0,
      conversionRate: 0,
      lastActivity: undefined
    })).sort((a, b) => b.totalLeads - a.totalLeads)
    return setters
  } catch (error) {
    console.error('Error fetching setter CSV data:', error)
    throw error
  }
}

export async function GET(request: NextRequest) {
  try {
    const setters = await fetchSetterDataFromCSV()
    return NextResponse.json({
      success: true,
      setters,
      totalSetters: setters.length,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch setter data',
      setters: []
    }, { status: 500 })
  }
}
