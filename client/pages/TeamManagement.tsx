import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Mail,
  MoreVertical,
  Shield,
  Users,
  Crown,
  Eye,
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "creator" | "viewer";
  status: "active" | "pending" | "inactive";
  avatar?: string;
  lastActivity: string;
  brands: string[];
}

export default function TeamManagement() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      // Mock data - replace with actual API call
      const mockMembers: TeamMember[] = [
        {
          id: "1",
          name: "John Smith",
          email: "john@agency.com",
          role: "admin",
          status: "active",
          lastActivity: new Date().toISOString(),
          brands: ["Nike", "Apple", "Tesla"],
        },
        {
          id: "2",
          name: "Sarah Johnson",
          email: "sarah@agency.com",
          role: "manager",
          status: "active",
          lastActivity: new Date(Date.now() - 3600000).toISOString(),
          brands: ["Nike", "Apple"],
        },
        {
          id: "3",
          name: "Mike Chen",
          email: "mike@agency.com",
          role: "creator",
          status: "active",
          lastActivity: new Date(Date.now() - 86400000).toISOString(),
          brands: ["Tesla"],
        },
        {
          id: "4",
          name: "Emily Davis",
          email: "emily@client.com",
          role: "viewer",
          status: "pending",
          lastActivity: new Date(Date.now() - 172800000).toISOString(),
          brands: ["Nike"],
        },
      ];
      setMembers(mockMembers);
    } catch (error) {
      console.error("Failed to load team members:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getRoleIcon = (role: TeamMember["role"]) => {
    switch (role) {
      case "admin":
        return <Crown className="h-4 w-4" />;
      case "manager":
        return <Shield className="h-4 w-4" />;
      case "creator":
        return <Users className="h-4 w-4" />;
      case "viewer":
        return <Eye className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: TeamMember["role"]) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "manager":
        return "bg-blue-100 text-blue-800";
      case "creator":
        return "bg-green-100 text-green-800";
      case "viewer":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: TeamMember["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-20 bg-gray-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600">
            Manage team members and their permissions
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Invite Member
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search team members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Team Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members ({filteredMembers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredMembers.map((member) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                getRoleIcon={getRoleIcon}
                getRoleColor={getRoleColor}
                getStatusColor={getStatusColor}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TeamMemberCard({
  member,
  getRoleIcon,
  getRoleColor,
  getStatusColor,
}: {
  member: TeamMember;
  getRoleIcon: (role: TeamMember["role"]) => React.ReactNode;
  getRoleColor: (role: TeamMember["role"]) => string;
  getStatusColor: (status: TeamMember["status"]) => string;
}) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
          <span className="font-semibold text-gray-600">
            {member.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </span>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium">{member.name}</h3>
            <Badge className={getRoleColor(member.role)}>
              <div className="flex items-center gap-1">
                {getRoleIcon(member.role)}
                <span className="capitalize">{member.role}</span>
              </div>
            </Badge>
            <Badge className={getStatusColor(member.status)}>
              {member.status}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="h-3 w-3" />
            <span>{member.email}</span>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">
              Brands: {member.brands.join(", ")}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="text-right text-sm text-gray-500">
          <p>Last active</p>
          <p>{new Date(member.lastActivity).toLocaleDateString()}</p>
        </div>

        <Button variant="ghost" size="sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
