"use client";

import TeamMembershipChecker from "@/components/team-membership-checker";

export default function TeamMembershipPage() {
  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Team Membership Investigation</h1>
        <p className="text-gray-600 mt-2">
          Check if Richard Niger and Marcelo Guerra are on the same team
        </p>
      </div>
      <TeamMembershipChecker />
    </div>
  );
}
