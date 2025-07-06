
import React, { useState } from "react";
import { useData, Product, ProductStatus } from "@/context/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Package, Plus, Search, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import DownloadReport from "@/components/DownloadReport";

const ProductForm: React.FC<{
  onSubmit: (data: Omit<Product, "id" | "createdAt">) => void;
  defaultValues?: Partial<Product>;
  materials: { id: string; name: string }[];
  onCancel: () => void;
}> = ({ onSubmit, defaultValues, materials, onCancel }) => {
  const [name, setName] = useState(defaultValues?.name || "");
  const [type, setType] = useState(defaultValues?.type || "");
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(defaultValues?.materials || []);
  const [estimatedCost, setEstimatedCost] = useState(defaultValues?.estimatedCost || 0);
  const [status, setStatus] = useState<ProductStatus>(defaultValues?.status || "pending");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      type,
      materials: selectedMaterials,
      estimatedCost,
      status,
    });
  };
  
  const toggleMaterial = (materialId: string) => {
    if (selectedMaterials.includes(materialId)) {
      setSelectedMaterials(selectedMaterials.filter(id => id !== materialId));
    } else {
      setSelectedMaterials([...selectedMaterials, materialId]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter product name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Product Type</Label>
          <Input
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="Enter product type"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Materials</Label>
        <div className="border rounded-md p-4 max-h-40 overflow-y-auto">
          {materials.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {materials.map((material) => (
                <div key={material.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`material-${material.id}`}
                    checked={selectedMaterials.includes(material.id)}
                    onChange={() => toggleMaterial(material.id)}
                    className="mr-2"
                  />
                  <Label htmlFor={`material-${material.id}`}>
                    {material.name}
                  </Label>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No materials available</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="estimatedCost">Estimated Cost ($)</Label>
          <Input
            id="estimatedCost"
            type="number"
            value={estimatedCost}
            onChange={(e) => setEstimatedCost(Number(e.target.value))}
            placeholder="0.00"
            min="0"
            step="0.01"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={(value) => setStatus(value as ProductStatus)}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {defaultValues ? "Update Product" : "Add Product"}
        </Button>
      </DialogFooter>
    </form>
  );
};

const Products: React.FC = () => {
  const { products, materials, addProduct, editProduct, deleteProduct, isLoading } = useData();
  const [search, setSearch] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(search.toLowerCase()) || 
    product.type.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (product: Product) => {
    setCurrentProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = (updates: Omit<Product, "id" | "createdAt">) => {
    if (currentProduct) {
      editProduct(currentProduct.id, updates);
      setIsEditDialogOpen(false);
      setCurrentProduct(null);
    }
  };

  const handleAddProduct = (newProduct: Omit<Product, "id" | "createdAt">) => {
    addProduct(newProduct);
    setIsAddDialogOpen(false);
  };

  const handleDeleteProduct = (id: string) => {
    deleteProduct(id);
  };

  const getStatusBadge = (status: ProductStatus) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="status-badge status-pending">Pending</Badge>;
      case "in-progress":
        return <Badge variant="outline" className="status-badge status-progress">In Progress</Badge>;
      case "completed":
        return <Badge variant="outline" className="status-badge status-completed">Completed</Badge>;
      default:
        return null;
    }
  };

  const getMaterialNames = (materialIds: string[]) => {
    return materialIds
      .map(id => materials.find(m => m.id === id)?.name || "")
      .filter(Boolean)
      .join(", ");
  };

  // Ensure dialogs properly close when ESC key is pressed or clicking outside
  const handleOpenChange = (open: boolean, dialogSetter: React.Dispatch<React.SetStateAction<boolean>>) => {
    dialogSetter(open);
    // If dialog is closing, reset current product
    if (!open) {
      setCurrentProduct(null);
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
            <Package className="mr-2" size={24} />
            Products Management
          </h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-2">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-8 w-full md:w-[250px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <DownloadReport />
          
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => handleOpenChange(open, setIsAddDialogOpen)}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Enter the details of the new product
                </DialogDescription>
              </DialogHeader>
              <ProductForm
                onSubmit={handleAddProduct}
                materials={materials}
                onCancel={() => setIsAddDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Materials</TableHead>
              <TableHead>Est. Cost</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.type}</TableCell>
                  <TableCell>{getMaterialNames(product.materials)}</TableCell>
                  <TableCell>${product.estimatedCost ? product.estimatedCost.toFixed(2) : '0.00'}</TableCell>
                  <TableCell>{getStatusBadge(product.status)}</TableCell>
                  <TableCell>{new Date(product.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(product)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-500"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => handleOpenChange(open, setIsEditDialogOpen)}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the details of the product
            </DialogDescription>
          </DialogHeader>
          {currentProduct && (
            <ProductForm
              onSubmit={handleUpdate}
              defaultValues={currentProduct}
              materials={materials}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;
