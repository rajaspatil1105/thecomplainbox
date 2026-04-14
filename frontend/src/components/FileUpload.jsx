import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, FileImage, Film, X } from 'lucide-react';

/**
 * FileUpload Component
 * Drag-and-drop file upload with client-side validation
 */
const FileUpload = ({
  onFilesSelect,
  maxFiles = 3,
  maxSizeMB = 10,
  acceptedTypes = ['image/jpeg', 'image/png', 'video/mp4', 'application/pdf'],
  className = '',
  showPreview = true,
}) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  const [files, setFiles] = React.useState([]);
  const [errors, setErrors] = React.useState([]);

  const validateFile = (file) => {
    const errors = [];

    // Check MIME type
    if (!acceptedTypes.includes(file.type)) {
      errors.push(`${file.name}: Invalid file type. Accepted: JPG, PNG, MP4, PDF`);
    }

    // Check size
    if (file.size > maxSizeBytes) {
      errors.push(`${file.name}: Exceeds ${maxSizeMB}MB limit`);
    }

    return errors;
  };

  const onDrop = useCallback((acceptedFiles) => {
    setErrors([]);
    const newErrors = [];
    const validFiles = [];

    // Check total count
    if (files.length + acceptedFiles.length > maxFiles) {
      newErrors.push(`Maximum ${maxFiles} files allowed`);
      setErrors(newErrors);
      return;
    }

    // Validate each file
    acceptedFiles.forEach((file) => {
      const fileErrors = validateFile(file);
      if (fileErrors.length > 0) {
        newErrors.push(...fileErrors);
      } else {
        validFiles.push(file);
      }
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    const updatedFiles = [...files, ...validFiles];
    setFiles(updatedFiles);
    onFilesSelect(updatedFiles);
  }, [files, maxFiles, onFilesSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: maxFiles > 1,
    noClick: false,
  });

  const removeFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFilesSelect(updatedFiles);
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return <FileImage size={32} className="text-[#1040C0]" />;
    if (file.type === 'video/mp4') return <Film size={32} className="text-[#1040C0]" />;
    return <File size={32} className="text-[#1040C0]" />;
  };

  const getFilePreview = (file) => {
    if (file.type.startsWith('image/')) {
      return (
        <img
          src={URL.createObjectURL(file)}
          alt={file.name}
          className="w-full h-full object-cover"
        />
      );
    }
    return null;
  };

  return (
    <div className={className}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-4 border-dashed rounded-none p-8
          flex flex-col items-center justify-center cursor-pointer
          transition-colors duration-200 min-h-40
          ${isDragActive
            ? 'bg-[#1040C0]/10 border-[#1040C0]'
            : 'bg-[#F0F0F0] border-[#121212] hover:bg-[#E0E0E0]'
          }
        `}
      >
        <input {...getInputProps()} />
        <Upload size={40} className="text-[#121212] mb-3" />
        <p className="font-['Outfit'] font-bold uppercase text-center mb-1">
          DRAG & DROP FILES
        </p>
        <p className="font-['Outfit'] text-sm text-[#666666] text-center">
          or click to browse
        </p>
      </div>

      {/* Accepted types note */}
      <div className="mt-3 font-['Outfit'] text-xs text-[#666666]">
        <p>Accepted: JPG, PNG, MP4, PDF — Max {maxSizeMB}MB per file — Max {maxFiles} files</p>
      </div>

      {/* Slot counter */}
      <div className="mt-2 font-['Outfit'] text-xs font-bold text-[#121212]">
        {files.length} of {maxFiles} slots used
      </div>

      {/* Error messages */}
      {errors.length > 0 && (
        <div className="mt-4 bg-[#D02020] text-white border-2 border-[#121212] p-3 rounded-none">
          {errors.map((error, idx) => (
            <p key={idx} className="font-['Outfit'] text-sm font-bold">
              {error}
            </p>
          ))}
        </div>
      )}

      {/* File previews */}
      {showPreview && files.length > 0 && (
        <div className="mt-6">
          <p className="font-['Outfit'] font-bold uppercase text-sm mb-4 text-[#121212]">
            Uploaded Files ({files.length})
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {files.map((file, index) => (
              <div
                key={index}
                className="relative border-2 border-[#121212] rounded-none overflow-hidden bg-white"
              >
                {/* Preview or Icon */}
                {file.type.startsWith('image/') ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-24 object-cover"
                  />
                ) : (
                  <div className="w-full h-24 bg-[#F0F0F0] flex items-center justify-center">
                    {getFileIcon(file)}
                  </div>
                )}

                {/* File name overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1">
                  <p className="font-['Outfit'] text-xs text-white truncate">
                    {file.name}
                  </p>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-2 right-2 bg-[#D02020] text-white p-1 hover:bg-[#D02020]/90 rounded-none border-2 border-[#121212]"
                  type="button"
                  aria-label={`Remove ${file.name}`}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
