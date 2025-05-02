import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { uploadToolDLL } from "../service/api";

function AddTool() {
  const [file, setFile] = useState<File[]>([]);

  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return toast.warning("Please select a DLL file");

    try {
      setLoading(true);
      await uploadToolDLL(file);
      toast.success("Tool uploaded successfully!");
    } catch {
      toast.error("Failed to upload tool");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-white p-6 max-w-xl mx-auto">

      <ToastContainer />


      <h2 className="text-2xl font-bold mb-6">➕ Upload New Tool</h2>

      <div className="bg-neutral-800 rounded p-6 shadow border border-neutral-700 space-y-4">
        <div>
          <label className="block text-sm mb-2">Select .dll file</label>
          <input
            type="file"
            accept=".dll"
            multiple
            onChange={(e) => setFile(Array.from(e.target.files || []))}
            className="block w-full text-sm text-gray-300 file:bg-emerald-600 file:text-white file:px-3 file:py-1 file:rounded file:mr-4"
          />

        </div>

        <button
          disabled={loading}
          onClick={handleUpload}
          className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-white text-sm transition disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
}

export default AddTool;
