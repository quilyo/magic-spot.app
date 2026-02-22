import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/hooks/useAuth';
import {
  getAllUsers,
  adminUpdateUserRole,
  adminCreateSubscription,
  adminUpdateSubscription,
  adminDeleteSubscription,
} from '@/app/services/subscription';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { toast } from 'sonner';
import {
  Users,
  Search,
  Shield,
  ShieldCheck,
  Crown,
  Zap,
  XCircle,
  Trash2,
  ArrowLeft,
  RefreshCw,
  UserCheck,
  UserX,
  Plus,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  Check,
} from 'lucide-react';

interface UserRow {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  subscriptions: Array<{
    id: string;
    tier: string;
    status: string;
    starts_at: string;
    expires_at: string | null;
  }>;
}

export function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    fetchUsers();
  }, [isAdmin, navigate]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
    toast.success('Users refreshed');
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await adminUpdateUserRole(userId, newRole as 'user' | 'admin');
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      toast.success(`User role updated to ${newRole}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update role');
    }
  };

  const handleGrantBeta = async (userId: string) => {
    try {
      await adminCreateSubscription(userId, 'beta', '2026-12-31T23:59:59Z');
      await fetchUsers();
      toast.success('Beta access granted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to grant beta');
    }
  };

  const handleGrantPro = async (userId: string) => {
    try {
      await adminCreateSubscription(userId, 'pro', null);
      await fetchUsers();
      toast.success('Pro access granted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to grant pro');
    }
  };

  const handleCancelSubscription = async (subId: string) => {
    try {
      await adminUpdateSubscription(subId, { status: 'cancelled' });
      await fetchUsers();
      toast.success('Subscription cancelled');
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel subscription');
    }
  };

  const handleDeleteSubscription = async (subId: string) => {
    try {
      await adminDeleteSubscription(subId);
      await fetchUsers();
      toast.success('Subscription removed');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete subscription');
    }
  };

  const handleUpdateExpiry = async (subId: string, newDate: string | null) => {
    try {
      await adminUpdateSubscription(subId, { expires_at: newDate });
      setUsers((prev) =>
        prev.map((u) => ({
          ...u,
          subscriptions: u.subscriptions.map((s) =>
            s.id === subId ? { ...s, expires_at: newDate } : s
          ),
        }))
      );
      toast.success('Expiration date updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update expiration');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === 'admin').length,
    withSub: users.filter((u) => u.subscriptions?.some((s) => s.status === 'active')).length,
    beta: users.filter((u) =>
      u.subscriptions?.some((s) => s.tier === 'beta' && s.status === 'active')
    ).length,
    pro: users.filter((u) =>
      u.subscriptions?.some((s) => s.tier === 'pro' && s.status === 'active')
    ).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <RefreshCw className="w-5 h-5 animate-spin" />
          Loading admin dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
                className="rounded-xl"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Map</span>
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  Admin Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  Manage users and subscriptions
                </p>
              </div>
            </div>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={refreshing}
              className="rounded-xl self-end sm:self-auto"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <StatCard icon={<Users className="w-5 h-5" />} label="Total Users" value={stats.total} color="blue" />
          <StatCard icon={<ShieldCheck className="w-5 h-5" />} label="Admins" value={stats.admins} color="purple" />
          <StatCard icon={<UserCheck className="w-5 h-5" />} label="Subscribed" value={stats.withSub} color="green" />
          <StatCard icon={<Zap className="w-5 h-5" />} label="Beta Users" value={stats.beta} color="amber" />
          <StatCard icon={<Crown className="w-5 h-5" />} label="Pro Users" value={stats.pro} color="blue" />
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl bg-white/80 backdrop-blur-sm border-gray-200"
          />
        </div>

        {/* Users List */}
        <div className="space-y-3">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <UserX className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>No users found</p>
            </div>
          ) : (
            filteredUsers.map((u) => (
              <UserCard
                key={u.id}
                user={u}
                isCurrentUser={u.id === user?.id}
                expanded={expandedUser === u.id}
                onToggleExpand={() =>
                  setExpandedUser(expandedUser === u.id ? null : u.id)
                }
                onToggleRole={() => handleToggleRole(u.id, u.role)}
                onGrantBeta={() => handleGrantBeta(u.id)}
                onGrantPro={() => handleGrantPro(u.id)}
                onCancelSubscription={handleCancelSubscription}
                onDeleteSubscription={handleDeleteSubscription}
                onUpdateExpiry={handleUpdateExpiry}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    green: 'bg-green-100 text-green-700',
    amber: 'bg-amber-100 text-amber-700',
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${colors[color] || colors.blue}`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function UserCard({
  user,
  isCurrentUser,
  expanded,
  onToggleExpand,
  onToggleRole,
  onGrantBeta,
  onGrantPro,
  onCancelSubscription,
  onDeleteSubscription,
  onUpdateExpiry,
}: {
  user: UserRow;
  isCurrentUser: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleRole: () => void;
  onGrantBeta: () => void;
  onGrantPro: () => void;
  onCancelSubscription: (subId: string) => void;
  onDeleteSubscription: (subId: string) => void;
  onUpdateExpiry: (subId: string, newDate: string | null) => void;
}) {
  const activeSub = user.subscriptions?.find((s) => s.status === 'active');
  const isAdmin = user.role === 'admin';

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all">
      {/* User Summary Row */}
      <button
        onClick={onToggleExpand}
        className="w-full px-4 sm:px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Avatar */}
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm ${
              isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
            }`}
          >
            {(user.name || user.email).charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900 text-sm truncate">
                {user.name || 'No name'}
              </span>
              {isAdmin && (
                <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Admin
                </span>
              )}
              {isCurrentUser && (
                <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  You
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {activeSub && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase text-white ${
                activeSub.tier === 'pro' ? 'bg-blue-600' : 'bg-amber-500'
              }`}
            >
              {activeSub.tier}
            </span>
          )}
          {!activeSub && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-gray-200 text-gray-600">
              No Sub
            </span>
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-4 sm:px-5 pb-4 border-t border-gray-100 pt-4 space-y-4">
          {/* User Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Joined:</span>{' '}
              <span className="text-gray-900">
                {new Date(user.created_at).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Role:</span>{' '}
              <span className="text-gray-900 capitalize">{user.role}</span>
            </div>
          </div>

          {/* Subscriptions */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Subscriptions</h4>
            {user.subscriptions && user.subscriptions.length > 0 ? (
              <div className="space-y-2">
                {user.subscriptions.map((sub) => (
                  <SubscriptionRow
                    key={sub.id}
                    sub={sub}
                    onCancel={() => onCancelSubscription(sub.id)}
                    onDelete={() => onDeleteSubscription(sub.id)}
                    onUpdateExpiry={(date) => onUpdateExpiry(sub.id, date)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No subscriptions</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
            <Button
              onClick={onToggleRole}
              size="sm"
              variant="outline"
              className="text-xs rounded-lg"
              disabled={isCurrentUser}
            >
              {isAdmin ? (
                <><UserX className="w-3 h-3 mr-1" /> Remove Admin</>
              ) : (
                <><ShieldCheck className="w-3 h-3 mr-1" /> Make Admin</>
              )}
            </Button>
            <Button
              onClick={onGrantBeta}
              size="sm"
              variant="outline"
              className="text-xs rounded-lg text-amber-700 border-amber-300 hover:bg-amber-50"
            >
              <Plus className="w-3 h-3 mr-1" />
              Grant Beta
            </Button>
            <Button
              onClick={onGrantPro}
              size="sm"
              variant="outline"
              className="text-xs rounded-lg text-blue-700 border-blue-300 hover:bg-blue-50"
            >
              <Plus className="w-3 h-3 mr-1" />
              Grant Pro
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function SubscriptionRow({
  sub,
  onCancel,
  onDelete,
  onUpdateExpiry,
}: {
  sub: { id: string; tier: string; status: string; starts_at: string; expires_at: string | null };
  onCancel: () => void;
  onDelete: () => void;
  onUpdateExpiry: (date: string | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [dateValue, setDateValue] = useState('');

  const startEditing = () => {
    // Convert ISO to YYYY-MM-DD for input[type=date]
    if (sub.expires_at) {
      setDateValue(sub.expires_at.slice(0, 10));
    } else {
      setDateValue('');
    }
    setEditing(true);
  };

  const saveDate = () => {
    if (dateValue) {
      onUpdateExpiry(dateValue + 'T23:59:59Z');
    } else {
      onUpdateExpiry(null);
    }
    setEditing(false);
  };

  return (
    <div
      className={`p-3 rounded-lg border text-sm space-y-2 ${
        sub.status === 'active'
          ? 'bg-green-50 border-green-200'
          : 'bg-gray-50 border-gray-200'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center flex-wrap gap-1">
          <span className="font-medium capitalize">{sub.tier}</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              sub.status === 'active'
                ? 'bg-green-200 text-green-800'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {sub.status}
          </span>
        </div>
        <div className="flex gap-1">
          {sub.status === 'active' && (
            <Button
              onClick={onCancel}
              size="sm"
              variant="outline"
              className="text-xs rounded-lg h-7 px-2 text-orange-600 border-orange-300 hover:bg-orange-50"
            >
              <XCircle className="w-3 h-3 mr-1" />
              Cancel
            </Button>
          )}
          <Button
            onClick={onDelete}
            size="sm"
            variant="outline"
            className="text-xs rounded-lg h-7 px-2 text-red-600 border-red-300 hover:bg-red-50"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Delete
          </Button>
        </div>
      </div>

      {/* Expiry date row */}
      <div className="flex items-center gap-2 flex-wrap">
        <Calendar className="w-3.5 h-3.5 text-gray-400" />
        {editing ? (
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
              className="text-xs border border-gray-300 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
            <Button
              onClick={saveDate}
              size="sm"
              className="h-7 px-2 text-xs rounded-lg bg-green-600 hover:bg-green-700 text-white"
            >
              <Check className="w-3 h-3" />
            </Button>
            <Button
              onClick={() => setEditing(false)}
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs rounded-lg"
            >
              ✕
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500">
              Expires:{' '}
              {sub.expires_at
                ? new Date(sub.expires_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Never'}
            </span>
            <button
              onClick={startEditing}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Edit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
