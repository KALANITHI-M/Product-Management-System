import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

// Types
export type ProductStatus = "pending" | "in-progress" | "completed";

export type Product = {
  id: string;
  name: string;
  type: string;
  materials: string[];
  estimatedCost: number;
  status: ProductStatus;
  createdAt: string;
};

export type Material = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  supplier: string;
};

export type ProductionLog = {
  id: string;
  productId: string;
  productName: string;
  action: string;
  timestamp: string;
};

type DBSettings = {
  host: string;
  user: string;
  password: string;
  database: string;
};

type DataContextType = {
  products: Product[];
  materials: Material[];
  logs: ProductionLog[];
  addProduct: (product: Omit<Product, "id" | "createdAt">) => void;
  editProduct: (id: string, product: Partial<Omit<Product, "id" | "createdAt">>) => void;
  deleteProduct: (id: string) => void;
  addMaterial: (material: Omit<Material, "id">) => void;
  editMaterial: (id: string, material: Partial<Omit<Material, "id">>) => void;
  deleteMaterial: (id: string) => void;
  isLoading: boolean;
  downloadReport: (type: "products" | "materials" | "logs") => void;
  dbSettings: DBSettings;
  setDBSettings: (settings: DBSettings) => void;
  testDBConnection: (settings: DBSettings) => Promise<{ status: string; message: string }>;
};

// Initial mock data
const mockProducts: Product[] = [
  {
    id: "p1",
    name: "Steel Chair",
    type: "Furniture",
    materials: ["m1", "m3"],
    estimatedCost: 250.00,
    status: "completed",
    createdAt: "2024-03-15T10:30:00Z",
  },
  {
    id: "p2",
    name: "Wooden Table",
    type: "Furniture",
    materials: ["m2"],
    estimatedCost: 450.00,
    status: "in-progress",
    createdAt: "2024-04-01T09:15:00Z",
  },
  {
    id: "p3",
    name: "Glass Vase",
    type: "Home Décor",
    materials: ["m4"],
    estimatedCost: 120.00,
    status: "pending",
    createdAt: "2024-05-05T14:45:00Z",
  },
];

const mockMaterials: Material[] = [
  { id: "m1", name: "Steel", quantity: 500, unit: "kg", supplier: "Metal Works Inc." },
  { id: "m2", name: "Oak Wood", quantity: 200, unit: "board feet", supplier: "Forest Products LLC" },
  { id: "m3", name: "Fabric", quantity: 1000, unit: "meters", supplier: "Textile Hub" },
  { id: "m4", name: "Glass", quantity: 300, unit: "kg", supplier: "Clear Vision Glass" },
];

const mockLogs: ProductionLog[] = [
  {
    id: "l1",
    productId: "p1",
    productName: "Steel Chair",
    action: "Production completed",
    timestamp: "2024-04-10T16:30:00Z",
  },
  {
    id: "l2",
    productId: "p2",
    productName: "Wooden Table",
    action: "Production started",
    timestamp: "2024-04-02T08:45:00Z",
  },
  {
    id: "l3",
    productId: "p3",
    productName: "Glass Vase",
    action: "Added to queue",
    timestamp: "2024-05-05T14:45:00Z",
  },
];

