
// We can't modify the Navbar directly as it's in the read-only files
// Instead, we'll create a NavbarActions component that can be used within the Navbar

import React from 'react';
import NotificationBell from '@/components/notifications/NotificationBell';

const NavbarActions = () => {
  return (
    <div className="flex items-center space-x-2">
      <NotificationBell />
      {/* Theme toggle will be rendered by the original Navbar component */}
    </div>
  );
};

export default NavbarActions;
