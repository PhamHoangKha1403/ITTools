import { useEffect, useState } from "react";
import {
    getPremiumRequests,
    approvePremiumRequest,
    rejectPremiumRequest,
    PremiumRequest
} from "../service/api"; 
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { AxiosError } from 'axios';

function PremiumRequestManager() {
    const [requests, setRequests] = useState<PremiumRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await getPremiumRequests();
    
            if (res.status === 200 && Array.isArray(res.data?.data)) {
                setRequests(res.data.data);
            } else {
                let errorMessage = `Failed to load requests (Status: ${res.status})`;
            
                if (res.data && typeof res.data === 'object' && 'message' in res.data) {
                    errorMessage = (res.data as { message: string }).message || errorMessage;
                }
                console.error(`API Error fetching requests: Status ${res.status}`, res.data);
                toast.error(errorMessage);
                setRequests([]);
            }
        } catch (err) {
            const error = err as AxiosError<{ message?: string }>;
            console.error("Error fetching premium requests:", error.response?.data || error.message || err);
            const errorMsg = error.response?.data?.message || "Failed to load requests due to a network/server error.";
            toast.error(errorMsg);
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleApprove = async (requestId: number, userId: number) => { 
        const confirm = window.confirm(`Approve premium request ID ${requestId} for User ID ${userId}?`);
        if (!confirm) return;

        try {
         
            await approvePremiumRequest(requestId); 
            toast.success(`Premium request ID ${requestId} approved!`);
            fetchRequests();
        } catch (err) {
            const error = err as AxiosError<{ message?: string }>;
            const errorMsg = error.response?.data?.message || `Failed to approve request ID ${requestId}`;
            console.error("Error approving request:", error.response?.data || error.message || err);
            toast.error(errorMsg);
        }
    };

    const handleReject = async (requestId: number, userId: number) => { 
        const confirm = window.confirm(`Reject (Delete) premium request ID ${requestId} for User ID ${userId}?`);
        if (!confirm) return;

        try {
            
            await rejectPremiumRequest(requestId); 
            toast.success(`Premium request ID ${requestId} rejected/deleted!`);
            fetchRequests(); 
        } catch (err) {
            const error = err as AxiosError<{ message?: string }>;
            const errorMsg = error.response?.data?.message || `Failed to reject request ID ${requestId}`;
            console.error("Error rejecting request:", error.response?.data || error.message || err);
            toast.error(errorMsg);
        }
    };

    const getStatusLabel = (status: number): string => {
        switch (status) {
            case 0: return "Pending";
            case 1: return "Approved";
            case 2: return "Rejected";
            default: return `Unknown (${status})`;
        }
    };

    const formatDate = (dateString: string | null | undefined): string => {
        if (!dateString) return "N/A";
        try {
            return new Date(dateString).toLocaleString(undefined, {
                year: 'numeric', month: 'numeric', day: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
            });
        } catch {
            return dateString; 
        }
    }

    return (
        <div className="text-white p-6">
            <h2 className="text-2xl font-bold mb-6">💎 Premium Requests Management</h2>
            <div className="bg-neutral-800 rounded-lg shadow-lg border border-neutral-700 overflow-auto">
                <table className="w-full min-w-[900px] text-left table-fixed border-collapse">
                    <thead className="sticky top-0 bg-neutral-700 text-gray-300 uppercase text-sm z-10">
                        <tr>
                            <th className="px-3 py-3 w-[5%] border-b border-neutral-600">Req ID</th>
                            <th className="px-3 py-3 w-[10%] border-b border-neutral-600">User ID</th>
                            <th className="px-3 py-3 w-[15%] border-b border-neutral-600">Username</th>
                            <th className="px-3 py-3 w-[15%] border-b border-neutral-600">Requested Date</th>
                            <th className="px-3 py-3 w-[10%] border-b border-neutral-600">Status</th>
                            <th className="px-3 py-3 w-[15%] border-b border-neutral-600">Notes</th>
                            <th className="px-3 py-3 w-[15%] text-center border-b border-neutral-600">Processed</th>
                            <th className="px-3 py-3 w-[15%] text-center border-b border-neutral-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-200 divide-y divide-neutral-700">
                        {loading ? (
                            <tr>
                                <td colSpan={8} className="text-center py-10 text-gray-500 italic">Loading requests...</td>
                            </tr>
                        ) : requests.length > 0 ? requests.map((req) => (
                            <tr key={req.id} className={`hover:bg-neutral-700/50 transition duration-150 ease-in-out`}>
                                <td className="px-3 py-2 text-sm">{req.id}</td>
                                <td className="px-3 py-2 text-sm">{req.requestedUser.id}</td>
                                <td className="px-3 py-2 text-sm">{req.requestedUser.username || 'N/A'}</td> {/* Hiển thị username */}
                                <td className="px-3 py-2 text-sm">{formatDate(req.requestTimestamp)}</td>
                                <td className="px-3 py-2 text-sm">
                                    <span className={`font-semibold px-1.5 py-0.5 rounded text-xs ${req.status === 0 ? 'bg-yellow-600 text-white' : req.status === 1 ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}> {/* Sửa màu cho Pending/Rejected */}
                                        {getStatusLabel(req.status)}
                                    </span>
                                </td>
                                <td className="px-3 py-2 text-sm truncate" title={req.adminNotes || ''}>{req.adminNotes || '—'}</td>
                                <td className="px-3 py-2 text-sm text-center">
                                    {req.processedByUser?.id ? `By: ${req.processedByUser.username} at ${formatDate(req.processedTimestamp)}` : '—'}
                                </td>
                                <td className="px-3 py-2 text-center space-x-2">
                         
                                    {req.status === 0 && (
                                        <>
                                            <button
                                                className="text-green-500 hover:text-green-400 hover:underline transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                onClick={() => handleApprove(req.id, req.requestedUser.id)}
                                                title={`Approve request ${req.id} for user ${req.requestedUser.username}`}
                                                
                                            >
                                                Approve
                                            </button>
                                            <button
                                                className="text-red-500 hover:text-red-400 hover:underline transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                onClick={() => handleReject(req.id, req.requestedUser.id)}
                                                title={`Reject/Delete request ${req.id} for user ${req.requestedUser.username}`}
                                             
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
                                <td colSpan={8} className="text-center py-10 text-gray-500 italic">
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