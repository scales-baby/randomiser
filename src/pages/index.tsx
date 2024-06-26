// pages/index.tsx
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DateTime } from "luxon";
import { useEffect, useMemo, useState } from "react";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TooltipContent } from "@radix-ui/react-tooltip";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Clipboard } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useDebounce } from "use-debounce";

export default function Home() {
  const router = useRouter();
  const { toast } = useToast();
  const [sampleSize, setSampleSize] = useState(500);
  const [filename, setFilename] = useState("");
  const [result, setResult] = useState<string[]>([]);
  const [dateOfVote, setDateOfVote] = useState(DateTime.utc().toISODate());
  const [claimNumber, setClaimNumber] = useState(1);
  const [files, setFiles] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [shareLink, setShareLink] = useState("");

  const seed = `${dateOfVote}-claim-${claimNumber}-${sampleSize}`;

  // Debounced search query
  const [debouncedSearchQuery] = useDebounce(searchQuery.toLowerCase(), 300);

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

  useEffect(() => {
    // Generate the share link when the component mounts or parameters change
    if (typeof window !== "undefined") {
      const params = new URLSearchParams({
        dateOfVote,
        claimNumber: claimNumber.toString(),
        sampleSize: sampleSize.toString(),
        filename,
      }).toString();
      setShareLink(`${window.location.origin}?${params}`);
    }
  }, [dateOfVote, claimNumber, sampleSize, filename, router]);

  useEffect(() => {
    // Parse query parameters to set initial state values
    if (router.isReady) {
      const { dateOfVote, claimNumber, sampleSize, filename } = router.query;
      if (dateOfVote) setDateOfVote(dateOfVote as string);
      if (claimNumber) setClaimNumber(Number(claimNumber));
      if (sampleSize) setSampleSize(Number(sampleSize));
      if (filename) setFilename(filename as string);
    }
  }, [router.isReady, router.query]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    const utcDate = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    setDateOfVote(DateTime.fromJSDate(utcDate).toISODate() ?? "");
  };

  const filteredResults = useMemo(() => {
    return result.filter((user) =>
      user.toLowerCase().includes(debouncedSearchQuery)
    );
  }, [result, debouncedSearchQuery]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink).then(() => {
      toast({
        title: "Success!",
        description: "The link has been copied to your clipboard.",
      });
    });
  };

  const handleCopyList = () => {
    const list = JSON.stringify(filteredResults, null, 2);
    navigator.clipboard.writeText(list).then(() => {
      toast({
        title: "Success!",
        description: "The list of voters has been copied to your clipboard.",
      });
    });
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="p-4">
        <h1 className="text-2xl mb-4">Supercharged DAO Voters</h1>
        <div className="mb-4 text-sm">
          Each batch of voters is randomly selected from the pool of all Dragon
          Council members from a{" "}
          <Link className="text-blue-500" href="/browse">
            recent snapshot
          </Link>
          {". "}
          <br />
          <br />
          <a
            href="https://forum.scales.baby/t/supercharging-daos-distributed-and-decentralised-decision-making-based-on-statistical-methods/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500"
          >
            Read more
          </a>{" "}
          about how the Supercharged DAO works.
        </div>
        <div className="mb-4">
          <label className="block mb-2">Start Date of Vote</label>
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
          <label className="block mb-2">Select Snapshot</label>
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
            <h2 className="text-xl">Selected Voters:</h2>
            <Input
              type="text"
              placeholder="Search for your username"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-4 border border-blue-500"
            />
            <div className="max-h-64 overflow-y-auto border p-2 rounded relative">
              <ul>
                {filteredResults.map((user: any, index: any) => (
                  <li key={index}>{user}</li>
                ))}
              </ul>
              <div className="absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-gray-50 pointer-events-none"></div>
            </div>
            <Button onClick={handleCopyList} className="mt-2">
              Copy Voter List
            </Button>
          </div>
        )}
        {shareLink && (
          <div className="mt-4">
            <h2 className="text-xl">Share Page</h2>
            <p className="text-sm mt-2">Click the link to copy:</p>
            <div
              onClick={handleCopyLink}
              className="bg-gray-100 p-2 rounded text-sm break-all cursor-pointer flex items-center justify-between"
            >
              <span>{shareLink}</span>
              <Clipboard className="h-5 w-5 text-gray-500" />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
