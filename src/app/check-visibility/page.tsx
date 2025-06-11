"use client";

import { useState, useEffect as _useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { db, auth } from "@/lib/firebase";
import { collection, query as _query, where as _where, getDocs, onSnapshot as _onSnapshot } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users as _Users, Search, AlertCircle as _AlertCircle } from "lucide-react";

interface UserData {
  uid: string;
  email?: string;
  displayName?: string;
  role?: string;
  teamId?: string;
  status?: string;
}

interface CloserData {
  uid: string;
  name: string;
  status: string;
  teamId: string;
  role?: string;
  lineupOrder?: number;
}

interface TeamData {
  id: string;
  name: string;
  [key: string]: unknown;
}

export default function CheckUserVisibilityPage() {
  const { user } = useAuth();
  const [_allUsers, setAllUsers] = useState<UserData[]>([]);
  const [_allClosers, setAllClosers] = useState<CloserData[]>([]);
  const [_allTeams, setAllTeams] = useState<TeamData[]>([]);
  const [_targetUsers, setTargetUsers] = useState<UserData[]>([]);
  const [_targetClosers, setTargetClosers] = useState<CloserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string>("");

  const targetNames = [
    'Sebastian Vizcarrondo',
    'Andrea Rovayo', 
    'Joshua Long',
    'Sebastian',
    'Andrea',
    'Joshua'
  ];

  const checkVisibility = async () => {
    if (!user) {
      setResults("❌ Please sign in first");
      return;
    }

    setLoading(true);
    setResults("🔍 Checking user visibility...\n");

    try {
      // Get all users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const allUsersData: UserData[] = [];
      
      usersSnapshot.forEach(doc => {
        allUsersData.push({
          uid: doc.id,
          ...doc.data()
        });
      });
      
      setAllUsers(allUsersData);
      setResults(prev => prev + `📋 Found ${allUsersData.length} total users\n`);

      // Get all closers
      const closersSnapshot = await getDocs(collection(db, 'closers'));
      const allClosersData: CloserData[] = [];
      
      closersSnapshot.forEach(doc => {
        const data = doc.data();
        allClosersData.push({
          uid: doc.id,
          name: data.name || '',
          status: data.status || '',
          teamId: data.teamId || '',
          role: data.role,
          lineupOrder: data.lineupOrder
        });
      });
      
      setAllClosers(allClosersData);
      setResults(prev => prev + `🚪 Found ${allClosersData.length} total closers\n`);

      // Get all teams
      const teamsSnapshot = await getDocs(collection(db, 'teams'));
      const allTeamsData: TeamData[] = [];
      
      teamsSnapshot.forEach(doc => {
        const data = doc.data();
        allTeamsData.push({
          id: doc.id,
          name: data.name || doc.id, // Fallback to id if name is missing
          ...data
        } as TeamData);
      });
      
      setAllTeams(allTeamsData);
      setResults(prev => prev + `🏢 Found ${allTeamsData.length} total teams\n\n`);

      // Search for target users
      const foundUsers = allUsersData.filter(userData => {
        const displayName = userData.displayName || '';
        const email = userData.email || '';
        
        return targetNames.some(name => 
          displayName.toLowerCase().includes(name.toLowerCase()) ||
          email.toLowerCase().includes(name.toLowerCase())
        );
      });
      
      setTargetUsers(foundUsers);
      setResults(prev => prev + `🎯 Found ${foundUsers.length} matching users:\n`);
      
      foundUsers.forEach(userData => {
        setResults(prev => prev + `  - ${userData.displayName || userData.email} (${userData.uid})\n`);
        setResults(prev => prev + `    Email: ${userData.email}\n`);
        setResults(prev => prev + `    Role: ${userData.role}\n`);
        setResults(prev => prev + `    Team ID: ${userData.teamId}\n\n`);
      });

      // Search for target closers
      const foundClosers = allClosersData.filter(closer => {
        const name = closer.name || '';
        
        return targetNames.some(targetName => 
          name.toLowerCase().includes(targetName.toLowerCase())
        );
      });
      
      setTargetClosers(foundClosers);
      setResults(prev => prev + `🚪 Found ${foundClosers.length} matching closers:\n`);
      
      foundClosers.forEach(closer => {
        setResults(prev => prev + `  - ${closer.name} (${closer.uid})\n`);
        setResults(prev => prev + `    Status: ${closer.status}\n`);
        setResults(prev => prev + `    Team ID: ${closer.teamId}\n`);
        setResults(prev => prev + `    Role: ${closer.role || 'N/A'}\n`);
        setResults(prev => prev + `    Lineup Order: ${closer.lineupOrder || 'N/A'}\n\n`);
      });

      // Check current user's team
      setResults(prev => prev + `🔑 Current user (${user.displayName || user.email}):\n`);
      setResults(prev => prev + `  Team ID: ${user.teamId}\n`);
      setResults(prev => prev + `  Role: ${user.role}\n\n`);

      // Show team breakdown
      setResults(prev => prev + `🏢 Teams breakdown:\n`);
      allTeamsData.forEach(team => {
        const teamUsers = allUsersData.filter(u => u.teamId === team.id);
        const teamClosers = allClosersData.filter(c => c.teamId === team.id);
        
        setResults(prev => prev + `  - ${team.name} (${team.id}):\n`);
        setResults(prev => prev + `    Users: ${teamUsers.length}, Closers: ${teamClosers.length}\n`);
        
        if (team.id === user.teamId) {
          setResults(prev => prev + `    ⭐ This is your team!\n`);
          setResults(prev => prev + `    Team users:\n`);
          teamUsers.forEach(u => {
            setResults(prev => prev + `      - ${u.displayName || u.email} (${u.role})\n`);
          });
          setResults(prev => prev + `    Team closers:\n`);
          teamClosers.forEach(c => {
            setResults(prev => prev + `      - ${c.name} (${c.status})\n`);
          });
        }
        setResults(prev => prev + `\n`);
      });

      // Analyze why target users might not be visible
      setResults(prev => prev + `🔍 Analysis:\n`);
      
      if (foundUsers.length === 0) {
        setResults(prev => prev + `❌ No target users found in database\n`);
      } else {
        foundUsers.forEach(targetUser => {
          if (targetUser.teamId !== user.teamId) {
            setResults(prev => prev + `⚠️  ${targetUser.displayName || targetUser.email} is on team "${targetUser.teamId}" but you're on team "${user.teamId}"\n`);
          } else {
            setResults(prev => prev + `✅ ${targetUser.displayName || targetUser.email} is on your team\n`);
          }
        });
      }
      
      if (foundClosers.length === 0) {
        setResults(prev => prev + `❌ No target closers found in database\n`);
      } else {
        foundClosers.forEach(targetCloser => {
          if (targetCloser.teamId !== user.teamId) {
            setResults(prev => prev + `⚠️  ${targetCloser.name} (closer) is on team "${targetCloser.teamId}" but you're on team "${user.teamId}"\n`);
          } else {
            setResults(prev => prev + `✅ ${targetCloser.name} (closer) is on your team\n`);
          }
        });
      }

    } catch (error) {
      setResults(prev => prev + `❌ Error: ${error}\n`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, "ryan.madden@test.com", "test123");
      setResults("✅ Signed in as Ryan Madden\n");
    } catch (error) {
      setResults(`❌ Failed to sign in: ${error}\n`);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-6 w-6" />
            User Visibility Checker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!user ? (
            <div className="text-center">
              <Button onClick={handleSignIn}>
                Sign in as Ryan Madden
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="outline">
                    Signed in as: {user.displayName || user.email}
                  </Badge>
                  <Badge variant="outline" className="ml-2">
                    Team: {user.teamId}
                  </Badge>
                  <Badge variant="outline" className="ml-2">
                    Role: {user.role}
                  </Badge>
                </div>
                <Button onClick={checkVisibility} disabled={loading}>
                  {loading ? "Checking..." : "Check Visibility"}
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Looking for:</h3>
                  <div className="flex flex-wrap gap-2">
                    {targetNames.slice(0, 3).map(name => (
                      <Badge key={name} variant="secondary">{name}</Badge>
                    ))}
                  </div>
                </div>

                {results && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="whitespace-pre-wrap text-sm font-mono bg-gray-50 dark:bg-gray-900 p-4 rounded-md overflow-auto max-h-96">
                        {results}
                      </pre>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
