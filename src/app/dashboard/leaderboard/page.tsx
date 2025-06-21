'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Trophy, TrendingUp, Users, Target, RefreshCw, Award } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

// Updated interfaces
interface SetterData {
  displayName: string
  email?: string
  totalLeads: number
  qualifiedLeads: number
  conversionRate: number
  teamName?: string
  lastActivity?: string
}

interface CloserData {
  name: string
  normalizedName: string
  sales: number
  revenue: number
  avgDealSize: number
  teamName?: string
  matchedProfile?: {
    displayName: string
    photoURL?: string
    email: string
    teamName?: string
  }
}

interface TeamStats {
  teamName: string
  totalSetters: number
  totalClosers: number
  totalLeads: number
  totalSales: number
  totalRevenue: number
  avgConversion: number
}

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [setters, setSetters] = useState<SetterData[]>([])
  const [closers, setClosers] = useState<CloserData[]>([])
  const [teamStats, setTeamStats] = useState<TeamStats[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Mock data for testing
  const loadMockData = () => {
    setLoading(true)
    setError(null)
    
    setTimeout(() => {
      // Mock setters data
      const mockSetters: SetterData[] = [
        {
          displayName: 'John Doe',
          email: 'john@example.com',
          totalLeads: 45,
          qualifiedLeads: 32,
          conversionRate: 71.1,
          teamName: 'Alpha Team',
          lastActivity: new Date().toISOString()
        },
        {
          displayName: 'Jane Smith',
          email: 'jane@example.com',
          totalLeads: 38,
          qualifiedLeads: 25,
          conversionRate: 65.8,
          teamName: 'Beta Team',
          lastActivity: new Date().toISOString()
        }
      ]

      // Mock closers data
      const mockClosers: CloserData[] = [
        {
          name: 'Mike Johnson',
          normalizedName: 'mikejohnson',
          sales: 12,
          revenue: 180000,
          avgDealSize: 15000,
          teamName: 'Alpha Team'
        },
        {
          name: 'Sarah Wilson',
          normalizedName: 'sarahwilson', 
          sales: 10,
          revenue: 165000,
          avgDealSize: 16500,
          teamName: 'Beta Team'
        }
      ]

      // Mock team stats
      const mockTeamStats: TeamStats[] = [
        {
          teamName: 'Alpha Team',
          totalSetters: 1,
          totalClosers: 1,
          totalLeads: 45,
          totalSales: 12,
          totalRevenue: 180000,
          avgConversion: 71.1
        },
        {
          teamName: 'Beta Team',
          totalSetters: 1,
          totalClosers: 1,
          totalLeads: 38,
          totalSales: 10,
          totalRevenue: 165000,
          avgConversion: 65.8
        }
      ]

      setSetters(mockSetters)
      setClosers(mockClosers)
      setTeamStats(mockTeamStats)
      setLastUpdated(new Date())
      setLoading(false)
    }, 1000)
  }

  const loadRealData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch closers
      const closersResponse = await fetch('/api/analytics/csv-data')
      if (!closersResponse.ok) {
        throw new Error(`Failed to fetch closers: ${closersResponse.status}`)
      }
      const closersData = await closersResponse.json()
      if (!closersData.success) {
        throw new Error(closersData.error || 'Failed to load closers')
      }

      // Fetch setters
      const settersResponse = await fetch('/api/analytics/setter-data')
      if (!settersResponse.ok) {
        throw new Error(`Failed to fetch setters: ${settersResponse.status}`)
      }
      const settersData = await settersResponse.json()
      if (!settersData.success) {
        throw new Error(settersData.error || 'Failed to load setters')
      }

      setClosers(closersData.closers || [])
      setSetters(settersData.setters || [])
      setTeamStats([]) // Team stats can be calculated if needed
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error loading real data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load data')
      // Fall back to mock data
      loadMockData()
      return
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Start with mock data for immediate display
    loadMockData()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never'
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return 'Unknown'
    }
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500 text-white"><Trophy className="w-3 h-3 mr-1" />1st</Badge>
    if (rank === 2) return <Badge className="bg-gray-400 text-white"><Award className="w-3 h-3 mr-1" />2nd</Badge>
    if (rank === 3) return <Badge className="bg-amber-600 text-white"><Award className="w-3 h-3 mr-1" />3rd</Badge>
    return <Badge variant="outline">#{rank}</Badge>
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading leaderboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Performance Leaderboard</h1>
          <p className="text-muted-foreground">
            Track top performers across setters and closers
          </p>
          {lastUpdated && (
            <p className="text-sm text-muted-foreground mt-1">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          )}
          {error && (
            <p className="text-sm text-yellow-600 mt-1">
              Note: Using sample data due to: {error}
            </p>
          )}
        </div>
        <div className="space-x-2">
          <Button onClick={loadMockData} variant="outline" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Mock Data
          </Button>
          <Button onClick={loadRealData} variant="outline" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Real Data
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Setters</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{setters.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Closers</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{closers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {setters.reduce((sum, s) => sum + s.totalLeads, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(closers.reduce((sum, c) => sum + c.revenue, 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard Tabs */}
      <Tabs defaultValue="setters" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="setters">Top Setters</TabsTrigger>
          <TabsTrigger value="closers">Top Closers</TabsTrigger>
          <TabsTrigger value="teams">Team Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="setters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Lead Setters</CardTitle>
              <CardDescription>Ranked by total leads generated</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {setters.slice(0, 10).map((setter, index) => (
                  <div key={setter.displayName + index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getRankBadge(index + 1)}
                      <Avatar>
                        {/* No photoURL for real data, fallback to initials */}
                        <AvatarFallback>
                          {setter.displayName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{setter.displayName}</p>
                        <p className="text-sm text-muted-foreground">{setter.teamName || 'No team'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{setter.totalLeads} leads</p>
                      <p className="text-sm text-muted-foreground">
                        {setter.qualifiedLeads} qualified ({setter.conversionRate.toFixed(1)}%)
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last active: {formatDate(setter.lastActivity)}
                      </p>
                    </div>
                  </div>
                ))}
                {setters.length === 0 && (
                  <div className="text-center p-8 text-muted-foreground">
                    No setter data available. Click "Real Data" to load from Firestore.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="closers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Closers</CardTitle>
              <CardDescription>Ranked by total sales and revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {closers.slice(0, 10).map((closer, index) => (
                  <div key={`${closer.name}-${index}`} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getRankBadge(index + 1)}
                      <Avatar>
                        <AvatarImage src={closer.matchedProfile?.photoURL} />
                        <AvatarFallback>
                          {closer.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{closer.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {closer.teamName || closer.matchedProfile?.teamName || 'No team'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{closer.sales} sales</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(closer.revenue)} revenue
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Avg: {formatCurrency(closer.avgDealSize)}
                      </p>
                    </div>
                  </div>
                ))}
                {closers.length === 0 && (
                  <div className="text-center p-8 text-muted-foreground">
                    No closer data available. Check Google Sheets CSV connection.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Performance</CardTitle>
              <CardDescription>Overall team statistics and rankings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamStats.map((team, index) => (
                  <div key={team.teamName} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getRankBadge(index + 1)}
                      <div>
                        <p className="font-semibold">{team.teamName}</p>
                        <p className="text-sm text-muted-foreground">
                          {team.totalSetters} setters, {team.totalClosers} closers
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(team.totalRevenue)}</p>
                      <p className="text-sm text-muted-foreground">
                        {team.totalLeads} leads, {team.totalSales} sales
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Avg conversion: {team.avgConversion.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
                {teamStats.length === 0 && (
                  <div className="text-center p-8 text-muted-foreground">
                    No team data available. Team stats will be calculated from setter and closer data.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
