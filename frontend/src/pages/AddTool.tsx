import { useState } from "react";
import { toast } from "react-toastify";
import { uploadToolDLL } from "../service/api";



function AddTool() {
 
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {

    if (files.length === 0) {
        return toast.warning("Please select at least one DLL file");
    }

   
    try {
      setLoading(true);
     
      await uploadToolDLL(files);
      toast.success(`Successfully uploaded ${files.length} tool(s)!`);
      setFiles([]);
    } catch (err: any) { 
       
        const errorMsg = err?.response?.data?.message || "Failed to upload tool(s)";
        toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-white p-6 max-w-xl mx-auto">
      {/* Xóa ToastContainer */}
      <h2 className="text-2xl font-bold mb-6">➕ Upload New Tool(s)</h2>

      <div className="bg-neutral-800 rounded p-6 shadow border border-neutral-700 space-y-4">
        <div>
          <label className="block text-sm mb-2 font-medium text-gray-300">Select .dll file(s)</label>
          <input
            type="file"
            accept=".dll"
            multiple 
            
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
            className="block w-full text-sm text-gray-300 rounded-md border border-neutral-600 bg-neutral-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 file:bg-emerald-600 file:border-0 file:text-white file:px-4 file:py-2 file:mr-4 file:hover:bg-emerald-700 file:cursor-pointer"
          />
         
           {files.length > 0 && (
             <div className="mt-3 text-xs text-neutral-400">
                 Selected: {files.map(f => f.name).join(', ')}
             </div>
           )}
        </div>

        <button
          disabled={loading || files.length === 0} 
          onClick={handleUpload}
          className="bg-green-600 hover:bg-green-500 px-5 py-2.5 rounded-md text-white text-sm font-medium transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Uploading..." : `Upload ${files.length} File(s)`}
        </button>
      </div>
    </div>
  );
}

export default AddTool;