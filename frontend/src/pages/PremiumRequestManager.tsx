import { useEffect, useState, useRef } from "react";
import { createPortal } from 'react-dom';
import {
    getPremiumRequests,
    approvePremiumRequest,
    rejectPremiumRequest,
    deletePremiumRequest,
    PremiumRequest
    // Không cần UserDTO ở đây nữa nếu chỉ re-fetch
} from "../service/api";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { AxiosError } from 'axios';

interface PortalProps {
  children: React.ReactNode;
  wrapperId?: string;
}

function createWrapperAndAppendToBody(wrapperId: string) {
  const wrapperElement = document.createElement('div');
  wrapperElement.setAttribute("id", wrapperId);
  document.body.appendChild(wrapperElement);
  return wrapperElement;
}

function ReactPortal({ children, wrapperId = 'react-portal-wrapper' }: PortalProps) {
  const [wrapperElement, setWrapperElement] = useState<HTMLElement | null>(null);
  const portalWrapperRef = useRef<HTMLElement | null>(null);

  if (!portalWrapperRef.current) {
      portalWrapperRef.current = document.getElementById(wrapperId) || createWrapperAndAppendToBody(wrapperId);
  }

  useEffect(() => {
    setWrapperElement(portalWrapperRef.current);
    return () => {};
  }, [wrapperId]);

  if (wrapperElement === null) return null;

  return createPortal(children, wrapperElement);
}

interface PremiumRequestActionMenuProps {
    request: PremiumRequest;
    onApprove: (requestId: number, userId: number) => Promise<void>;
    onReject: (requestId: number, userId: number) => Promise<void>;
    onDelete: (requestId: number, userId: number) => Promise<void>;
}

