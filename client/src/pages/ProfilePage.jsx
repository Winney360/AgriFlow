import { useState } from 'react';
import { Bell, Repeat2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

export const ProfilePage = () => {
  const { user, switchRole, toggleNotifications } = useAuth();
  const [busy, setBusy] = useState(false);

  if (!user) {
    return <p className="py-10 text-center">Profile unavailable.</p>;
  }

  const nextRole = user.role === 'buyer' ? 'seller' : 'buyer';

  const onSwitchRole = async () => {
    setBusy(true);
    await switchRole(nextRole);
    setBusy(false);
  };

  const onToggleNotifications = async () => {
    setBusy(true);
    await toggleNotifications(!user.notificationEnabled);
    setBusy(false);
  };

  return (
    <Card className="mx-auto max-w-xl space-y-4">
      <h1 className="text-3xl font-black">Profile</h1>
      <div className="space-y-1 text-sm">
        <p>
          <strong>Name:</strong> {user.name}
        </p>
        <p>
          <strong>Phone:</strong> {user.phoneNumber}
        </p>
        <p>
          <strong>Email:</strong> {user.email || 'Not provided'}
        </p>
        <p>
          <strong>Current Role:</strong> {user.role}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Button onClick={onSwitchRole} disabled={busy}>
          <Repeat2 size={16} /> Switch to {nextRole}
        </Button>
        <Button variant="outline" onClick={onToggleNotifications} disabled={busy}>
          <Bell size={16} /> Notifications {user.notificationEnabled ? 'ON' : 'OFF'}
        </Button>
      </div>
    </Card>
  );
};
