import { Controller, useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createEmployee, getEmployee, updateEmployee } from "@/service/emp.service";
// import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  getActiveBranch
} from "@/service/branch.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Branch } from "./Branchform";
import { useAuth, UserRole } from "@/context/AuthContext";
import { useLoading } from "./LoadingContext";
import { useToast } from "@/context/ToastContext";
import { DataTable } from "./DataTable";
import { employeeTableColumns } from "@/lib/tables.data";
import { useNavigate } from "react-router-dom";
import { toggleEmployee } from "@/service/auth.service";
import { Switch } from "./ui/switch";
// import { useAuth } from "@/context/AuthContext";
// import { Toaster } from "@/components/ui/sonner";

export interface Employee {
  id?: string;
  branchCode?: string;
  employeeCode?: string;
  firstName: string;
  lastName: string;
  aadharNumber: string;
  panNumber: string;
  email: string;
  phoneNo: string;
  role: string;
  isActive?: boolean;
}



export default function EmployeeForm() {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<Employee>({ defaultValues: {} as Employee });

  // Separate form for editing to avoid clobbering create form state
  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    setValue: setEditValue,
    control: controlEdit,
    formState: { errors: editErrors },
  } = useForm<Employee>({ defaultValues: {} as Employee });

  const [Employee, setEmployee] = useState<Employee[]>([]);
  const [Employee2, setEmployee2] = useState<Employee[]>([]);
  const [branch, setBranch] = useState<Branch[]>([]);
  const { setLoading } = useLoading();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [search, setSearch] = useState("");
  const [editSearch, setEditSearch] = useState("");
  const toast = useToast();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const filteredBranch = branch.filter((temp) => {
    return temp.name.toLowerCase().includes(search.toLowerCase())
  })

  const filteredBranchEdit = branch.filter((temp) => {
    return temp.name.toLowerCase().includes(editSearch.toLowerCase())
  })

  useEffect(() => {
    setLoading(true);
    getEmployee()
      .then((resp) => {
        setEmployee2(resp?.data);
      })
      .catch((err: any) => {
        if (err?.status == 401 || err?.response?.status == 401) {
          toast.showToast('Error', 'Session Expired', 'error');
          logout();
        } else {
          toast.showToast('Error:', err?.message || 'Error during fetch of Employees', 'error');
        }
      }).finally(() => setLoading(false));

  }, [refreshFlag]);

  useEffect(() => {
    setLoading(true);
    getActiveBranch()
      .then((resp) => {
        setBranch(resp?.data);
      })
      .catch((err: any) => {
        if (err?.status == 401 || err?.response?.status == 401) {
          toast.showToast('Error', 'Session Expired', 'error');
          logout();
        } else {
          toast.showToast('Error:', err?.message || 'Error during fetch of Branch', 'error');
        }
      })
      .finally(() => setLoading(false));
  }, [refreshFlag])

  const onSubmit: SubmitHandler<Employee> = async (data: Employee) => {
    setLoading(true);
    try {
      const newEmployee = await createEmployee({ ...data, role: 'employee' });
      setEmployee([...Employee, newEmployee]);
      setDialogOpen(false);
      setRefreshFlag((prev) => !prev); // Trigger a refresh
      toast.showToast('Success', 'Created a New Employee', 'success');
      reset(); // Reset the form after successful submission
    } catch (err: any) {
      if (err?.status == 401 || err?.response?.status == 401) {
        toast.showToast('Error', 'Session Expired', 'error');
        logout();
      } else {
        toast.showToast('Error:', err?.message || 'Error occured while making a new Employee', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDiagClick = () => {
    setDialogOpen(false);
    reset(); // Reset the form when dialog is closed
  };

  const handleToggle = async (id: string) => {
    setLoading(true);
    try {
      await toggleEmployee(id);
      toast.showToast('Success', 'Employee status updated successfully', 'info');
      setRefreshFlag((prev) => !prev); // Trigger a refresh
    } catch (err: any) {
      if (err?.status === '401' || err?.response?.status === '401') {
        toast.showToast('Error', 'Session Expired', 'error');
        logout();
      } else {
        toast.showToast('Error', err?.message || 'Error occurred while toggling employee status', 'error');
      }
    } finally {
      setLoading(false);
    }
  }

  const openEditDialog = (emp: any) => {
    setSelectedEmployee(emp);
    console.log('emp', emp);
    const { firstName, lastName, email, phoneNo, branchCode, aadharNumber, panNumber } = emp;
    // Map possible field names from backend to form fields robustly
    // Set values into the edit form
    setEditValue("firstName" as any, firstName);
    setEditValue("lastName" as any, lastName);
    setEditValue("email" as any, email);
    setEditValue("phoneNo" as any, phoneNo);
    setEditValue("branchCode" as any, branchCode);
    setEditValue("aadharNumber" as any, aadharNumber);
    setEditValue("panNumber" as any, panNumber);
    setEditDialogOpen(true);
  };

  const handleEditCancel = () => {
    setEditDialogOpen(false);
    setSelectedEmployee(null);
    resetEdit();
    setEditSearch("");
  };

  const onEditSubmit: SubmitHandler<Employee> = async (data: Employee) => {
    if (!selectedEmployee?.id) {
      toast.showToast('Error', 'Employee not found', 'error');
      return;
    }
    setLoading(true);
    try {
      const {firstName,lastName,email,phoneNo,branchCode,aadharNumber,panNumber} = data;
      const updatedData = {firstname:firstName,lastname:lastName,email,phone:phoneNo,branchCode,aadharNumber,panNumber};
      await updateEmployee(updatedData, selectedEmployee.id);
      toast.showToast('Success', 'Employee updated successfully', 'success');
      setEditDialogOpen(false);
      resetEdit();
      setSelectedEmployee(null);
      setRefreshFlag((prev) => !prev);
    } catch (err: any) {
      if (err?.status == 401 || err?.response?.status == 401) {
        toast.showToast('Error', 'Session Expired', 'error');
        logout();
      } else { toast.showToast('Error:', err?.message || 'Error occurred while updating Employee', 'error'); }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div>
      <Button style={{ cursor: "pointer" }} onClick={() => setDialogOpen(true)} className="mb-4  bg-[#5156DB]">
        Add Employee
      </Button>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6">
            {["firstname", "lastname", "email", "phone", "branchCode", "aadharNumber", "panNumber"].map((field) => (
              <div key={field}>
                {field === "branchCode" ? (
                  <Controller
                    name="branchCode"
                    control={control}
                    rules={{ required: "Branch is required" }}
                    render={({ field: branchField, fieldState }) => (
                      <>
                        <Select
                          value={branchField.value}
                          onValueChange={(value) => { setValue("branchCode", value); setSearch('') }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a Branch" />
                          </SelectTrigger>
                          <SelectContent>
                            <div className="p-2">
                              <Input
                                placeholder="Search a Branch"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="mb-2"
                                onClick={(e) => e.stopPropagation()} // 👈 Prevent Select from closing
                                onKeyDown={(e) => e.stopPropagation()} // 👈 Prevent bubbling to Select
                              />
                            </div>
                            {filteredBranch.map((resp) => (
                              <SelectItem key={resp?.branchCode ?? ""} value={resp?.branchCode ?? ""}>
                                {resp.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {fieldState.error && (
                          <p className="text-red-600 text-sm">{fieldState.error.message}</p>
                        )}
                      </>
                    )}
                  />
                ) : field === "role" ? (
                  <Controller
                    name="role"
                    control={control}
                    rules={{ required: "Role is required" }}
                    render={({ field: roleField, fieldState }) => (
                      <>
                        <Select
                          value={roleField.value}
                          onValueChange={(value) => roleField.onChange(value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a Role" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(UserRole).map(
                              (role) =>
                                !["superadmin", "client"].includes(role) && (
                                  <SelectItem key={role} value={role}>
                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                  </SelectItem>
                                )
                            )}
                          </SelectContent>
                        </Select>
                        {fieldState.error && (
                          <p className="text-red-600 text-sm">{fieldState.error.message}</p>
                        )}
                      </>
                    )}
                  />
                ) :
                  field === "aadharNumber" ?
                    (<>
                      <Controller
                        name="aadharNumber"
                        control={control}
                        rules={{
                          required: "Aadhar No is required.",
                          pattern: {
                            value: /^\d{12}$/,
                            message: "Aadhaar No must be a 12-digit number",
                          },
                        }}
                        render={({ field, fieldState }) => (
                          <div className="flex flex-col gap-1">
                            <Input
                              id="aadharNumber"
                              placeholder="Aadhaar No"
                              maxLength={12}
                              {...field}
                              onChange={e => {
                                const val = e.target.value.replace(/\D/g, "");
                                field.onChange(val);
                              }}
                            />
                            {fieldState.error && (
                              <p className="text-red-600 text-xs mt-1">
                                {fieldState.error.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </>)
                    : field === "panNumber" ?
                      (<>
                        <Controller
                          name="panNumber"
                          control={control}
                          rules={{
                            required: "PAN No is required.",
                            pattern: {
                              value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                              message: "Enter Valid PAN",
                            },
                          }}
                          render={({ field, fieldState }) => (
                            <div className="flex flex-col gap-1">
                              <Input
                                id="panNumber"
                                placeholder="PAN No"
                                maxLength={10}
                                {...field}
                                onChange={e => {
                                  const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
                                  field.onChange(val);
                                }}
                              />
                              {fieldState.error && (
                                <p className="text-red-600 text-xs mt-1">
                                  {fieldState.error.message}
                                </p>
                              )}
                            </div>
                          )}
                        />
                      </>) :
                      (
                        <>
                          <Input
                            {...register(field as keyof Employee, { required: true })}
                            placeholder={field[0].toUpperCase() + field.slice(1)}
                          />
                          {errors[field as keyof Employee] && (
                            <p className="text-red-600 text-sm">{field} is required</p>
                          )}
                        </>
                      )}
              </div>
            ))}

            <div className="flex justify-end gap-2">
              <Button style={{ cursor: "pointer" }} type="button" variant="outline" onClick={handleDiagClick}>
                Cancel
              </Button>
              <Button style={{ cursor: "pointer" }} type="submit">
                Create Employee
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="flex w-full h-[99vh] overflow-hidden">
        <DataTable
          columns={[
            ...employeeTableColumns,
            {
              id: "viewDetails",
              header: "View Details",
              cell: ({ row }) => (
                <Button
                  style={{ cursor: "pointer" }}
                  variant="default"
                  size="sm"
                  color="white"
                  className="bg-[#5156DB]"
                  onClick={() =>
                    navigate("/superadmin/employee/employeeDetails", {
                      state: { employee: row.original },
                    })
                  }
                >
                  View Details
                </Button>
              ),
            },
            {
              id: "actions",
              header: "Actions",
              cell: ({ row }) => (
                <div className="flex items-center gap-2">
                  <Button
                    style={{ cursor: "pointer" }}
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(row.original)}
                    aria-label="Edit employee"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
                    </svg>
                    
                  </Button>
                  <Switch
                    checked={!!row.original.isActive}
                    onCheckedChange={() => handleToggle(row.original.id || "")}
                    aria-label="Toggle employee active status"
                  />
                </div>
              ),
            },
          ]}
          data={Employee2}
        />
      </div>
      {/* Edit Employee Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEditSubmit(onEditSubmit)} className="space-y-4 mb-6">
            {["firstName", "lastName", "email", "phoneNo", "branchCode", "aadharNumber", "panNumber"].map((field) => (
              <div key={field}>
                {field === "branchCode" ? (
                  <Controller
                    name="branchCode"
                    control={controlEdit}
                    rules={{ required: "Branch is required" }}
                    render={({ field: branchField, fieldState }) => (
                      <>
                        <Select
                          value={branchField.value}
                          onValueChange={(value) => { setEditValue("branchCode", value); setEditSearch(''); }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a Branch" />
                          </SelectTrigger>
                          <SelectContent>
                            <div className="p-2">
                              <Input
                                placeholder="Search a Branch"
                                value={editSearch}
                                onChange={(e) => setEditSearch(e.target.value)}
                                className="mb-2"
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => e.stopPropagation()}
                              />
                            </div>
                            {filteredBranchEdit.map((resp) => (
                              <SelectItem key={resp?.branchCode ?? ""} value={resp?.branchCode ?? ""}>
                                {resp.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {fieldState.error && (
                          <p className="text-red-600 text-sm">{fieldState.error.message}</p>
                        )}
                      </>
                    )}
                  />
                ) : field === "aadharNumber" ? (
                  <>
                    <Controller
                      name="aadharNumber"
                      control={controlEdit}
                      rules={{
                        required: "Aadhar No is required.",
                        pattern: {
                          value: /^\d{12}$/,
                          message: "Aadhaar No must be a 12-digit number",
                        },
                      }}
                      render={({ field, fieldState }) => (
                        <div className="flex flex-col gap-1">
                          <Input
                            id="edit_aadharNumber"
                            placeholder="Aadhaar No"
                            maxLength={12}
                            {...field}
                            onChange={e => {
                              const val = e.target.value.replace(/\D/g, "");
                              field.onChange(val);
                            }}
                          />
                          {fieldState.error && (
                            <p className="text-red-600 text-xs mt-1">
                              {fieldState.error.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </>
                ) : field === "panNumber" ? (
                  <>
                    <Controller
                      name="panNumber"
                      control={controlEdit}
                      rules={{
                        required: "PAN No is required.",
                        pattern: {
                          value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                          message: "Enter Valid PAN",
                        },
                      }}
                      render={({ field, fieldState }) => (
                        <div className="flex flex-col gap-1">
                          <Input
                            id="edit_panNumber"
                            placeholder="PAN No"
                            maxLength={10}
                            {...field}
                            onChange={e => {
                              const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
                              field.onChange(val);
                            }}
                          />
                          {fieldState.error && (
                            <p className="text-red-600 text-xs mt-1">
                              {fieldState.error.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </>
                ) : (
                  <>
                    <Input
                      {...registerEdit(field as keyof Employee, { required: true } as any)}
                      placeholder={field[0].toUpperCase() + field.slice(1)}
                    />
                    {editErrors[field as keyof Employee] && (
                      <p className="text-red-600 text-sm">{field} is required</p>
                    )}
                  </>
                )}
              </div>
            ))}

            <div className="flex justify-end gap-2">
              <Button style={{ cursor: "pointer" }} type="button" variant="outline" onClick={handleEditCancel}>
                Cancel
              </Button>
              <Button style={{ cursor: "pointer" }} type="submit">
                Update Employee
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
