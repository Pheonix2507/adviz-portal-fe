import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { useLoading } from "@/components/LoadingContext";
import {
  createBranch,
  getBranch,
  toggleBranch,
} from "@/service/branch.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface Branch {
  branchCode?: string;
  id: string;
  name: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  pincode: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

export default function AdminBranchForm() {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Branch>({ defaultValues: {} as Branch });

  const [branches, setBranches] = useState<Branch[]>([]);
  const { setLoading } = useLoading();
  const [formLoading, setFormLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);

  useEffect(() => {
    setLoading(true);
    getBranch()
      .then((resp) => {
        setBranches(resp?.data);
      })
      .catch((err: any) => {
        console.error("Error fetching branches:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [refreshFlag]);

  const onSubmit: SubmitHandler<Branch> = async (data: Branch) => {
    setFormLoading(true);
    try {
      const newBranch = await createBranch(data);
      setBranches([...branches, newBranch]);
      setDialogOpen(false);
      setRefreshFlag((prev) => !prev);
      reset();
    } catch (err: any) {
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDiagClick = () => {
    setDialogOpen(false);
    reset();
  };

  const handleToggle = async (branch: string) => {
    setLoading(true);
    try {
      await toggleBranch(branch);
    } catch (err: any) {
      console.error(err);
    } finally {
      setRefreshFlag((prev) => !prev);
      setLoading(false);
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(branches.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedBranches = branches.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <div>
      <Button onClick={() => setDialogOpen(true)} className="mb-4">
        Add Branch
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Branch</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6">
            {["name", "address1", "address2", "city", "pincode"].map(
              (field) => (
                <div key={field}>
                  <Input
                    {...register(field as keyof Branch, { required: true })}
                    placeholder={field[0].toUpperCase() + field.slice(1)}
                  />
                  {errors[field as keyof Branch] && (
                    <p className="text-red-600 text-sm">{field} is required</p>
                  )}
                </div>
              )
            )}

            <div>
              <Select
                value={watch("state")}
                onValueChange={(value) => setValue("state", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a state" />
                </SelectTrigger>
                <SelectContent>
                  {indianStates.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.state && (
                <p className="text-red-600 text-sm">State is required</p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleDiagClick}>
                Cancel
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? "Creating..." : "Create Branch"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Table>
        <TableHeader>
          <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Address</TableHead>
        <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedBranches.length === 0 ? (
        <TableRow>
          <TableCell colSpan={3} className="text-center py-4">
            No branches found.
          </TableCell>
        </TableRow>
          ) : (
        paginatedBranches.map((branch, idx) => (
          <TableRow
            key={branch.branchCode}
            className={idx % 2 === 1 ? "bg-gray-100 dark:bg-gray-800" : ""}
          >
            <TableCell>{branch.name}</TableCell>
            <TableCell>
          {branch.address1}, {branch.address2}, {branch.city},{" "}
          {branch.state}, {branch.pincode}
            </TableCell>
            <TableCell>
          <Switch
            checked={!!branch.isActive}
            onCheckedChange={() =>
              handleToggle(branch?.branchCode ?? "")
            }
          />
            </TableCell>
          </TableRow>
        ))
          )}
        </TableBody>
      </Table>

      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="disabled:opacity-50"
            >
              <PaginationPrevious />
            </button>
          </PaginationItem>
          <PaginationItem className="px-4 text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </PaginationItem>
          <PaginationItem>
            <button
              type="button"
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="disabled:opacity-50"
            >
              <PaginationNext />
            </button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
