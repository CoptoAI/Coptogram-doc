import * as React from 'react';
import { Metadata } from 'next';
import AdminDashboard from '@/components/AdminDashboard';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Coptogram Docs',
  description: 'Manage documentation content from A to Z.',
};

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <AdminDashboard />
    </Suspense>
  );
}
