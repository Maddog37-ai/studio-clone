"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, BarChart3, Users, Settings, ArrowLeft } from 'lucide-react';

export default function TestNavigationPage() {
  const router = useRouter();

  const handleProgrammaticNavigation = (path: string) => {
    console.log('🚀 Navigating programmatically to:', path);
    router.push(path);
  };

  const handleButtonClick = (buttonName: string) => {
    console.log('🔥 Button clicked:', buttonName);
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
            Navigation Test Page
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Link Navigation Test */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Link Navigation (Next.js Links)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link 
                href="/dashboard" 
                className="p-4 border rounded-lg hover:bg-muted transition-colors flex items-center gap-2"
                onClick={() => console.log('🔗 Link clicked: Dashboard')}
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
              
              <Link 
                href="/dashboard/analytics" 
                className="p-4 border rounded-lg hover:bg-muted transition-colors flex items-center gap-2"
                onClick={() => console.log('🔗 Link clicked: Analytics')}
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Link>
              
              <Link 
                href="/dashboard/lead-management" 
                className="p-4 border rounded-lg hover:bg-muted transition-colors flex items-center gap-2"
                onClick={() => console.log('🔗 Link clicked: Lead Management')}
              >
                <Users className="h-4 w-4" />
                Lead Management
              </Link>
              
              <Link 
                href="/dashboard/admin-tools" 
                className="p-4 border rounded-lg hover:bg-muted transition-colors flex items-center gap-2"
                onClick={() => console.log('🔗 Link clicked: Admin Tools')}
              >
                <Settings className="h-4 w-4" />
                Admin Tools
              </Link>
            </div>
          </div>

          {/* Programmatic Navigation Test */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Programmatic Navigation (useRouter)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                onClick={() => handleProgrammaticNavigation('/dashboard')}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Go to Dashboard
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => handleProgrammaticNavigation('/dashboard/analytics')}
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Go to Analytics
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => handleProgrammaticNavigation('/dashboard/lead-management')}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Go to Lead Management
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => handleProgrammaticNavigation('/dashboard/admin-tools')}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Go to Admin Tools
              </Button>
            </div>
          </div>

          {/* Interactive Elements Test */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Interactive Elements Test</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={() => handleButtonClick('Primary Button')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Primary Button
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => handleButtonClick('Outline Button')}
              >
                Outline Button
              </Button>
              
              <Button 
                variant="ghost"
                onClick={() => handleButtonClick('Ghost Button')}
              >
                Ghost Button
              </Button>
            </div>
          </div>

          {/* Console Log Test */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Console Logging Test</h3>
            <div className="space-y-2">
              <Button 
                onClick={() => {
                  console.log('🧪 Test console log - Basic');
                  console.log('🔍 User agent:', navigator.userAgent);
                  console.log('📱 Window size:', { width: window.innerWidth, height: window.innerHeight });
                }}
                variant="secondary"
                className="w-full"
              >
                Log Basic Info
              </Button>
              
              <Button 
                onClick={() => {
                  console.log('🧪 Test console log - Complex object');
                  console.log('📊 Test data:', {
                    timestamp: new Date().toISOString(),
                    randomNumber: Math.random(),
                    testArray: [1, 2, 3, 'test'],
                    nestedObject: {
                      foo: 'bar',
                      nested: {
                        deep: 'value'
                      }
                    }
                  });
                }}
                variant="secondary"
                className="w-full"
              >
                Log Complex Data
              </Button>
            </div>
          </div>

          {/* Back Navigation */}
          <div className="pt-4 border-t">
            <Button 
              variant="outline"
              onClick={() => {
                console.log('🔙 Going back in history');
                router.back();
              }}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
