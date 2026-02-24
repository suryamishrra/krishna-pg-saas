import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

export default function TenantOnboarding() {
  const [tenantId, setTenantId] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const navigate = useNavigate();

  const submit = (event) => {
    event.preventDefault();

    if (tenantId.trim()) {
      localStorage.setItem('tenant_id', tenantId.trim());
    } else {
      localStorage.removeItem('tenant_id');
    }

    if (tenantSlug.trim()) {
      localStorage.setItem('tenant_slug', tenantSlug.trim());
    } else {
      localStorage.removeItem('tenant_slug');
    }

    navigate('/login');
  };

  return (
    <div className="app-shell flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_32px_64px_-40px_rgba(20,27,52,0.7)] sm:p-10">
        <p className="mono-label text-xs text-slate-500">TENANT SETUP</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Connect Your Workspace</h1>
        <p className="mt-1 text-sm text-slate-500">Set tenant id or slug before login</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <Input label="Tenant ID" value={tenantId} onChange={(e) => setTenantId(e.target.value)} placeholder="e.g. 1" />
          <Input label="Tenant Slug" value={tenantSlug} onChange={(e) => setTenantSlug(e.target.value)} placeholder="e.g. acme-pg" />

          <Button type="submit" className="w-full">
            Save and Continue
          </Button>
        </form>
      </div>
    </div>
  );
}
