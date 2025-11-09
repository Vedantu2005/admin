import React, { useState, useEffect } from 'react';
import { fetchUsers, fetchUsersWithOrders, User } from '../../firebase/userService';
import { ChevronLeft, ChevronRight, User as UserIcon } from 'lucide-react';

const VisitorManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(users.length / itemsPerPage);

  // Allow the sidebar Export button to trigger the same download button here by
  // dispatching a custom event. We attach this listener before any early
  // returns so hooks order is preserved. The listener simply clicks the
  // existing export button (identified by id) which calls the existing handler.
  useEffect(() => {
    const listener = () => {
      const btn = document.getElementById('visitor-export-btn') as HTMLButtonElement | null;
      if (btn && !btn.disabled) btn.click();
    };
    window.addEventListener('admin:export-users-orders', listener);
    return () => window.removeEventListener('admin:export-users-orders', listener);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const userList = await fetchUsers();
        setUsers(userList);
      } catch (e) {
        console.error(e);
        setError('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center py-12">Loading users...</div>;
  }

  if (error) {
    return <div className="text-center py-6 text-red-600">{error}</div>;
  }

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return users.slice(startIndex, endIndex);
  };

  

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleDownloadExcel = async () => {
    setExporting(true);
    try {
      const rows = await fetchUsersWithOrders();
      if (!rows || rows.length === 0) {
        alert('No data to export');
        return;
      }

      // Helper: flatten nested objects and arrays into dotted keys
      const flatten = (obj: Record<string, unknown>, maxArrayItems = 5) => {
        const out: Record<string, unknown> = {};
        const recurse = (val: unknown, prefix = '') => {
          if (val === null || val === undefined) { out[prefix] = ''; return; }
          if (typeof val !== 'object') { out[prefix] = val; return; }
          if (Array.isArray(val)) {
            for (let i = 0; i < Math.min(val.length, maxArrayItems); i++) {
              recurse((val as unknown[])[i], prefix ? `${prefix}.${i}` : `${i}`);
            }
            if ((val as unknown[]).length > maxArrayItems) out[`${prefix}.more`] = `+${(val as unknown[]).length - maxArrayItems} more`;
            return;
          }
          for (const k of Object.keys(val as Record<string, unknown>)) {
            const v = (val as Record<string, unknown>)[k];
            const nextKey = prefix ? `${prefix}.${k}` : k;
            recurse(v, nextKey);
          }
        };
        recurse(obj, '');
        if (Object.prototype.hasOwnProperty.call(out, '')) delete out[''];
        return out;
      };

      // Normalize rows: attach parsed order object under `order` key (if available)
      const normalizedRows = rows.map(r => {
        const row = { ...(r as Record<string, unknown>) };
        const od = row['orderData'];
        if (typeof od === 'string') {
          try { row['order'] = JSON.parse(od); } catch { row['order'] = od; }
        } else if (typeof od === 'object' && od !== null) {
          row['order'] = od;
        }
        return row;
      });

      const flattenedRows = normalizedRows.map(r => flatten(r as Record<string, unknown>));

      // Try to use SheetJS if available; otherwise fall back to CSV
      try {
        const moduleName = ['x','l','s','x'].join('');
        const XLSX = await import(/* @vite-ignore */ moduleName);
        type SheetJSLite = { utils: { json_to_sheet(data: unknown[]): unknown; book_new(): unknown; book_append_sheet(wb: unknown, ws: unknown, name: string): void }; write(wb: unknown, opts: { bookType: string; type: string }): ArrayBuffer | Uint8Array };
        const XLSXmod = XLSX as unknown as SheetJSLite;
        const ws = XLSXmod.utils.json_to_sheet(flattenedRows as unknown[]);
        const wb = XLSXmod.utils.book_new();
        XLSXmod.utils.book_append_sheet(wb, ws, 'UsersAndOrders');
        const wbout = XLSXmod.write(wb, { bookType: 'xlsx', type: 'array' });
        let uint8: Uint8Array;
        if (wbout instanceof ArrayBuffer) uint8 = new Uint8Array(wbout);
        else if (wbout instanceof Uint8Array) uint8 = wbout;
  else uint8 = new Uint8Array((wbout as unknown) as ArrayBuffer);
        const blob = new Blob([uint8.buffer as ArrayBuffer], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `users_orders_${new Date().toISOString().slice(0,10)}.xlsx`; document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url);
      } catch (impErr) {
        console.warn('SheetJS import failed, falling back to CSV export:', impErr);
        // Build CSV from flattenedRows
        const headerSet = new Set<string>();
        flattenedRows.forEach(r => Object.keys(r).forEach(k => headerSet.add(k)));
        const preferredOrder = ['userId','userName','userEmail','userPhone','orderId','orderCreatedAt','orderAmount','delivered','paymentMethod','paymentStatus'];
        const headers = Array.from(headerSet);
        headers.sort((a,b) => {
          const ai = preferredOrder.indexOf(a); const bi = preferredOrder.indexOf(b);
          if (ai !== -1 || bi !== -1) return (ai === -1 ? Infinity : ai) - (bi === -1 ? Infinity : bi);
          return a.localeCompare(b);
        });
        const csvRows: string[] = [];
        csvRows.push(headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(','));
        for (const r of flattenedRows) {
          const line = headers.map(h => {
            const val = (r as Record<string, unknown>)[h];
            if (val === undefined || val === null) return '""';
            const s = typeof val === 'object' ? JSON.stringify(val) : String(val);
            return `"${s.replace(/"/g, '""')}"`;
          }).join(',');
          csvRows.push(line);
        }
        const csv = csvRows.join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `users_orders_${new Date().toISOString().slice(0,10)}.csv`; document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold" style={{ color: '#703102' }}>Visitor Management</h1>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">Total Users: {users.length}</div>
            <button
              onClick={handleDownloadExcel}
              id="visitor-export-btn"
              disabled={exporting}
              className="ml-3 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-600  disabled:opacity-50"
            >
              {exporting ? 'Exporting...' : 'You Can Export Users & Orders'}
            </button>
          </div>
      </div>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: '#FCE289' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {getCurrentPageData().map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="text-center py-12">
              <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No visitors</h3>
              <p className="mt-1 text-sm text-gray-500">Visitor records will appear here when available.</p>
            </div>
          )}
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <span className="text-sm text-gray-700">
                Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
              </span>
              <div>
                <button
                  onClick={handlePrevious}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisitorManager;
