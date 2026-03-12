import { useState } from 'react';
import {
  Bell,
  Check,
  ChevronRight,
  CircleUserRound,
  Leaf,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Repeat2,
  Search,
  ShieldCheck,
  Star,
  Wheat,
} from 'lucide-react';
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
  const roleSwitchChecked = user.role === 'seller';

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

  const settingTiles = [
    { icon: CircleUserRound, title: 'Account Info', detail: 'Email / Phone' },
    { icon: MapPin, title: 'Address', detail: 'GPS & Manual' },
    { icon: Bell, title: 'Notification Preferences', detail: 'WhatsApp / Email' },
    { icon: ShieldCheck, title: 'Security', detail: 'Password' },
    { icon: Repeat2, title: 'Role Settings', detail: 'Farmer / Buyer' },
    { icon: Mail, title: 'Terms & Privacy', detail: 'Policy & Consent' },
  ];

  const recentListings = [
    {
      title: 'White Maize',
      subtitle: 'Product',
      price: 'Ksh 4,300/bag',
      cta: 'WhatsApp CTA',
      imageUrl:
        'https://images.unsplash.com/photo-1601593768799-76ea57f57b61?auto=format&fit=crop&w=500&q=80',
    },
    {
      title: 'Tomatoes',
      subtitle: 'Product',
      price: 'Ksh 4,300/bag',
      cta: 'WhatsApp CTA',
      imageUrl:
        'https://images.unsplash.com/photo-1561136594-7f68413baa99?auto=format&fit=crop&w=500&q=80',
    },
    {
      title: 'Cabbage',
      subtitle: 'Product',
      price: 'Ksh 4,200/bag',
      cta: 'WhatsApp CTA',
      imageUrl:
        'https://images.unsplash.com/photo-1594282486552-05a4f9c1c2df?auto=format&fit=crop&w=500&q=80',
    },
  ];

  const profileImageUrl =
    'https://images.unsplash.com/photo-1557862921-37829c790f19?auto=format&fit=crop&w=200&q=80';

  return (
    <div className="space-y-5 pb-6">
      <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[#1d4739]/80">
        <span>Crop Feed</span>
        <ChevronRight size={14} />
        <span>Map Search</span>
        <ChevronRight size={14} />
        <span>Messages</span>
        <ChevronRight size={14} />
        <span className="text-[#0f3528]">Profile</span>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.7fr_1fr]">
        <div className="space-y-4">
          <h1 className="text-4xl font-black tracking-tight text-[#091f17]">Welcome & Overview</h1>

          <Card className="border-[#a9d4c2] bg-[#f6fbf9] p-0">
            <div className="grid grid-cols-1 gap-0 md:grid-cols-[1.3fr_1fr]">
              <div className="flex items-center gap-4 border-b border-[#d4e7de] p-4 md:border-b-0 md:border-r">
                <img
                  src={profileImageUrl}
                  alt={user.name}
                  className="h-16 w-16 rounded-full border-2 border-[#9bc7b4] object-cover"
                />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-3xl leading-none font-black text-[#0e2a1f]">{user.name}</p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#d9f0e7] px-2 py-1 text-xs font-bold text-[#156245]">
                      <Check size={12} /> JWT Verified
                    </span>
                  </div>
                  <p className="text-sm font-bold text-[#325749] capitalize">{user.role}</p>
                  <div className="flex items-center gap-1 text-[#2aa76f]">
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                    <span className="ml-2 text-sm font-bold text-[#325749]">5.0 Stars, 28 Reviews</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 p-4">
                <p className="text-lg font-black text-[#0e2a1f]">Trust & Verification Panel</p>
                <div className="grid grid-cols-1 gap-2">
                  <div className="rounded-xl border border-[#cde5da] bg-[#edf8f3] px-3 py-2 text-sm font-bold text-[#1d5743]">
                    <span className="inline-flex items-center gap-1">
                      <ShieldCheck size={14} /> JWT verification
                    </span>
                  </div>
                  <div className="rounded-xl border border-[#cde5da] bg-[#edf8f3] px-3 py-2 text-sm font-bold text-[#1d5743]">
                    <span className="inline-flex items-center gap-1">
                      <MessageCircle size={14} /> Buyer trust: {user.role === 'seller' ? 'High' : 'Good'}
                    </span>
                  </div>
                  <div className="rounded-xl border border-[#cde5da] bg-[#edf8f3] px-3 py-2 text-sm font-bold text-[#1d5743]">
                    <span className="inline-flex items-center gap-1">
                      <Phone size={14} /> Contact: {user.phoneNumber || 'Not Added'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-[#a9d4c2] bg-[#f8fbfa]">
            <h2 className="text-4xl leading-none font-black tracking-tight text-[#12281f]">Settings Overview</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {settingTiles.map((tile) => {
                const Icon = tile.icon;
                return (
                  <div key={tile.title} className="flex items-start gap-3 rounded-xl bg-[#ecf6f1] p-3">
                    <div className="rounded-full bg-[#d7ede3] p-2 text-[#13724f]">
                      <Icon size={16} />
                    </div>
                    <div>
                      <p className="font-black text-[#17342a]">{tile.title}</p>
                      <p className="text-sm font-semibold text-[#46695d]">{tile.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                className="rounded-lg bg-[#1fa56f] px-6 font-bold"
                onClick={onToggleNotifications}
                disabled={busy}
              >
                <Bell size={16} /> Notifications {user.notificationEnabled ? 'ON' : 'OFF'}
              </Button>
              <Button
                variant="outline"
                className="rounded-lg border-[#1fa56f] bg-[#f8fbfa] text-[#0f5c40]"
                onClick={onSwitchRole}
                disabled={busy}
              >
                <Repeat2 size={16} /> Switch to {nextRole}
              </Button>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.2fr]">
            <Card className="border-[#a9d4c2] bg-[#f8fbfa] p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-3xl font-black text-[#12281f]">Local Trust</p>
                  <p className="text-sm font-semibold text-[#3c6356]">
                    Verify on WhatsApp before post/payment.
                  </p>
                </div>
                <div className="rounded-full bg-[#1da76f] px-3 py-1 text-xs font-black text-white">
                  JWT Verified
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[#cde5da] bg-[#eef8f3] p-4 text-center">
                  <Wheat className="mx-auto text-[#1c9464]" size={34} />
                  <p className="mt-2 text-xl font-black text-[#17342a]">Farmer</p>
                </div>
                <div className="rounded-2xl border border-[#cde5da] bg-[#eef8f3] p-4 text-center">
                  <Leaf className="mx-auto text-[#1c9464]" size={34} />
                  <p className="mt-2 text-xl font-black text-[#17342a]">Buyer</p>
                </div>
              </div>
            </Card>

            <Card className="border-[#a9d4c2] bg-[#f8fbfa] p-4">
              <p className="text-3xl font-black text-[#12281f]">Recent Activity & Listings</p>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {recentListings.map((listing) => (
                  <article
                    key={listing.title}
                    className="overflow-hidden rounded-xl border border-[#c8e0d6] bg-white"
                  >
                    <img src={listing.imageUrl} alt={listing.title} className="h-20 w-full object-cover" />
                    <div className="space-y-1 p-2">
                      <p className="text-sm font-black text-[#17342a]">{listing.title}</p>
                      <p className="text-xs font-semibold text-[#567d70]">{listing.subtitle}</p>
                      <p className="text-xs font-black text-[#183e31]">{listing.price}</p>
                      <p className="text-xs font-bold text-[#1da76f]">{listing.cta}</p>
                    </div>
                  </article>
                ))}
              </div>
            </Card>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-4xl font-black tracking-tight text-[#091f17]">KPI Cards</h2>

          <div className="grid grid-cols-1 gap-3">
            <Card className="border-[#9bcfb8] bg-[#dff4e9] p-4">
              <p className="text-sm font-bold text-[#23483a]">Active Listings</p>
              <p className="text-5xl leading-none font-black text-[#112d22]">12</p>
            </Card>
            <Card className="border-[#e6dab6] bg-[#fff9e7] p-4">
              <p className="text-sm font-bold text-[#5a4d2a]">Total Sales</p>
              <p className="text-5xl leading-none font-black text-[#2d2817]">2,800kg</p>
            </Card>
            <Card className="border-[#c7e0d5] bg-[#f7fbf9] p-4">
              <p className="text-sm font-bold text-[#204637]">Performance</p>
              <p className="text-4xl leading-none font-black text-[#0f3327]">98%</p>
              <p className="text-sm font-semibold text-[#45695c]">Transactions complete</p>
            </Card>
          </div>

          <Card className="border-[#a9d4c2] bg-[#f8fbfa] p-4">
            <h3 className="text-4xl leading-none font-black text-[#12281f]">Verification Status</h3>
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 rounded-lg bg-[#ebf7f2] px-3 py-2 font-bold text-[#18573f]">
                <Check size={16} /> Identity Verified
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-[#ebf7f2] px-3 py-2 font-bold text-[#18573f]">
                <Check size={16} /> Contact Verified
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-[#ebf7f2] px-3 py-2 font-bold text-[#18573f]">
                <Check size={16} /> Location Verified
              </div>
            </div>
            <p className="mt-3 rounded-lg bg-[#d7f0e4] px-3 py-2 text-sm font-black text-[#166448]">
              JWT Status: Verified
            </p>
          </Card>

          <Card className="border-[#a9d4c2] bg-[#f8fbfa] p-4">
            <h3 className="text-4xl leading-none font-black text-[#12281f]">Map Search</h3>
            <div className="relative mt-3 h-50 overflow-hidden rounded-xl border border-[#c8e0d6] bg-[#eaf2ee]">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#bfd4ca_1px,transparent_1px),linear-gradient(to_bottom,#bfd4ca_1px,transparent_1px)] bg-size-[24px_24px] opacity-60" />
              <div className="absolute top-9 left-8 h-16 w-16 rounded-full border-2 border-dashed border-[#6fa98f]" />
              <div className="absolute top-16 left-24 h-14 w-14 rounded-full border-2 border-dashed border-[#6fa98f]" />
              <div className="absolute top-21 left-38 h-18 w-18 rounded-full border-2 border-dashed border-[#6fa98f]" />
              <div className="absolute top-20 left-30 rounded-full bg-[#1f9f6a] p-2 text-white shadow-lg">
                <MapPin size={18} fill="currentColor" />
              </div>
              <div className="absolute right-3 bottom-3 rounded-full bg-white/95 p-2 text-[#197a55] shadow">
                <Search size={18} />
              </div>
            </div>
          </Card>

          <Card className="border-[#a9d4c2] bg-[#f8fbfa] p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xl font-black text-[#142f24]">You are currently:</p>
                <p className="text-lg font-bold capitalize text-[#3b6557]">{user.role}</p>
              </div>
              <button
                type="button"
                onClick={onSwitchRole}
                disabled={busy}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
                  roleSwitchChecked ? 'bg-[#1ea26c]' : 'bg-[#8caea0]'
                } disabled:opacity-60`}
              >
                <span
                  className={`inline-block h-6 w-6 rounded-full bg-white shadow transition ${
                    roleSwitchChecked ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <p className="mt-3 text-sm font-bold text-[#3b6557]">Switch to {nextRole} mode</p>
          </Card>

          <Card className="border-[#a9d4c2] bg-[#f8fbfa] p-0">
            <div className="border-b border-[#d4e7de] px-4 py-3">
              <p className="font-black text-[#173428]">Messaging</p>
            </div>
            <div className="space-y-3 px-4 py-3">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={profileImageUrl}
                      alt="Contact avatar"
                      className="h-9 w-9 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-bold text-[#143225]">Trusted contact {item}</p>
                      <p className="text-xs font-semibold text-[#4e7568]">Online now</p>
                    </div>
                  </div>
                  <div className="rounded-full bg-[#d9f0e7] p-2 text-[#14895d]">
                    <MessageCircle size={16} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
