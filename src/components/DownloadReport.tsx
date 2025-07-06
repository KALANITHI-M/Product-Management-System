
import React from 'react';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DownloadReport: React.FC = () => {
  const { downloadReport } = useData();

  const handleDownload = (type: "products" | "materials" | "logs") => {
    downloadReport(type);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Download Report
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleDownload("products")}>
          Products Report
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload("materials")}>
          Materials Report
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload("logs")}>
          Production Logs Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DownloadReport;
