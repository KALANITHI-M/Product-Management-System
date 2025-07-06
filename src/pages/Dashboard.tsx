
import React from "react";
import { useData, ProductStatus } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Package, 
  Boxes, 
  CheckCircle, 
  Clock, 
  Loader, 
  DollarSign,
  FileBarChart
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const StatusCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode; className?: string }> = ({ 
  title, value, icon, className 
}) => {
  return (
    <Card className={className}>
      <CardContent className="p-6 flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-3xl font-bold mt-1">{value}</h3>
        </div>
        <div className="h-12 w-12 rounded-full flex items-center justify-center bg-primary/10 text-primary">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
};

const Dashboard: React.FC = () => {
  const { products, materials, logs, isLoading } = useData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Calculate product stats
  const pendingProducts = products.filter(p => p.status === "pending").length;
  const inProgressProducts = products.filter(p => p.status === "in-progress").length;
  const completedProducts = products.filter(p => p.status === "completed").length;
  
  // Calculate total cost
  const totalCost = products.reduce((sum, product) => sum + product.estimatedCost, 0);
  
  // Data for charts
  const statusData = [
    { name: "Pending", value: pendingProducts, color: "#f59e0b" },
    { name: "In Progress", value: inProgressProducts, color: "#3b82f6" },
    { name: "Completed", value: completedProducts, color: "#10b981" },
  ];
  
  const materialData = materials.map(material => ({
    name: material.name,
    quantity: material.quantity
  })).slice(0, 5); // Show only top 5 materials
  
  // Recent logs
  const recentLogs = [...logs].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  ).slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Manufacturing Dashboard</h1>
        <p className="text-muted-foreground">Overview of your production status</p>
      </div>
      
      {/* Status cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard 
          title="Total Products" 
          value={products.length} 
          icon={<Package size={24} />} 
        />
        <StatusCard 
          title="Total Materials" 
          value={materials.length} 
          icon={<Boxes size={24} />} 
        />
        <StatusCard 
          title="Completed Products" 
          value={completedProducts} 
          icon={<CheckCircle size={24} />} 
        />
        <StatusCard 
          title="Estimated Total Cost" 
          value={`$${totalCost.toLocaleString()}`} 
          icon={<DollarSign size={24} />} 
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              <div className="flex items-center gap-2">
                <FileBarChart size={18} />
                Production Status
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusData.map((entry, index) => (
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
        
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              <div className="flex items-center gap-2">
                <Boxes size={18} />
                Material Inventory
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={materialData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="quantity" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">
            <div className="flex items-center gap-2">
              <Clock size={18} />
              Recent Activity
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-4 border-b border-border pb-4 last:border-0">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center 
                  ${log.action.includes("completed") ? "bg-green-100 text-green-600" : 
                    log.action.includes("started") ? "bg-blue-100 text-blue-600" : 
                    "bg-yellow-100 text-yellow-600"}`
                }>
                  {log.action.includes("completed") ? <CheckCircle size={16} /> : 
                   log.action.includes("started") ? <Loader size={16} /> : 
                   <Clock size={16} />}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{log.action}</p>
                  <p className="text-sm text-muted-foreground">
                    {log.productName}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
            
            {recentLogs.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                No recent activity found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
