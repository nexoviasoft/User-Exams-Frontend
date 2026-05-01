'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Search, 
  UserCheck, 
  UserX,
  Mail,
  Calendar,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  useActivateUserMutation,
  useDeactivateUserMutation,
  useGetAdminUsersQuery,
} from '@/store/slices/api/adminApi';

type TabType = 'All' | 'Students' | 'Teachers';

export default function AdminUsersPage() {
  const [tab, setTab] = useState<TabType>('All');
  const [search, setSearch] = useState('');
  const { data: users = [], isLoading, isError } = useGetAdminUsersQuery();
  const [activateUser, { isLoading: isActivating }] = useActivateUserMutation();
  const [deactivateUser, { isLoading: isDeactivating }] = useDeactivateUserMutation();

  const formatRole = (role: string) => role.toUpperCase();
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

  const filteredUsers = users.filter(user => {
    const role = formatRole(user.role);
    if (tab === 'Students' && role !== 'STUDENT') return false;
    if (tab === 'Teachers' && role !== 'TEACHER') return false;
    if (search && !user.name.toLowerCase().includes(search.toLowerCase()) && !user.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleActivate = async (userId: string) => {
    try {
      await activateUser(userId).unwrap();
      toast.success('User activated.');
    } catch {
      toast.error('Failed to activate user.');
    }
  };

  const handleDeactivate = async (userId: string) => {
    try {
      await deactivateUser(userId).unwrap();
      toast.success('User deactivated.');
    } catch {
      toast.error('Failed to deactivate user.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">User Management 👥</h1>
            <p className="text-text-secondary mt-1">প্ল্যাটফর্মের সব ইউজারদের তালিকা এবং স্ট্যাটাস ম্যানেজ করুন।</p>
          </div>

          <div className="flex items-center gap-3">
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
               <input 
                 type="text" 
                 placeholder="Search name or email..." 
                 className="bg-bg-surface border border-border rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-w-[280px]"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
               />
             </div>
          </div>
        </div>
        {isError && (
          <div className="text-center p-4 text-danger font-bold bg-danger/5 rounded-xl border border-danger/20">
            Failed to load users.
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-bg-card border border-border p-1 rounded-xl w-fit">
           {(['All', 'Students', 'Teachers'] as TabType[]).map((t) => (
             <button
               key={t}
               onClick={() => setTab(t)}
               className={cn(
                 "px-6 py-2 rounded-lg text-sm font-bold transition-all",
                 tab === t ? "bg-primary text-white" : "text-text-secondary hover:text-text-primary"
               )}
             >
               {t}
             </button>
           ))}
        </div>

        {/* Users Table */}
        <Card className="border-border bg-bg-card/50 overflow-hidden">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-surface text-text-secondary text-[10px] uppercase tracking-widest font-bold">
                  <th className="px-6 py-4">Name / Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4">Exams</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex items-center justify-center gap-2 text-text-secondary">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading users...
                      </div>
                    </td>
                  </tr>
                )}
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="text-sm hover:bg-bg-surface/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0",
                          formatRole(user.role) === 'STUDENT' ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                        )}>
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-text-primary">{user.name}</div>
                          <div className="text-[10px] text-text-secondary flex items-center gap-1"><Mail className="w-3 h-3" /> {user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <Badge className={cn(
                         formatRole(user.role) === 'STUDENT' ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                       )}>
                         {formatRole(user.role)}
                       </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-[10px] text-text-secondary uppercase font-bold tracking-wider">
                        <Calendar className="w-3 h-3" /> {formatDate(user.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="font-bold">-</span>
                       <span className="text-[10px] text-text-secondary ml-1">N/A</span>
                    </td>
                    <td className="px-6 py-4">
                       <Badge className={cn(
                         user.isActive ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                       )}>
                         {user.isActive ? 'Active' : 'Inactive'}
                       </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2">
                         <Button
                           variant="ghost"
                           size="icon"
                           className="text-text-secondary hover:text-primary rounded-lg"
                           onClick={() => handleActivate(user.id)}
                           disabled={isActivating || isDeactivating}
                         >
                           <UserCheck className="w-4 h-4" />
                         </Button>
                         <Button
                           variant="ghost"
                           size="icon"
                           className="text-text-secondary hover:text-danger rounded-lg"
                           onClick={() => handleDeactivate(user.id)}
                           disabled={isActivating || isDeactivating}
                         >
                           <UserX className="w-4 h-4" />
                         </Button>
                       </div>
                    </td>
                  </tr>
                ))}
                {!isLoading && filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-text-secondary">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
