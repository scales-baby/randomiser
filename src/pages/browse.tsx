// pages/browse.tsx
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";

const BrowsePage = () => {
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFileContent, setSelectedFileContent] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchFiles = async () => {
      const response = await fetch("/api/listFiles");
      const data = await response.json();
      setFiles(data.files);
    };

    fetchFiles();
  }, []);

  const handleFileClick = async (filename: string) => {
    const response = await fetch(`/${filename}`);
    const data = await response.json();
    setSelectedFileContent(JSON.stringify(data, null, 2));
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="p-4">
        <h1 className="text-2xl mb-4">Browse JSON Files</h1>
        <ul className="mb-4">
          {files.map((file) => (
            <li key={file} className="mb-2">
              <button
                onClick={() => handleFileClick(file)}
                className="text-blue-500 hover:underline"
              >
                {file}
              </button>
            </li>
          ))}
        </ul>
        {selectedFileContent && (
          <pre className="bg-gray-100 p-4 rounded">{selectedFileContent}</pre>
        )}
      </Card>
    </div>
  );
};

export default BrowsePage;
