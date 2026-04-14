import React, { useState } from 'react';
import { Menu, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { ROLE_LABELS } from '../constants/roles';

/**
 * TopBar Component
 * Sticky header with page title, hamburger, notifications, and user menu
 */

const NotificationBell = () => {
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  return (
    <div className="relative">
      <button
        className="relative p-2 hover:bg-[#F0F0F0] rounded-none transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell size={24} className="text-[#121212]" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#D02020] text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-[#121212]">
            {unreadCount}
          </div>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-0 w-80 max-h-96 overflow-y-auto bg-white border-2 border-[#121212] shadow-[8px_8px_0px_0px_#121212] z-50">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b-2 border-[#121212] p-4 flex justify-between items-center">
            <p className="font-['Outfit'] font-bold text-sm uppercase">Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="btn-yellow text-xs py-1 px-2"
              >
                Mark All Read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="divide-y-2 divide-[#E0E0E0]">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-[#121212] font-['Outfit']">
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="p-4 hover:bg-[#F0F0F0] cursor-pointer transition-colors"
                >
                  <div className="flex gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-['Outfit'] font-bold text-sm text-[#121212]">
                        {notif.title}
                      </p>
                      <p className="font-['Outfit'] text-xs text-[#666666] mt-1">
                        {notif.message}
                      </p>
                      <p className="font-['Outfit'] text-xs text-[#999999] mt-2">
                        {new Date(notif.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full bg-[#1040C0] mt-2 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

const UserMenu = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="relative">
      <button
        className="flex items-center gap-3 p-2 hover:bg-[#F0F0F0] rounded-none transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-10 h-10 rounded-full bg-[#1040C0] border-2 border-[#121212] flex items-center justify-center">
          <span className="font-['Outfit'] font-bold text-white text-sm">
            {user?.name
              ?.split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()}
          </span>
        </div>
        <div className="hidden sm:block text-left">
          <p className="font-['Outfit'] font-bold text-sm text-[#121212]">
            {user?.name}
          </p>
          <p className="font-['Outfit'] text-xs text-[#999999] uppercase">
            {ROLE_LABELS[user?.role]}
          </p>
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-0 bg-white border-2 border-[#121212] shadow-[8px_8px_0px_0px_#121212] z-50">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 flex items-center gap-2 hover:bg-[#F0F0F0] text-[#121212] font-['Outfit'] font-bold text-sm uppercase"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const TopBar = ({ onMenuClick, pageTitle = '' }) => {
  return (
    <header className="sticky top-0 z-20 h-16 bg-white border-b-4 border-[#121212] shadow-[0px_4px_0px_0px_#121212] flex items-center justify-between px-4 lg:px-8">
      {/* Left Side */}
      <div className="flex items-center gap-4">
        {/* Hamburger (mobile only) */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 hover:bg-[#F0F0F0] rounded-none transition-colors"
        >
          <Menu size={24} className="text-[#121212]" />
        </button>

        {/* Page Title */}
        <h1 className="font-['Outfit'] font-black uppercase text-lg lg:text-xl text-[#121212] tracking-tight">
          {pageTitle}
        </h1>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        <NotificationBell />
        <div className="hidden sm:block w-px h-8 bg-[#E0E0E0]" />
        <UserMenu />
      </div>
    </header>
  );
};

export default TopBar;