const API_URL = "http://localhost:5000/api";

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [materials, setMaterials] = useState<Material[]>(mockMaterials);
  const [logs, setLogs] = useState<ProductionLog[]>(mockLogs);
  const [isLoading, setIsLoading] = useState(true);
  const [dbSettings, setDBSettings] = useState<DBSettings>({
    host: "localhost",
    user: "root",
    password: "",
    database: "production_manager"
  });
  const { toast } = useToast();

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch database settings first
        const settingsResponse = await fetch(`${API_URL}/db-settings`);
        if (settingsResponse.ok) {
          const settings = await settingsResponse.json();
          setDBSettings(prev => ({
            ...prev,
            host: settings.host,
            user: settings.user,
            database: settings.database,
            // We don't receive password for security reasons
          }));
        }

        // Fetch products
        const productsResponse = await fetch(`${API_URL}/products`);
        if (productsResponse.ok) {
          const data = await productsResponse.json();
          setProducts(data);
        }

        // Fetch materials
        const materialsResponse = await fetch(`${API_URL}/materials`);
        if (materialsResponse.ok) {
          const data = await materialsResponse.json();
          setMaterials(data);
        }

        // Fetch logs
        const logsResponse = await fetch(`${API_URL}/logs`);
        if (logsResponse.ok) {
          const data = await logsResponse.json();
          setLogs(data);
        }
      } catch (error) {
        console.error("Error fetching data from backend:", error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to the backend server. Using mock data instead.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Generate a simple ID for new items
  const generateId = (prefix: string) => {
    return `${prefix}${Date.now().toString(36)}`;
  };

  const addProduct = async (product: Omit<Product, "id" | "createdAt">) => {
    const newProduct: Product = {
      ...product,
      id: generateId('p'),
      createdAt: new Date().toISOString()
    };
    
    try {
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      
      if (response.ok) {
        setProducts(prevProducts => [newProduct, ...prevProducts]);
        
        // Refresh logs after adding product
        const logsResponse = await fetch(`${API_URL}/logs`);
        if (logsResponse.ok) {
          const data = await logsResponse.json();
          setLogs(data);
        }
        
        toast({
          title: "Product added",
          description: `${newProduct.name} has been added successfully.`,
          variant: "success",
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to add product");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add product",
        variant: "destructive",
      });
    }
  };

  const editProduct = async (id: string, updates: Partial<Omit<Product, "id" | "createdAt">>) => {
    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        setProducts(prevProducts => 
          prevProducts.map(product => 
            product.id === id ? { ...product, ...updates } : product
          )
        );
        
        // Refresh logs after editing product
        const logsResponse = await fetch(`${API_URL}/logs`);
        if (logsResponse.ok) {
          const data = await logsResponse.json();
          setLogs(data);
        }
        
        toast({
          title: "Product updated",
          description: "The product has been updated successfully.",
          variant: "success",
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update product",
        variant: "destructive",
      });
    }
  };

  const deleteProduct = async (id: string) => {
    const productToDelete = products.find(p => p.id === id);
    
    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setProducts(prevProducts => 
          prevProducts.filter(product => product.id !== id)
        );
        
        // Refresh logs after deleting product
        const logsResponse = await fetch(`${API_URL}/logs`);
        if (logsResponse.ok) {
          const data = await logsResponse.json();
          setLogs(data);
        }
        
        if (productToDelete) {
          toast({
            title: "Product deleted",
            description: `${productToDelete.name} has been removed.`,
            variant: "destructive",
          });
        }
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const addMaterial = async (material: Omit<Material, "id">) => {
    const newMaterial: Material = {
      ...material,
      id: generateId('m'),
    };
    
    try {
      const response = await fetch(`${API_URL}/materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMaterial)
      });
      
      if (response.ok) {
        setMaterials(prevMaterials => [...prevMaterials, newMaterial]);
        
        toast({
          title: "Material added",
          description: `${newMaterial.name} has been added to inventory.`,
          variant: "success",
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to add material");
      }
    } catch (error) {
      console.error("Error adding material:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add material",
        variant: "destructive",
      });
    }
  };

  const editMaterial = async (id: string, updates: Partial<Omit<Material, "id">>) => {
    try {
      const response = await fetch(`${API_URL}/materials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        setMaterials(prevMaterials => 
          prevMaterials.map(material => 
            material.id === id ? { ...material, ...updates } : material
          )
        );
        
        toast({
          title: "Material updated",
          description: "The material has been updated successfully.",
          variant: "success",
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to update material");
      }
    } catch (error) {
      console.error("Error updating material:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update material",
        variant: "destructive",
      });
    }
  };

  const deleteMaterial = async (id: string) => {
    const materialToDelete = materials.find(m => m.id === id);
    
    try {
      const response = await fetch(`${API_URL}/materials/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setMaterials(prevMaterials => 
          prevMaterials.filter(material => material.id !== id)
        );
        
        if (materialToDelete) {
          toast({
            title: "Material deleted",
            description: `${materialToDelete.name} has been removed from inventory.`,
            variant: "destructive",
          });
        }
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete material");
      }
    } catch (error) {
      console.error("Error deleting material:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete material",
        variant: "destructive",
      });
    }
  };

  const downloadReport = async (type: "products" | "materials" | "logs") => {
    try {
      const response = await fetch(`${API_URL}/reports/${type}`);
      
      if (response.ok) {
        const data = await response.json();
        let filename = "";
        
        // Convert to CSV
        const headers = data.length > 0 ? Object.keys(data[0]) : [];
        const csvContent = [
          headers.join(","),
          ...data.map((row: any) => headers.map(header => `"${row[header] || ''}"`).join(","))
        ].join("\n");
        
        switch (type) {
          case "products":
            filename = "products-report.csv";
            break;
          case "materials":
            filename = "materials-report.csv";
            break;
          case "logs":
            filename = "production-logs-report.csv";
            break;
        }
        
        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Report Downloaded",
          description: `${filename} has been downloaded successfully.`,
          variant: "download",
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || `Failed to download ${type} report`);
      }
    } catch (error) {
      console.error(`Error downloading ${type} report:`, error);
      toast({
        title: "Download Error",
        description: error instanceof Error ? error.message : `Failed to download ${type} report`,
        variant: "destructive",
      });
    }
  };
  
  const testDBConnection = async (settings: DBSettings) => {
    try {
      const response = await fetch(`${API_URL}/db-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      return {
        status: "error",
        message: "Could not connect to the backend server"
      };
    }
  };

  return (
    <DataContext.Provider
      value={{
        products,
        materials,
        logs,
        addProduct,
        editProduct,
        deleteProduct,
        addMaterial,
        editMaterial,
        deleteMaterial,
        isLoading,
        downloadReport,
        dbSettings,
        setDBSettings,
        testDBConnection,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
