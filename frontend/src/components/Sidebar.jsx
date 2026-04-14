import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, FileText, Users, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ROLES, ROLE_LABELS } from '../constants/roles';
import Button from './Button';

/**
 * Sidebar Component
 * Bauhaus navigation sidebar with role-based menu items
 */

const BauhausLogo = () => (
  <div className="flex gap-1">
    {/* Red Circle */}
    <div className="w-4 h-4 rounded-full bg-[#D02020] border-2 border-[#121212]" />
    {/* Blue Square */}
    <div className="w-4 h-4 bg-[#1040C0] border-2 border-[#121212]" />
    {/* Yellow Triangle */}
    <div
      className="w-4 h-4 border-2 border-[#121212]"
      style={{
        clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
        backgroundColor: '#F0C020',
      }}
    />
  </div>
);

const NavItem = ({ icon: Icon, label, to, isActive }) => (
  <Link
    to={to}
    className={`
      flex items-center gap-3 px-4 py-3 rounded-none
      border-l-4 transition-all duration-150
      ${isActive
        ? 'border-l-[#F0C020] bg-[#1040C0]/40 text-white'
        : 'border-l-transparent hover:bg-[#1040C0]/20 text-white'
      }
    `}
  >
    <Icon size={20} />
    <span className="font-['Outfit'] font-medium text-sm">{label}</span>
  </Link>
);

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Get menu items based on role
  const getMenuItems = () => {
    const baseItems = [
      { icon: Home, label: 'Dashboard', to: '/' },
    ];

    switch (user?.role) {
      case ROLES.STUDENT:
        return [
          { icon: Home, label: 'Dashboard', to: '/dashboard' },
          { icon: FileText, label: 'Submit Complaint', to: '/complaints/new' },
        ];

      case ROLES.COMMITTEE_MEMBER:
      case ROLES.COMMITTEE_HEAD:
        return [
          { icon: FileText, label: 'Inbox', to: '/authority/inbox' },
        ];

      case ROLES.ADMIN:
        return [
          { icon: Home, label: 'Dashboard', to: '/admin/dashboard' },
          { icon: FileText, label: 'Routing Queue', to: '/admin/routing-queue' },
          { icon: Users, label: 'Users', to: '/admin/users' },
          { icon: Users, label: 'Committees', to: '/admin/committees' },
          { icon: Settings, label: 'Audit Logs', to: '/admin/audit-logs' },
        ];

      case ROLES.PRINCIPAL:
        return [
          { icon: Home, label: 'Dashboard', to: '/principal/dashboard' },
        ];

      default:
        return baseItems;
    }
  };

  const menuItems = getMenuItems();

  const handleLogout = () => {
    logout();
  };

  // Desktop Sidebar
  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b-4 border-[#121212]">
        <div className="flex items-center gap-2">
          <BauhausLogo />
          <span className="font-['Outfit'] font-black text-base text-white uppercase tracking-wider">
            The Complain Box
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
        {menuItems.map((item) => (
          <NavItem
            key={item.to}
            {...item}
            isActive={location.pathname === item.to}
          />
        ))}
      </nav>

      {/* User Footer */}
      <div className="border-t-4 border-[#121212] p-4 space-y-3">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-10 h-10 rounded-full bg-[#1040C0] border-2 border-[#121212] flex items-center justify-center">
            <span className="font-['Outfit'] font-bold text-white text-sm">
              {user?.name
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-['Outfit'] font-bold text-white text-sm truncate">
              {user?.name}
            </p>
            <p className="font-['Outfit'] text-xs text-[#F0C020] uppercase">
              {ROLE_LABELS[user?.role]}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2"
          onClick={handleLogout}
        >
          <LogOut size={16} />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-[#121212] border-r-4 border-[#F0C020] z-30 flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={onClose}
          />

          {/* Mobile Sidebar Panel */}
          <aside className="fixed left-0 top-0 h-screen w-64 bg-[#121212] border-r-4 border-[#F0C020] z-50 flex flex-col md:hidden">
            <div className="flex justify-end p-4 border-b-4 border-[#121212]">
              <button
                onClick={onClose}
                className="p-2 hover:bg-[#1040C0]/20 rounded-none"
              >
                <X size={24} className="text-white" />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
};

export default Sidebar;