function PremiumRequestActionMenu({ request, onApprove, onReject, onDelete }: PremiumRequestActionMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });

    const handleToggle = () => {
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const top = rect.bottom + window.scrollY;
            const right = window.innerWidth - rect.right - window.scrollX;

            setDropdownPosition({ top, right });
        }
        setIsOpen(!isOpen);
    };

    const handleActionClick = (action: () => Promise<void>) => {
        action();
        setIsOpen(false);
    };

    const handleApproveClick = () => {
        handleActionClick(() => onApprove(request.id, request.requestedUser.id));
    };

    const handleRejectClick = () => {
        handleActionClick(() => onReject(request.id, request.requestedUser.id));
    };

     const handleDeleteClick = () => {
        handleActionClick(() => onDelete(request.id, request.requestedUser.id));
    };


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (buttonRef.current && buttonRef.current.contains(event.target as Node)) {
                 return;
            }
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef, buttonRef]);

    const isPending = request.status === 0;

    return (
        <div className="relative inline-block text-left">
            <div>
                <button
                    ref={buttonRef}
                    type="button"
                    className="inline-flex justify-center items-center rounded-full p-1 text-gray-400 hover:text-gray-200 hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-800 focus:ring-neutral-500"
                    id={`request-menu-button-${request.id}`}
                    aria-expanded="true"
                    aria-haspopup="true"
                    onClick={handleToggle}
                    title="Request actions"
                >
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                </button>
            </div>

            {isOpen && (
                 <ReactPortal wrapperId="premium-request-dropdown-portal">
                    <div
                        ref={menuRef}
                        className="origin-top-right absolute mt-0 w-48 rounded-md shadow-lg bg-neutral-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                        style={{
                            top: `${dropdownPosition.top}px`,
                            right: `${dropdownPosition.right}px`,
                        }}
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby={`request-menu-button-${request.id}`}
                    >
                        <div className="py-1" role="none">
                            {isPending && (
                                <>
                                    <button
                                        className="flex items-center w-full text-left px-4 py-2 text-sm text-green-500 hover:bg-neutral-600 hover:text-green-400 border-b border-neutral-600"
                                        role="menuitem"
                                        onClick={handleApproveClick}
                                    >
                                         <svg className="mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        Approve
                                    </button>
                                    <button
                                        className="flex items-center w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-neutral-600 hover:text-red-400 border-b border-neutral-600"
                                        role="menuitem"
                                        onClick={handleRejectClick}
                                    >
                                        <svg className="mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                        Reject
                                    </button>
                                </>
                            )}
                            <button
                                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-400 hover:bg-neutral-600 hover:hover:text-gray-300"
                                role="menuitem"
                                onClick={handleDeleteClick}
                            >
                                 <svg className="mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553l-.724 1.447H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Delete
                            </button>
                        </div>
                    </div>
                 </ReactPortal>
            )}
        </div>
    );
}


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

    // Khôi phục logic cũ: gọi fetchRequests() sau khi hành động thành công
    const handleApprove = async (requestId: number, userId: number) => {
        const confirm = window.confirm(`Approve premium request ID ${requestId} for User ID ${userId}?`);
        if (!confirm) return;

        try {
            // Chỉ cần await API call, không cần kiểm tra chi tiết res.status/data
            await approvePremiumRequest(requestId);
            toast.success(`Premium request ID ${requestId} approved!`);
            // Gọi lại hàm fetch để cập nhật toàn bộ danh sách từ backend
            fetchRequests();
        } catch (err) {
            const error = err as AxiosError<{ message?: string }>;
            const errorMsg = error.response?.data?.message || `Failed to approve request ID ${requestId}`;
            console.error("Error approving request:", error.response?.data || error.message || err);
            toast.error(errorMsg);
        }
    };

    // Khôi phục logic cũ: gọi fetchRequests() sau khi hành động thành công
    const handleReject = async (requestId: number, userId: number) => {
        const confirm = window.confirm(`Reject premium request ID ${requestId} for User ID ${userId}?`);
        if (!confirm) return;

        try {
             // Chỉ cần await API call, không cần kiểm tra chi tiết res.status/data
             await rejectPremiumRequest(requestId);
             toast.success(`Premium request ID ${requestId} rejected!`);
            // Gọi lại hàm fetch để cập nhật toàn bộ danh sách từ backend
            fetchRequests();
        } catch (err) {
            const error = err as AxiosError<{ message?: string }>;
            const errorMsg = error.response?.data?.message || `Failed to reject request ID ${requestId}`;
            console.error("Error rejecting request:", error.response?.data || error.message || err);
            toast.error(errorMsg);
        }
    };

    // Hàm Delete đã dùng fetchRequests() nên giữ nguyên
    const handleDelete = async (requestId: number, userId: number) => {
        const confirm = window.confirm(`PERMANENTLY DELETE premium request ID ${requestId} for User ID ${userId}? This action cannot be undone.`);
        if (!confirm) return;

        try {
            await deletePremiumRequest(requestId);
            toast.success(`Premium request ID ${requestId} deleted successfully!`);
            fetchRequests();
        } catch (err) {
            const error = err as AxiosError<{ message?: string }>;
            const errorMsg = error.response?.data?.message || `Failed to delete request ID ${requestId}`;
             console.error("Error deleting request:", error.response?.data || error.message || err);
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
            {loading ? (
                 <div className="text-center py-10 text-gray-500 italic">Loading requests...</div>
            ) : (
                 <div className="bg-neutral-800 rounded-lg shadow-lg border border-neutral-700 overflow-auto">
                    <table className="w-full min-w-[1000px] text-left table-fixed border-collapse">
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
                            {requests.length > 0 ? requests.map((req) => (
                                 <tr key={req.id} className={`hover:bg-neutral-700/50 transition duration-150 ease-in-out`}>
                                     <td className="px-3 py-2 text-sm">{req.id}</td>
                                     <td className="px-3 py-2 text-sm">{req.requestedUser.id}</td>
                                     <td className="px-3 py-2 text-sm whitespace-normal break-words">{req.requestedUser.username || 'N/A'}</td>
                                     <td className="px-3 py-2 text-sm">{formatDate(req.requestTimestamp)}</td>
                                     <td className="px-3 py-2 text-sm">
                                         <span className={`font-semibold px-1.5 py-0.5 rounded text-xs ${req.status === 0 ? 'bg-yellow-600 text-white' : req.status === 1 ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                                             {getStatusLabel(req.status)}
                                         </span>
                                     </td>
                                     <td className="px-3 py-2 text-sm truncate" title={req.adminNotes || ''}>{req.adminNotes || '—'}</td>
                                     <td className="px-3 py-2 text-sm text-center">
                                         {req.processedByUser?.id ? `By: ${req.processedByUser.username} at ${formatDate(req.processedTimestamp)}` : '—'}
                                     </td>
                                     <td className="px-3 py-2 text-center">
                                        <PremiumRequestActionMenu
                                            request={req}
                                            onApprove={handleApprove}
                                            onReject={handleReject}
                                            onDelete={handleDelete}
                                        />
                                     </td>
                                 </tr>
                            )) : (
                                 <tr>
                                     <td colSpan={8} className="text-center py-10 text-gray-500 italic">
                                         No premium requests found.
                                     </td>
                                 </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default PremiumRequestManager;