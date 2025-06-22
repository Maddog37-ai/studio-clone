'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Trophy, TrendingUp, Users, Target, RefreshCw, Award } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'

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
  totalKW: number // <-- add this property for correct typing
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
  const [allUsers, setAllUsers] = useState<any[]>([])

  // Date filter helpers
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday as start
  const startOfLastWeek = new Date(startOfWeek);
  startOfLastWeek.setDate(startOfWeek.getDate() - 7);
  const startOfYTD = new Date(today.getFullYear() - (today.getMonth() < 9 ? 1 : 0), 9, 1); // Oct 1st of current or last year
  const startOfSummer = new Date(today.getFullYear(), 4, 19); // May 19th

  const dateFilters = [
    { label: 'YTD', value: 'ytd', start: startOfYTD },
    { label: 'Summer To Date', value: 'summer', start: startOfSummer },
    { label: 'MTD', value: 'mtd', start: startOfMonth },
    { label: 'WTD', value: 'wtd', start: startOfWeek },
    { label: 'Last Week', value: 'lw', start: startOfLastWeek, end: startOfWeek },
    { label: 'Today', value: 'today', start: startOfToday },
  ];

  const [dateFilter, setDateFilter] = useState('ytd');

  function filterByDate(data: any[], dateKey: string) {
    const filter = dateFilters.find(f => f.value === dateFilter);
    if (!filter) return data;
    return data.filter(item => {
      const date = new Date(item[dateKey]);
      if (filter.value === 'lw') {
        return date >= filter.start && date < filter.end;
      }
      return date >= filter.start;
    });
  }

  function formatKW(kw: number) {
    return kw ? kw.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 }) : '0.00';
  }

  // Fetch all users from Firestore for avatar/profile matching
  useEffect(() => {
    async function fetchAllUsers() {
      try {
        const usersSnap = await getDocs(collection(db, 'users'))
        setAllUsers(usersSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() })))
      } catch (e) {
        // Ignore error, fallback to initials
        setAllUsers([])
      }
    }
    fetchAllUsers()
  }, [])

  // Use the public env variable for client-side fetch
  const L_CSV_URL = process.env.NEXT_PUBLIC_L_CSV_URL;

  const loadRealData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch leaderboard data from the new API route (server-side CSV parsing)
      const leaderboardRes = await fetch('/api/leaderboard-data');
      if (!leaderboardRes.ok) {
        throw new Error(`Failed to fetch leaderboard data: ${leaderboardRes.status}`);
      }
      const { data: leaderboardData } = await leaderboardRes.json();
      // leaderboardData is an array of objects parsed from the CSV

      // Extract closers data
      const closersData = leaderboardData.map((entry: any) => ({
        name: entry['name'] || '',
        normalizedName: entry['normalizedName'] || '',
        sales: Number(entry['sales'] || 0),
        revenue: Number(entry['revenue'] || 0),
        avgDealSize: Number(entry['avgDealSize'] || 0),
        totalKW: Number(entry['totalKW'] || 0),
        teamName: entry['teamName'] || '',
        matchedProfile: {
          displayName: entry['displayName'] || '',
          photoURL: entry['photoURL'] || '',
          email: entry['email'] || '',
          teamName: entry['teamName'] || '',
        }
      }));

      // Extract setters data
      const settersData = leaderboardData.map((entry: any) => ({
        displayName: entry['displayName'] || entry['setter_name'] || '',
        totalLeads: Number(entry['totalLeads'] || entry['total_leads'] || 0),
        qualifiedLeads: Number(entry['qualifiedLeads'] || entry['qualified_leads'] || 0),
        conversionRate: Number(entry['conversionRate'] || entry['conversion_rate'] || 0),
        teamName: entry['teamName'] || entry['team'] || '',
        lastActivity: entry['lastActivity'] || entry['date'] || '',
      }));

      setSetters(settersData);
      setClosers(closersData)
      setTeamStats([]) // Team stats can be calculated if needed
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error loading real data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load data')
      // Fall back to mock data
      // loadMockData()
      return
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Start with mock data for immediate display
    loadRealData()
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

  // Helper to normalize names for fuzzy matching
  function normalizeName(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '') // remove non-alphanumeric
      .replace(/\s+/g, '') // remove whitespace
  }

  // Helper to match a setter/closer to a user profile (fuzzy)
  function findUserProfile(nameOrEmail: string): any | undefined {
    if (!nameOrEmail) return undefined
    // Try to match by displayName (case-insensitive, trimmed)
    const byName = allUsers.find(u => u.displayName && u.displayName.trim().toLowerCase() === nameOrEmail.trim().toLowerCase())
    if (byName) return byName
    // Try to match by email
    const byEmail = allUsers.find(u => u.email && u.email.trim().toLowerCase() === nameOrEmail.trim().toLowerCase())
    if (byEmail) return byEmail
    // Try to match by normalized name (fuzzy)
    const normalizedTarget = normalizeName(nameOrEmail)
    const byFuzzy = allUsers.find(u => u.displayName && normalizeName(u.displayName) === normalizedTarget)
    if (byFuzzy) return byFuzzy
    // Try to match by first part of name (fuzzy)
    const firstPart = nameOrEmail.split(' ')[0]
    const byFirst = allUsers.find(u => u.displayName && normalizeName(u.displayName.split(' ')[0]) === normalizeName(firstPart))
    if (byFirst) return byFirst
    // Try to match by last part of name (fuzzy)
    const lastPart = nameOrEmail.split(' ').slice(-1)[0]
    const byLast = allUsers.find(u => u.displayName && normalizeName(u.displayName.split(' ').slice(-1)[0]) === normalizeName(lastPart))
    if (byLast) return byLast
    return undefined
  }

  // Filter setters and closers by selected date filter using the new 'date' field
  const filteredSetters = filterByDate(setters, 'date');
  const filteredClosers = filterByDate(closers, 'date');

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
              {error}
            </p>
          )}
        </div>
        <div className="space-x-2">
          <Button onClick={loadRealData} variant="outline" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Date Filter Controls - Prominent Card */}
      <Card className="mb-2">
        <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="font-medium text-sm text-muted-foreground mr-4 mb-1 sm:mb-0">Date Range:</span>
          <div className="flex flex-wrap gap-2">
            {dateFilters.map(f => (
              <Button
                key={f.value}
                size="sm"
                variant={dateFilter === f.value ? 'default' : 'outline'}
                onClick={() => setDateFilter(f.value)}
                className="min-w-[110px]"
              >
                {f.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Setters</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredSetters.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Closers</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredClosers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Net kW</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatKW(filteredClosers.reduce((sum, c) => sum + (c.totalKW || 0), 0))} kW
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
                {filteredSetters.slice(0, 10).map((setter, index) => {
                  const matched = findUserProfile(setter.displayName || setter.email || '')
                  const avatarUrl = matched?.avatarUrl
                  const fullName = matched?.displayName || setter.displayName
                  return (
                    <div key={setter.displayName + index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        {getRankBadge(index + 1)}
                        <Avatar>
                          {avatarUrl && <AvatarImage src={avatarUrl} alt={fullName} />}
                          <AvatarFallback>
                            {fullName?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{fullName}</p>
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
                  )
                })}
                {filteredSetters.length === 0 && (
                  <div className="text-center p-8 text-muted-foreground">
                    No setter data available.
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
              <CardDescription>Ranked by Net Deals and Net kW</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredClosers.slice(0, 10).map((closer, index) => {
                  const matched = findUserProfile(closer.name)
                  const avatarUrl = matched?.avatarUrl || closer.matchedProfile?.photoURL
                  const fullName = matched?.displayName || closer.name
                  return (
                    <div key={`${closer.name}-${index}`} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        {getRankBadge(index + 1)}
                        <Avatar>
                          {avatarUrl && <AvatarImage src={avatarUrl} alt={fullName} />}
                          <AvatarFallback>
                            {fullName?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{fullName}</p>
                          <p className="text-sm text-muted-foreground">
                            {closer.teamName || closer.matchedProfile?.teamName || 'No team'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{closer.sales} Net Deals</p>
                        <p className="text-sm text-muted-foreground">
                          {formatKW(closer.totalKW || 0)} Net kW
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Avg Deal Size: {closer.avgDealSize ? formatCurrency(closer.avgDealSize) : '-'}
                        </p>
                      </div>
                    </div>
                  )
                })}
                {filteredClosers.length === 0 && (
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
