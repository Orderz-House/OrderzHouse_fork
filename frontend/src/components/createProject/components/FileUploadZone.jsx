import { Upload, File, X } from "lucide-react";
import { formatFileSize } from "../utils/calculations";

export const FileUploadZone = ({
  selectedFiles,
  onFileSelect,
  onRemoveFile,
  accept = ".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.zip,.rar",
  label = "Upload project files",
  description = "Images, documents, or any reference materials",
}) => {
  return (
    <div>
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-[#00A896] transition-colors bg-gray-50">
        <input
          type="file"
          multiple
          onChange={onFileSelect}
          className="hidden"
          id="file-upload"
          accept={accept}
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-lg text-gray-600 mb-2">{label}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </label>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-6 space-y-3">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-white border border-gray-200 p-4 rounded-xl"
            >
              <div className="flex items-center">
                <File className="w-5 h-5 text-gray-500 mr-3" />
                <div>
                  <span className="text-gray-700 font-medium">{file.name}</span>
                  <span className="text-sm text-gray-500 ml-3">
                    ({formatFileSize(file.size)})
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemoveFile(index)}
                className="text-red-500 hover:text-red-700 p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};