
import React, { useState } from "react";
import { useData } from "@/context/DataContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileBarChart, Download, PieChart as PieChartIcon, BarChart as BarChartIcon } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const Reports: React.FC = () => {
  const { products, materials, logs, isLoading } = useData();
  const [activeTab, setActiveTab] = useState("products");

  // Function to generate and download CSV
  const generateCSV = (data: any[], title: string) => {
    // Transform data to CSV format
    let csvContent = "";

    if (data.length === 0) {
      return;
    }

    // Get headers
    const headers = Object.keys(data[0]);
    csvContent += headers.join(",") + "\n";

    // Add rows
    data.forEach((item) => {
      const row = headers
        .map((header) => {
          let cell = item[header];
          // Handle arrays, objects, or values with commas
          if (Array.isArray(cell)) {
            cell = `"${cell.join("; ")}"`;
          } else if (typeof cell === "object" && cell !== null) {
            cell = `"${JSON.stringify(cell)}"`;
          } else if (typeof cell === "string" && cell.includes(",")) {
            cell = `"${cell}"`;
          }
          return cell;
        })
        .join(",");
      csvContent += row + "\n";
    });

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${title.toLowerCase().replace(/\s+/g, "-")}-report.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Prepare data for product status chart
  const productStatusData = [
    { name: "Pending", value: products.filter((p) => p.status === "pending").length, color: "#f59e0b" },
    { name: "In Progress", value: products.filter((p) => p.status === "in-progress").length, color: "#3b82f6" },
    { name: "Completed", value: products.filter((p) => p.status === "completed").length, color: "#10b981" },
  ];

  // Prepare data for materials chart
  const materialsChartData = materials
    .map((material) => ({
      name: material.name,
      quantity: material.quantity,
    }))
    .sort((a, b) => b.quantity - a.quantity) // Sort by quantity in descending order
    .slice(0, 8); // Take only top 8 for better visualization

  // Prepare data for product cost report
  const productCostData = products
    .map((product) => ({
      name: product.name,
      cost: product.estimatedCost,
    }))
    .sort((a, b) => b.cost - a.cost) // Sort by cost in descending order
    .slice(0, 8); // Take only top 8

  // Format data for CSV export
  const formatProductsForCSV = () => {
    return products.map((product) => ({
      ID: product.id,
      Name: product.name,
      Type: product.type,
      "Estimated Cost": product.estimatedCost,
      Status: product.status,
      "Created At": new Date(product.createdAt).toLocaleString(),
    }));
  };

  const formatMaterialsForCSV = () => {
    return materials.map((material) => ({
      ID: material.id,
      Name: material.name,
      Quantity: material.quantity,
      Unit: material.unit,
      Supplier: material.supplier,
    }));
  };

  const formatLogsForCSV = () => {
    return logs.map((log) => ({
      ID: log.id,
      "Product ID": log.productId,
      "Product Name": log.productName,
      Action: log.action,
      Timestamp: new Date(log.timestamp).toLocaleString(),
    }));
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
      <div>
        <h1 className="text-2xl font-bold flex items-center">
          <FileBarChart className="mr-2" size={24} />
          Production Reports
        </h1>
        <p className="text-muted-foreground">Generate and download reports</p>
      </div>

      <Tabs defaultValue="products" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md mb-4">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="logs">Production Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="products">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-medium flex items-center">
                      <PieChartIcon size={18} className="mr-2" />
                      Product Status Distribution
                    </CardTitle>
                    <CardDescription>Overview of product manufacturing status</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={productStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {productStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-medium flex items-center">
                      <BarChartIcon size={18} className="mr-2" />
                      Product Cost Analysis
                    </CardTitle>
                    <CardDescription>Estimated cost by product</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={productCostData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value}`} />
                      <Bar dataKey="cost" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-medium">Export Products Report</CardTitle>
                    <CardDescription>Download product data as CSV</CardDescription>
                  </div>
                  <Button onClick={() => generateCSV(formatProductsForCSV(), "Products")}>
                    <Download className="mr-2 h-4 w-4" />
                    Download CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p>
                  The CSV report includes details on all products, their types, costs, statuses, and creation dates.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="materials">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-medium flex items-center">
                    <BarChartIcon size={18} className="mr-2" />
                    Material Inventory
                  </CardTitle>
                  <CardDescription>Current inventory levels</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={materialsChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="quantity" fill="#0f766e" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-medium">Export Materials Report</CardTitle>
                    <CardDescription>Download material inventory data as CSV</CardDescription>
                  </div>
                  <Button onClick={() => generateCSV(formatMaterialsForCSV(), "Materials")}>
                    <Download className="mr-2 h-4 w-4" />
                    Download CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p>
                  The CSV report includes details on all materials, their quantities, units, and suppliers.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="logs">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-medium">Production Activity Logs</CardTitle>
                  <CardDescription>Download production history data as CSV</CardDescription>
                </div>
                <Button onClick={() => generateCSV(formatLogsForCSV(), "Production Logs")}>
                  <Download className="mr-2 h-4 w-4" />
                  Download CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                The CSV report includes all production activities, product statuses, and timestamps.
              </p>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.length > 0 ? (
                      logs
                        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                        .slice(0, 10)
                        .map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="font-medium">{log.productName}</TableCell>
                            <TableCell>{log.action}</TableCell>
                            <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                          No logs found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Imported table components
const Table = ({ children }: { children: React.ReactNode }) => (
  <table className="w-full">{children}</table>
);

const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <thead className="bg-muted/50">{children}</thead>
);

const TableRow = ({ children }: { children: React.ReactNode }) => (
  <tr className="border-b">{children}</tr>
);

const TableHead = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <th className={`p-3 text-left text-sm font-medium ${className || ""}`}>
    {children}
  </th>
);

const TableBody = ({ children }: { children: React.ReactNode }) => (
  <tbody>{children}</tbody>
);

const TableCell = ({
  children,
  className,
  colSpan,
}: {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
}) => (
  <td
    className={`p-3 text-sm ${className || ""}`}
    colSpan={colSpan}
  >
    {children}
  </td>
);

export default Reports;
