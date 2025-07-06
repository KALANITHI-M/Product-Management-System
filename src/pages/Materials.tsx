
import React, { useState } from "react";
import { useData, Material } from "@/context/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Boxes, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Pencil, 
  Trash2 
} from "lucide-react";

const MaterialForm: React.FC<{
  onSubmit: (data: Omit<Material, "id">) => void;
  defaultValues?: Partial<Material>;
  onCancel: () => void;
}> = ({ onSubmit, defaultValues, onCancel }) => {
  const [name, setName] = useState(defaultValues?.name || "");
  const [quantity, setQuantity] = useState(defaultValues?.quantity || 0);
  const [unit, setUnit] = useState(defaultValues?.unit || "");
  const [supplier, setSupplier] = useState(defaultValues?.supplier || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      quantity,
      unit,
      supplier,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Material Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter material name"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            placeholder="0"
            min="0"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unit">Unit</Label>
          <Input
            id="unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="kg, meters, etc."
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="supplier">Supplier</Label>
        <Input
          id="supplier"
          value={supplier}
          onChange={(e) => setSupplier(e.target.value)}
          placeholder="Enter supplier name"
          required
        />
      </div>

      <DialogFooter>
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {defaultValues ? "Update Material" : "Add Material"}
        </Button>
      </DialogFooter>
    </form>
  );
};

const Materials: React.FC = () => {
  const { materials, addMaterial, editMaterial, deleteMaterial, isLoading } = useData();
  const [search, setSearch] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentMaterial, setCurrentMaterial] = useState<Material | null>(null);

  const filteredMaterials = materials.filter(material => 
    material.name.toLowerCase().includes(search.toLowerCase()) || 
    material.supplier.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (material: Material) => {
    setCurrentMaterial(material);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = (updates: Omit<Material, "id">) => {
    if (currentMaterial) {
      editMaterial(currentMaterial.id, updates);
      setIsEditDialogOpen(false);
      setCurrentMaterial(null);
    }
  };

  const handleAddMaterial = (material: Omit<Material, "id">) => {
    addMaterial(material);
    setIsAddDialogOpen(false);
  };

  const handleDeleteMaterial = (id: string) => {
    deleteMaterial(id);
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
            <Boxes className="mr-2" size={24} />
            Materials Management
          </h1>
          <p className="text-muted-foreground">Manage your raw materials inventory</p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-2">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search materials..."
              className="pl-8 w-full md:w-[250px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) setCurrentMaterial(null);
          }}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Material
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Add New Material</DialogTitle>
                <DialogDescription>
                  Enter the details of the new material
                </DialogDescription>
              </DialogHeader>
              <MaterialForm
                onSubmit={handleAddMaterial}
                onCancel={() => setIsAddDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Materials Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Material Name</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMaterials.length > 0 ? (
              filteredMaterials.map((material) => (
                <TableRow key={material.id}>
                  <TableCell className="font-medium">{material.name}</TableCell>
                  <TableCell>{material.quantity}</TableCell>
                  <TableCell>{material.unit}</TableCell>
                  <TableCell>{material.supplier}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(material)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteMaterial(material.id)}
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
                <TableCell colSpan={5} className="h-24 text-center">
                  No materials found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) setCurrentMaterial(null);
      }}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Material</DialogTitle>
            <DialogDescription>
              Update the details of the material
            </DialogDescription>
          </DialogHeader>
          {currentMaterial && (
            <MaterialForm
              onSubmit={handleUpdate}
              defaultValues={currentMaterial}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setCurrentMaterial(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Materials;
