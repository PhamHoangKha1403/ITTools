import { useEffect, useState } from "react";
import {
    getPremiumRequests,
    approvePremiumRequest,
    rejectPremiumRequest,
    PremiumRequest
} from "../service/api";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function PremiumRequestManager() {
  const [requests, setRequests] = useState<PremiumRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    
    try {
      const res = await getPremiumRequests();
      if (res.status === 200 && Array.isArray(res.data?.data)) {
        setRequests(res.data.data);
      } else {
        const errorMsg = `Failed to load premium requests (Status: ${res.status})`;
        console.error(errorMsg, res.data);
       
        if (loading) { 
             toast.error(errorMsg);
        }
        setRequests([]);
      }
    } catch (err: any) {
      console.error("Error fetching premium requests:", err.response?.data || err.message || err);
      const errorMsg = err.response?.data?.message || "Failed to load requests due to a network or server error.";
       if (loading) { 
            toast.error(errorMsg);
       }
      setRequests([]);
    } finally {
     
        if (loading) {
             setLoading(false);
        }
    }
  };

  useEffect(() => {
    setLoading(true); 
    fetchRequests();
  }, []);

  const handleApprove = async (requestId: number, userId: number) => {
      const confirm = window.confirm(`Approve premium request for User ID ${userId}?`);
      if (!confirm) return;

      

      try {
          await approvePremiumRequest(userId);
          toast.success(`Premium request for User ID ${userId} approved!`);
        
          fetchRequests(); 
      } catch (err: any) {
          const errorMsg = err.response?.data?.message || "Failed to approve request";
          toast.error(errorMsg);
          
      }
  };

  const handleReject = async (requestId: number, userId: number) => {
      const confirm = window.confirm(`Reject (Delete) premium request for User ID ${userId}?`);
       if (!confirm) return;

    

      try {
          await rejectPremiumRequest(userId);
          toast.success(`Premium request for User ID ${userId} rejected/deleted!`);
         
          fetchRequests(); 
      } catch (err: any) {
          const errorMsg = err.response?.data?.message || "Failed to reject request";
          toast.error(errorMsg);
        
      }
  };

  const getStatusLabel = (status: number): string => {
      switch (status) {
          case 0: return "Pending";
          case 1: return "Approved";
          case 2: return "Rejected";
          default: return "Unknown";
      }
  };

  const formatDate = (dateString: string | null | undefined): string => {
      if (!dateString) return "N/A";
      try {
          return new Date(dateString).toLocaleString();
      } catch {
          return dateString;
      }
  }

  return (
    <div className="text-white p-6 h-full flex flex-col">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <h2 className="text-2xl font-bold mb-6 flex-shrink-0">💎 Premium Requests Management</h2>
      <div className="bg-neutral-800 rounded-lg shadow-lg border border-neutral-700 overflow-auto flex-grow min-h-0">
        <table className="w-full min-w-[900px] text-left table-fixed border-collapse">
          <thead className="sticky top-0 bg-neutral-700 text-gray-300 uppercase text-sm z-10">
            <tr>
              <th className="px-3 py-3 w-[5%] border-b border-neutral-600">ID</th>
              <th className="px-3 py-3 w-[10%] border-b border-neutral-600">User ID</th>
              <th className="px-3 py-3 w-[20%] border-b border-neutral-600">Requested</th>
              <th className="px-3 py-3 w-[10%] border-b border-neutral-600">Status</th>
              <th className="px-3 py-3 w-[20%] border-b border-neutral-600">Notes</th>
              <th className="px-3 py-3 w-[15%] text-center border-b border-neutral-600">Processed</th>
              <th className="px-3 py-3 w-[15%] text-center border-b border-neutral-600">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-200 divide-y divide-neutral-700">
             {loading ? (
                <tr>
                    <td colSpan={7} className="text-center py-10 text-gray-500 italic">Loading requests...</td>
                </tr>
             ) : requests.length > 0 ? requests.map((req, index) => (
              <tr key={req.id} className={`hover:bg-neutral-700/50 transition duration-150 ease-in-out ${index % 2 === 0 ? 'bg-neutral-800' : 'bg-neutral-850'}`}>
                <td className="px-3 py-2 text-sm">{req.id}</td>
                <td className="px-3 py-2 text-sm">{req.userId}</td>
                <td className="px-3 py-2 text-sm">{formatDate(req.requestTimestamp)}</td>
                <td className="px-3 py-2 text-sm">
                     <span className={`font-semibold px-1.5 py-0.5 rounded text-xs ${req.status === 0 ? 'bg-blue-600 text-white' : req.status === 1 ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-200' }`}>
                       {getStatusLabel(req.status)}
                     </span>
                </td>
                <td className="px-3 py-2 text-sm truncate">{req.adminNotes || '—'}</td>
                <td className="px-3 py-2 text-sm text-center">
                    {req.processedByUserId ? `By: ${req.processedByUserId} at ${formatDate(req.processedTimestamp)}` : '—'}
                </td>
                <td className="px-3 py-2 text-center space-x-2">
                   {req.status === 0 && (
                     <>
                       <button
                         className="text-green-500 hover:text-green-400 hover:underline transition text-sm font-medium"
                         onClick={() => handleApprove(req.id, req.userId)}
                         title={`Approve request ${req.id} for user ${req.userId}`}
                       >
                         Approve
                       </button>
                       <button
                         className="text-red-500 hover:text-red-400 hover:underline transition text-sm font-medium"
                         onClick={() => handleReject(req.id, req.userId)}
                         title={`Reject/Delete request ${req.id} for user ${req.userId}`}
                       >
                         Reject
                       </button>
                     </>
                   )}
                    {req.status !== 0 && (<span className="text-gray-500 text-sm">—</span>)}
                </td>
              </tr>
            )) : (
               <tr>
                 <td colSpan={7} className="text-center py-10 text-gray-500 italic">
                   No pending premium requests found.
                 </td>
               </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PremiumRequestManager;