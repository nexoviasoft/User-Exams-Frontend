'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  UserCheck, 
  UserX,
  Mail,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminUsersPage() {
  const [tab, setTab] = useState('All');
  const [search, setSearch] = useState('');

  const users = [
    { id: '1', name: 'Rahim Ahmed', email: 'rahim@mail.com', role: 'STUDENT', joined: 'Oct 12, 2024', status: 'Active', exams: 12 },
    { id: '2', name: 'Dr. Rahman', email: 'rahman@school.com', role: 'TEACHER', joined: 'Sep 05, 2024', status: 'Active', exams: 8 },
    { id: '3', name: 'Karim Ullah', email: 'karim@mail.com', role: 'STUDENT', joined: 'Oct 10, 2024', status: 'Inactive', exams: 1 },
    { id: '4', name: 'Prof. Karim', email: 'karim@univ.com', role: 'TEACHER', joined: 'Aug 20, 2024', status: 'Active', exams: 15 },
    { id: '5', name: 'Sumaya Akter', email: 'sumaya@mail.com', role: 'STUDENT', joined: 'Oct 11, 2024', status: 'Active', exams: 4 },
  ];

  const filteredUsers = users.filter(user => {
    if (tab === 'Students' && user.role !== 'STUDENT') return false;
    if (tab === 'Teachers' && user.role !== 'TEACHER') return false;
    if (search && !user.name.toLowerCase().includes(search.toLowerCase()) && !user.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

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

        {/* Tabs */}
        <div className="flex bg-bg-card border border-border p-1 rounded-xl w-fit">
           {['All', 'Students', 'Teachers'].map((t) => (
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
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="text-sm hover:bg-bg-surface/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0",
                          user.role === 'STUDENT' ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
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
                         user.role === 'STUDENT' ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                       )}>
                         {user.role}
                       </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-[10px] text-text-secondary uppercase font-bold tracking-wider">
                        <Calendar className="w-3 h-3" /> {user.joined}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="font-bold">{user.exams}</span>
                       <span className="text-[10px] text-text-secondary ml-1">{user.role === 'STUDENT' ? 'Given' : 'Created'}</span>
                    </td>
                    <td className="px-6 py-4">
                       <Badge className={cn(
                         user.status === 'Active' ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                       )}>
                         {user.status}
                       </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2">
                         <Button variant="ghost" size="icon" className="text-text-secondary hover:text-primary rounded-lg">
                           <UserCheck className="w-4 h-4" />
                         </Button>
                         <Button variant="ghost" size="icon" className="text-text-secondary hover:text-danger rounded-lg">
                           <UserX className="w-4 h-4" />
                         </Button>
                         <Button variant="ghost" size="icon" className="text-text-secondary hover:text-text-primary rounded-lg">
                           <MoreVertical className="w-4 h-4" />
                         </Button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
