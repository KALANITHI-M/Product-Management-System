
import React, { useState } from "react";
import { useData, ProductionLog } from "@/context/DataContext";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClipboardList, CheckCircle, Loader, Clock, Search } from "lucide-react";

const ProductionLogs: React.FC = () => {
  const { logs, isLoading } = useData();
  const [search, setSearch] = useState("");

  // Sort logs by timestamp in descending order (most recent first)
  const sortedLogs = [...logs].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const filteredLogs = sortedLogs.filter(log =>
    log.productName?.toLowerCase().includes(search.toLowerCase()) ||
    log.action?.toLowerCase().includes(search.toLowerCase())
);


  const getActionIcon = (action: string) => {
    if (action.includes("completed")) {
      return <CheckCircle size={16} className="text-green-500" />;
    } else if (action.includes("started")) {
      return <Loader size={16} className="text-blue-500" />;
    } else {
      return <Clock size={16} className="text-yellow-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <ClipboardList className="mr-2" size={24} />
            Production Logs
          </h1>
          <p className="text-muted-foreground">Track production history and activity</p>
        </div>

        <div className="relative w-full md:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            className="pl-8 w-full md:w-[300px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Status</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="flex items-center justify-center">
                      {getActionIcon(log.action)}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {log.productName}
                  </TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>
                    {new Date(log.timestamp).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No logs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ProductionLogs;
