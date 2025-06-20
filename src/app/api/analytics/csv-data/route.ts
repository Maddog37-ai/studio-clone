import { NextRequest, NextResponse } from 'next/server'

interface CloserData {
  name: string
  normalizedName: string
  sales: number
  revenue: number
  avgDealSize: number
  totalKW: number
}

// Function to fetch and parse Google Sheets CSV data
async function fetchCloserDataFromCSV(): Promise<CloserData[]> {
  try {
    const csvUrl = process.env.GOOGLE_SHEETS_CSV_URL
    
    if (!csvUrl) {
      throw new Error('Google Sheets CSV URL not configured in environment variables')
    }
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout
    
    const response = await fetch(csvUrl, {
      method: 'GET',
      headers: { 'Accept': 'text/csv' },
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const csvText = await response.text()
    const lines = csvText.trim().split('\n')
    
    if (lines.length < 2) {
      throw new Error('CSV file appears to be empty or malformed')
    }
    
    // Parse header to find column indices
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const closerIndex = headers.findIndex(h => h.includes('closer') && !h.includes('division') && !h.includes('region') && !h.includes('team'))
    const systemSizeIndex = headers.findIndex(h => h.includes('system_size'))
    const realizationIndex = headers.findIndex(h => h.includes('realization'))
    
    if (closerIndex === -1 || systemSizeIndex === -1 || realizationIndex === -1) {
      throw new Error('Required columns not found in CSV')
    }
    
    const closerData: any[] = []
    
    // Parse data rows (limit to prevent hanging)
    for (let i = 1; i < Math.min(lines.length, 1000); i++) {
      try {
        const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',')
        
        if (row.length < 3) continue
        
        const closer = closerIndex >= 0 ? row[closerIndex]?.replace(/['"]/g, '')?.trim() : ''
        const systemSize = systemSizeIndex >= 0 ? parseFloat(row[systemSizeIndex]?.replace(/['"]/g, '')) || 0 : 0
        const realization = realizationIndex >= 0 ? parseFloat(row[realizationIndex]?.replace(/['"]/g, '')) || 0 : 0
        
        if (closer && closer.length > 0 && systemSize > 0) {
          closerData.push({
            closer: closer,
            totalKW: systemSize / 1000, // Convert watts to kilowatts
            realizationValue: realization,
            revenue: systemSize * 3.5 // Estimate $3.50 per watt
          })
        }
      } catch (rowError) {
        continue // Skip problematic rows
      }
    }
    
    // Filter for net accounts only (realization value = 1)
    const netAccounts = closerData.filter(data => data.realizationValue === 1)
    
    // Group by closer and calculate totals
    const closerMap = new Map()
    netAccounts.forEach(data => {
      const existing = closerMap.get(data.closer) || { 
        totalKW: 0, 
        totalDeals: 0, 
        totalRevenue: 0 
      }
      existing.totalKW += data.totalKW
      existing.totalDeals += 1
      existing.totalRevenue += data.revenue
      closerMap.set(data.closer, existing)
    })
    
    // Convert to sorted array with performance metrics
    const processedClosers: CloserData[] = Array.from(closerMap.entries())
      .map(([name, stats]: [string, any]) => ({
        name,
        normalizedName: name.toLowerCase().replace(/[^a-z0-9]/g, ''),
        sales: stats.totalDeals,
        revenue: stats.totalRevenue,
        avgDealSize: stats.totalDeals > 0 ? (stats.totalRevenue / stats.totalDeals) : 0,
        totalKW: stats.totalKW
      }))
      .sort((a, b) => b.sales - a.sales) // Sort by sales count
    
    return processedClosers
  } catch (error) {
    console.error('Error fetching CSV data:', error)
    throw error
  }
}

export async function GET(request: NextRequest) {
  try {
    const closers = await fetchCloserDataFromCSV()
    
    return NextResponse.json({
      success: true,
      closers,
      totalClosers: closers.length,
      totalSales: closers.reduce((sum, c) => sum + c.sales, 0),
      totalRevenue: closers.reduce((sum, c) => sum + c.revenue, 0),
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch closer data',
        closers: []
      },
      { status: 500 }
    )
  }
}
