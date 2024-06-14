// pages/index.tsx
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TooltipContent } from "@radix-ui/react-tooltip";

export default function Home() {
  const [sampleSize, setSampleSize] = useState(1);
  const [filename, setFilename] = useState("");
  const [result, setResult] = useState<string[]>([]);
  const [dateOfVote, setDateOfVote] = useState(DateTime.utc().toISODate());
  const [claimNumber, setClaimNumber] = useState(1);
  const [files, setFiles] = useState<string[]>([]);

  const seed = `${dateOfVote}-claim-${claimNumber}-${sampleSize}`;

  useEffect(() => {
    const fetchFiles = async () => {
      const response = await fetch("/api/listFiles");
      const data = await response.json();
      setFiles(data.files.map((file: string) => file.replace(".json", "")));
      setFilename(data.files[0].replace(".json", "")); // Set default filename
    };

    fetchFiles();
  }, []);

  useEffect(() => {
    const handleRandomize = async () => {
      const response = await fetch(
        `/api/randomise?seed=${seed}&count=${sampleSize}&filename=${filename}`
      );
      const data = await response.json();
      setResult(data.users);
    };

    if (sampleSize > 0 && filename) {
      handleRandomize();
    }
  }, [sampleSize, filename, dateOfVote, claimNumber, seed]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Parse the input date string as UTC
    const date = new Date(e.target.value);
    const utcDate = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    setDateOfVote(DateTime.fromJSDate(utcDate).toISODate() ?? "");
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="p-4">
        <h1 className="text-2xl mb-4">Select Voters</h1>
        <div className="mb-4">
          <label className="block mb-2">Date of Vote</label>
          <div className="flex items-center">
            <Input
              type="date"
              value={DateTime.fromISO(dateOfVote).toFormat("yyyy-MM-dd")}
              onChange={handleDateChange}
            />
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipContent>Please select the date in UTC.</TooltipContent>
              <TooltipTrigger>
                <p className="text-xs text-gray-500 mt-1">
                  Please select the date in UTC.
                </p>
              </TooltipTrigger>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="mb-4">
          <label className="block mb-2">Claim Number</label>
          <Input
            type="number"
            value={claimNumber}
            onChange={(e) => setClaimNumber(Number(e.target.value))}
            min="1"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Sample Size</label>
          <Input
            type="number"
            value={sampleSize}
            onChange={(e) => setSampleSize(Number(e.target.value))}
            min="1"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Seed (Auto-Generated)</label>
          <Input
            type="text"
            placeholder="Seed"
            disabled={true}
            value={seed}
            readOnly
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Select JSON File</label>
          <select
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            className="block w-full p-2 border rounded"
          >
            {files.map((file) => (
              <option key={file} value={file}>
                {file}
              </option>
            ))}
          </select>
        </div>
        {result.length > 0 && (
          <div className="mt-4">
            <h2 className="text-xl">Selected Users:</h2>
            <ul>
              {result.map((user, index) => (
                <li key={index}>{user}</li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
}
