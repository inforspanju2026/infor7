/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useCbt } from './hooks/useCbt';
import { Header, Footer } from './components/common/Header';
import { LandingPage } from './components/landing/LandingPage';
import { StudentLoginModal } from './components/auth/StudentLoginModal';
import { StaffLoginModal } from './components/auth/StaffLoginModal';
import { CbtExamView } from './components/cbt/CbtExamView';
import { AdminDashboard } from './components/admin/AdminDashboard';

export default function App() {
  const { state } = useCbt();
  const [studentLoginOpen, setStudentLoginOpen] = useState(false);
  const [staffLoginOpen, setStaffLoginOpen] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState('overview');

  const user = state.currentUser;

  // If user is a student and in an exam, render dedicated CBT student view
  if (user && user.role === 'peserta') {
    return <CbtExamView />;
  }

  // If user is staff/admin, render Admin Dashboard
  if (user && user.role !== 'peserta') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header 
          activeTab={activeAdminTab}
          setActiveTab={(tab) => {
            if (tab === 'home') {
              setActiveAdminTab('overview');
            } else {
              setActiveAdminTab(tab);
            }
          }}
        />
        <div className="flex-1">
          <AdminDashboard initialTab={activeAdminTab} />
        </div>
        <Footer />
      </div>
    );
  }

  // Otherwise, render Public Landing Page
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header 
        onOpenStudentLogin={() => setStudentLoginOpen(true)}
        onOpenStaffLogin={() => setStaffLoginOpen(true)}
      />

      <main className="flex-1">
        <LandingPage 
          onOpenStudentLogin={() => setStudentLoginOpen(true)}
          onOpenStaffLogin={() => setStaffLoginOpen(true)}
        />
      </main>

      <Footer />

      {/* Auth Modals */}
      {studentLoginOpen && (
        <StudentLoginModal 
          onClose={() => setStudentLoginOpen(false)}
          onSuccess={() => setStudentLoginOpen(false)}
        />
      )}

      {staffLoginOpen && (
        <StaffLoginModal 
          onClose={() => setStaffLoginOpen(false)}
          onSuccess={() => setStaffLoginOpen(false)}
        />
      )}
    </div>
  );
}
