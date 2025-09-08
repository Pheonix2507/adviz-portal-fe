// src/pages/EditCaseForm.tsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DateInput } from "@/components/ui/date-input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useToast } from "@/context/ToastContext";
import { updateCaseID } from "@/service/case.service";
import type { Case, ExpenseDetail, ExpireDetail, FinalDetails, GeneralDetails, ownerDetails, VehicleDetail } from "./CaseForm";
import { InsuranceType } from "./CaseForm";
import { NumberPlate, TransactionTo, type TransactionDetail } from "@/components/CaseForm";
import { useAuth } from "@/context/AuthContext";
import { indianStates, type Branch } from "./Branchform";
import { useLoading } from "./LoadingContext";
import type { Firm } from "./FirmForm";
import { getActiveBranch } from "@/service/branch.service";
import { getbranchEmployee } from "@/service/emp.service";
import { getActiveFirm } from "@/service/firm.service";
import { getFirmsD } from "@/service/client.service";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";
import { getActiveRto } from "@/service/rto.service";

export default function EditCaseForm() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const toast = useToast();




  type BranchEmployee = {
    id: string;
    firstName: string;
    lastName: string;
    employeeCode: string;
  };


  const { user, logout } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [b, setB] = useState<string>("");
  const { setLoading } = useLoading();
  const [branchEmp, setbranchEmp] = useState<BranchEmployee[]>([]);
  const [firms, setfirms] = useState<Firm[]>([]);
  const [firmsD, setfirmsD] = useState<string[]>([]);
  const [rtos, setRtos] = useState<string[]>([]);
  const [searchfirm, setSearchfirm] = useState("");
  // const [search, setSearch] = useState("");
  // const [done,setDone] = useState("");

  const [refreshFlag] = useState(false);

  const [searchSellerState, setSearchSellerState] = useState("");
  const [searchBuyerState, setSearchBuyerState] = useState("");



  const ind2 = indianStates.filter((hostel) =>
    hostel.toLowerCase().includes((searchSellerState).toLowerCase())
  );
  const ind3 = indianStates.filter((hostel) =>
    hostel.toLowerCase().includes((searchBuyerState).toLowerCase())
  );



  useEffect(() => {
    setLoading(true);
    // console.log(defaultValues);
    // console.log(fromRtoval, toRtoval);
    getActiveBranch()
      .then((resp) => {
        setBranches(resp?.data);
      })
      .catch((err: any) => {
        if (err?.status == 401 || err?.response?.status == 401) {
          toast.showToast('Error', 'Session Expired', 'error');
          logout();
        }
        else {
          toast.showToast('Error:', err?.message || 'Error during fetch of Branches', 'error');
        }          // console.error("Error fetching branches:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [refreshFlag]);

  useEffect(() => {
    if (!b) return; // guard clause

    setLoading(true);
    getbranchEmployee(b)
      .then((resp) => {
        setbranchEmp(resp?.data);
        // console.log("Branch Employees:", resp?.data);
      })
      .catch((err: any) => {
        if (err?.status == 401 || err?.response?.status == 401) {
          toast.showToast('Error', 'Session Expired', 'error');
          logout();
        }
        else {
          toast.showToast('Error:', err?.message || 'Error during fetch of employee.', 'error');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [b]);

  useEffect(() => {
    setLoading(true);

    getActiveFirm()
      .then((resp) => {
        setfirms(resp?.data);
      })
      .catch((err: any) => {
        if (err?.status == 401 || err?.response?.status == 401) {
          toast.showToast('Error', 'Session Expired', 'error');
          logout();
        } else {
          toast.showToast('Error:', err?.message || 'Error during fetch of Firms', 'error');
        }
      })
      .finally(() => setLoading(false));
  }, [refreshFlag]);



  function parseCamelCase(str: string) {
    return str
      // Insert space before uppercase letters that follow lowercase letters
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      // Convert entire string to uppercase
      .toUpperCase();
  }

  const defaultValues = state?.caseData as FinalDetails;
  const id = state?.id as string;
  const { control, handleSubmit, setValue, watch, reset, getValues } = useForm<FinalDetails>({
    defaultValues,
  });

  useEffect(() => {
    setLoading(true);
    console.log("defaultValues:", defaultValues);
    getFirmsD()
      .then((resp) => {
        const f = resp?.data.map((f: string) => f.toUpperCase());
        setfirmsD(f);
      })
      .catch((err: any) => {
        if (err?.status == 401 || err?.response?.status == 401) {
          toast.showToast('Error', 'Session Expired', 'error');
          logout();
        } else {
          toast.showToast('Error:', err?.message || 'Error during fetch of Firms', 'error');
        }
      })
      .finally(() => setLoading(false));

    getActiveRto()
      .then((resp) => {
        const displayNames = resp?.data.map((item: any) => item.displayName.toUpperCase());
        displayNames.unshift("NA");
        setRtos(displayNames);

        // 🎯 SET RTO VALUES IMMEDIATELY AFTER DATA LOADS
        if (defaultValues?.vehicleDetail && displayNames.length > 0) {
          const { fromRTO: defaultFromRTO, toRTO: defaultToRTO } = defaultValues.vehicleDetail;

          if (defaultFromRTO) {
            const matchingFromRTO = displayNames.find((rto: string) =>
              rto.toUpperCase().trim() === defaultFromRTO.toUpperCase().trim() ||
              rto.replace(/\s+/g, '') === defaultFromRTO.replace(/\s+/g, '')
            );
            setValue("vehicleDetail.fromRTO", matchingFromRTO || defaultFromRTO);
          }

          if (defaultToRTO) {
            const matchingToRTO = displayNames.find((rto: string) =>
              rto.toUpperCase().trim() === defaultToRTO.toUpperCase().trim() ||
              rto.replace(/\s+/g, '') === defaultToRTO.replace(/\s+/g, '')
            );
            setValue("vehicleDetail.toRTO", matchingToRTO || defaultToRTO);
          }
        }
      })
      .catch((err: any) => {
        if (err?.status == 401 || err?.response?.status == 401) {
          toast.showToast('Error', 'Session Expired', 'error');
          logout();
        } else {
          toast.showToast('Error:', err?.message || 'Error during fetch of RTOs', 'error');
        }
      })
      .finally(() => setLoading(false));

  }, [refreshFlag, defaultValues, setValue]);
  // useEffect(() => {
  //   setLoading(true);

  //   getActiveRto()
  //     .then((resp) => {
  //       const displayNames = resp?.data.map((item: any) => item.displayName.toUpperCase());
  //       setRtos(displayNames);
  //     })
  //     .catch((err: any) => {
  //       if (err?.status == 401 || err?.response?.status == 401) {
  //         toast.showToast('Error', 'Session Expired', 'error');
  //         logout();
  //       } else {
  //         toast.showToast('Error:', err?.message || 'Error during fetch of Firms', 'error');
  //       }
  //     })
  //     .finally(() => setLoading(false));
  // }, [refreshFlag]);



  const [searchHPT, setSearchHPT] = useState("");
  const [searchHPA, setSearchHPA] = useState("");
  const [searchRTOto, setSearchRTOto] = useState("");
  const [searchRTOfrom, setSearchRTOfrom] = useState("");
  const mainFirms = firmsD.filter(f => f.toLowerCase().includes(searchfirm.toLowerCase()));

  const filteredCode1 = rtos.filter(f => f.toLowerCase().includes((searchRTOfrom).toLowerCase()));
  const filteredCode2 = rtos.filter(f => f.toLowerCase().includes((searchRTOto).toLowerCase()));

  const filteredfirms = firms.filter(f => f.name.toLowerCase().includes((searchHPA || searchHPT).toLowerCase()));



  // const filteredCode1WithSelected = useMemo(() => {
  //   const currentValue = getValues("vehicleDetail.fromRTO");
  //   const normalizedMatch = RTOOptions.find(
  //     (opt) => opt.value.replace(/\s/g, "") === currentValue?.replace(/\s/g, "")
  //   );

  //   const filtered = RTOOptions.filter((opt) =>
  //     opt.label.toLowerCase().includes(searchRTOfrom.toLowerCase())
  //   );

  //   return normalizedMatch && !filtered.some(opt => opt.value === normalizedMatch.value)
  //     ? [normalizedMatch, ...filtered]
  //     : filtered;
  // }, [searchRTOfrom, getValues]);


  // useEffect(() => {
  //   const raw = getValues("vehicleDetail.fromRTO");
  //   const match = RTOOptions.find(
  //     opt => opt.value.replace(/\s/g, "") === raw?.replace(/\s/g, "")
  //   );
  //   if (match) {
  //     setValue("vehicleDetail.fromRTO", match.value);
  //     console.log("Normalized fromRTO:", match.value);
  //   }
  // }, [getValues, setValue]);

  // const filteredCode1 = useMemo(() => {
  //   return RTOOptions.filter((opt) =>
  //     opt.label.toLowerCase().includes(searchRTOfrom.toLowerCase())
  //   );
  // }, [searchRTOfrom]);






  useEffect(() => {
    if (user?.role === "employee" && user?.branchCode && user?.employeeCode) {
      setValue("generalDetail.branchCodeId", user.branchCode);
      setValue("generalDetail.employeeCodeId", user.id);
      setB(user.branchCode);
    }
  }, [user, setValue]);

  useEffect(() => {
    if (!defaultValues) {
      toast.showToast("Error", "No case data provided", "error");
      navigate(-1);
    }
  }, [defaultValues, navigate, toast]);

  const formatDate = (dateStr: string | undefined): string | undefined =>
    dateStr?.split("T")[0] ?? undefined;

  const [fromEx, setFromEx] = useState<string | null>(null);
  const [toEx, setToEx] = useState<string | null>(null);

  useEffect(() => {
    // Check if the values exist in rtos array
    const fromRTO = watch("vehicleDetail.fromRTO");
    const toRTO = watch("vehicleDetail.toRTO");
    const fromExists = rtos.includes(fromRTO);
    setFromEx(fromExists ? fromRTO : null);
    if (!fromExists && fromRTO) {
      setValue("vehicleDetail.fromRTO", "");
    }

    const toExists = rtos.includes(toRTO);
    setToEx(toExists ? toRTO : null);
    if (!toExists && toRTO) {
      setValue("vehicleDetail.toRTO", "");
    }

  }, [defaultValues, rtos]);

  const getFormattedCaseData = (data: FinalDetails): FinalDetails => ({
    ...data,
    generalDetail: {
      ...data.generalDetail,
      appointmentDate: formatDate(data.generalDetail.appointmentDate) ?? ""
    },
    expireDetail: {
      ...data.expireDetail,
      insuranceExpiry: formatDate(data.expireDetail.insuranceExpiry) ?? "",
      pucExpiry: formatDate(data.expireDetail.pucExpiry) ?? "",
      fitnessExpiry: formatDate(data.expireDetail.fitnessExpiry) ?? "",
      taxExpiry: formatDate(data.expireDetail.taxExpiry) ?? "",
      permitExpiry: formatDate(data.expireDetail.permitExpiry) ?? "",
    }
  });

  // const fromRtoval = watch("vehicleDetail.fromRTO");
  // const toRtoval = watch("vehicleDetail.toRTO");
  // useEffect(() => {
  //   if (fromRtoval) {
  //     setValue("vehicleDetail.fromRTO", fromRtoval.toUpperCase());
  //   }
  // }, [fromRtoval, setValue]);
  // useEffect(() => {
  //   if (toRtoval) {
  //     setValue("vehicleDetail.toRTO", toRtoval.toUpperCase());
  //   }
  // }, [toRtoval, setValue]);

  const onCancel = () => {
    if (defaultValues) {
      reset(getFormattedCaseData(defaultValues));
    }
    // console.log(toRtoval, fromRtoval);
    setLoading(true);
    toast.showToast("Info", "Changes have been discarded", "info");
    navigate(-1);
  };

  useEffect(() => {
    const val = getValues("generalDetail.incentiveAmount");

    if (typeof val === "string" && val.includes(".")) {
      const sanitized = val.replace(/\D/g, "");
      setValue("generalDetail.incentiveAmount", sanitized);
    }
  }, [getValues, setValue]);


  useEffect(() => {
    if (defaultValues) {
      reset(getFormattedCaseData(defaultValues));
    }
  }, [defaultValues, reset]);

  const stripIds = <T extends object>(obj: T): Partial<T> => {
    const { id, ...rest } = obj as any;
    return rest;
  };

  const onSubmit = async (data: FinalDetails) => {
    // console.log("Submitting case data:", data);
    try {
      setLoading(true);
      const casePayload: Case = {
        generalDetails: stripIds(data.generalDetail) as GeneralDetails,
        vehicleDetail: stripIds(data.vehicleDetail) as VehicleDetail,
        expireDetail: {
          ...stripIds(data.expireDetail),
          insuranceExpiry: formatDate(data.expireDetail.insuranceExpiry),
          pucExpiry: formatDate(data.expireDetail.pucExpiry),
          fitnessExpiry: formatDate(data.expireDetail.fitnessExpiry),
          taxExpiry: formatDate(data.expireDetail.taxExpiry),
          permitExpiry: formatDate(data.expireDetail.permitExpiry),
        } as ExpireDetail,
        transactionDetail: stripIds(
          data.transactionDetail
        ) as TransactionDetail,
        expenseDetail: stripIds(data.expenseDetail) as ExpenseDetail,
        ownerDetails: stripIds(data.ownerDetails ?? {}) as ownerDetails,
        referenceDetail: stripIds(data.referenceDetail ?? {}) as {
          name: string;
          contactNo: string;
        },
      };


      await updateCaseID(id, casePayload);
      toast.showToast('Success', 'Case Successfully Updated', 'success');
      reset(casePayload);
      navigate(-1);
    } catch (err: any) {
      // console.error(err);
      if (err?.status == 401 || err?.response?.status == 401) {
        toast.showToast('Error', 'Session Expired', 'error');
        logout();
      }
      else if (err?.response?.status === 400) {
        toast.showToast('Bad Request', 'Provide full owner details or none', 'error');
      } else {
        const errorMessage = err?.response?.data?.message || err?.message || 'Unknown error occurred.';
        toast.showToast('Error in Updating', errorMessage, 'error');
      }
    } finally {
      setLoading(false);
    }
  };



  // const fromRTOOption = useMemo(() => {
  //   return rtos.find(
  //     (opt) =>
  //       opt.replace(/\s/g, "") === fromRtoval?.replace(/\s/g, "")
  //   );
  // }, [fromRtoval]);

  // const toRTOOption = useMemo(() => {
  //   return rtos.find(
  //     (opt) =>
  //       opt.replace(/\s/g, "") === toRtoval?.replace(/\s/g, "")
  //   );
  // }, [toRtoval]);


  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-start gap-4">
        <Button variant="outline" className="cursor-pointer" onClick={() => navigate(-1)}>← Back</Button>
        <Button className="cursor-pointer" variant="destructive" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      <>
        {!fromEx && <span className="text-red-600">* FromRTO field has been turned down edit it before submitting the CaseDetails.</span>}
        <br />
        {!toEx && <span className="text-red-600">* ToRTO field has been turned down edit it before submitting the CaseDetails.</span>}
      </>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8 p-6">
        {/* General Details */}
        <Card>
          <CardContent className="grid gap-4">
            <div className="text-xl font-semibold">General Details</div>
            <hr />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Controller
                name="generalDetail.firmName"
                control={control}
                rules={{ required: "Firm Name is required" }}
                render={({ field, fieldState }) => (
                  <div className="flex flex-col w-full">
                    <Label htmlFor="firmName" className="pb-2">
                      Firm Name <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      required
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Firm" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-2">
                          <Input
                            placeholder="Search a Firm"
                            value={searchfirm}
                            onChange={(e) => setSearchfirm(e.target.value)}
                            className="mb-2"
                            onClick={(e) => e.stopPropagation()} // 👈 Prevent Select from closing
                            onKeyDown={(e) => e.stopPropagation()} // 👈 Prevent bubbling to Select
                          />
                        </div>
                        {mainFirms
                          .map((firm) => (
                            <SelectItem key={firm} value={firm}>
                              {firm}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {fieldState.error && (
                      <p className="text-red-500 text-xs mt-1">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
              {/* Branch Code (only for employee) */}
              {user?.role !== "superadmin" && (
                <Controller
                  name="generalDetail.branchCodeId"
                  control={control}
                  rules={{ required: "Branch is required" }}
                  render={({ field, fieldState }) => {
                    const branchName =
                      branches.find((branch) => branch.branchCode === user?.branchCode)?.name ?? "";

                    return (
                      <div className="flex flex-col w-full">
                        <Label htmlFor="branchCodeId" className="pb-2">
                          Branch Name
                        </Label>
                        <Input
                          readOnly
                          value={branchName}
                          className="bg-gray-100 cursor-not-allowed"
                        />

                        {/* Ensure branchCode is set correctly */}
                        {field.value !== user?.branchCode && (() => { field.onChange(user?.branchCode); return null; })()}

                        {fieldState.error && (
                          <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>
                        )}
                      </div>
                    );
                  }}
                />
              )}

              {/* Employee Code (only for employee) */}
              {user?.role !== "superadmin" && (
                <Controller
                  name="generalDetail.employeeCodeId"
                  control={control}
                  rules={{ required: "Employee is required" }}
                  render={({ field, fieldState }) => {
                    // Find employee by employeeCode from logged-in user
                    const emp = branchEmp.find(
                      (e) => e.employeeCode === user?.employeeCode
                    );

                    // Sync UUID into RHF value if not already set
                    if (emp?.id && field.value !== emp.id) {
                      field.onChange(emp.id);
                    }

                    return (
                      <div className="flex flex-col w-full">
                        <Label htmlFor="employeeCodeId" className="pb-2">
                          Employee Name
                        </Label>
                        <Input
                          readOnly
                          value={
                            emp
                              ? `${emp.firstName} ${emp.lastName} (${emp.employeeCode})`
                              : ""
                          }
                          className="bg-gray-100 cursor-not-allowed"
                        />
                        {fieldState.error && (
                          <p className="text-red-500 text-xs mt-1">
                            {fieldState.error.message}
                          </p>
                        )}
                      </div>
                    );
                  }}
                />
              )}





              {/* Incentive Type - Only show for superadmin */}
              {user?.role === "superadmin" && (
                <Controller
                  name="generalDetail.incentiveAmount"
                  control={control}
                  rules={{
                    required: "Incentive Amount is required.",
                    pattern: {
                      value: /^\d+$/,
                      message: "Only digits are allowed",
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <div className="flex flex-col w-full">
                      <Label htmlFor="incentiveAmount" className="pb-2">
                        Incentive Amount <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="incentiveAmount"
                        placeholder="Amount"
                        className={`w-full ${fieldState.error ? "border-red-500" : ""}`}
                        {...field}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          field.onChange(value);
                        }}
                        value={field.value ?? ""}
                      />
                      {fieldState.error && (
                        <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>
                      )}
                    </div>
                  )}
                />
              )}
              <Controller
                name="generalDetail.appointmentDate"
                control={control}
                render={({ field, fieldState }) => (
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="appointmentDate" className="pb-1">
                      Appointment Date
                    </Label>
                    <DateInput
                      id="appointmentDate"
                      error={!!fieldState.error}
                      {...field}
                    />
                  </div>
                )}
              />
              <Controller
                name="generalDetail.applicationNo"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col w-full">
                    <Label htmlFor="applicationNo" className="pb-2">
                      Application No
                    </Label>
                    <Input
                      placeholder="No."
                      className="w-full"
                      {...field}
                    />
                  </div>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="grid gap-4 p-6">
            <div className="text-xl font-semibold">Vehicle Detail</div>
            <hr></hr>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Controller
                name="vehicleDetail.vehicleNo"
                control={control}
                rules={{ required: 'Vehicle No. is required' }}
                render={({ field, fieldState }) => (
                  <div className="flex flex-col w-full">
                    <Label htmlFor="vehicleNo" className="pb-2">
                      Vehicle No<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="vehicleNo"
                      placeholder="Vehicle No"
                      className={`input input-bordered ${fieldState.error ? "input-error" : ""
                        }`}
                      {...field}
                      value={field.value?.toUpperCase() ?? ""}
                      onChange={e => field.onChange(e.target.value.toUpperCase())}
                    />
                  </div>
                )}
              />
              <Controller
                name="vehicleDetail.rmaVehicleNo"
                control={control}
                render={({ field, fieldState }) => (
                  <div className="flex flex-col w-full">
                    <Label htmlFor="rmaVehicleNo" className="pb-2">
                      RMA Vehicle No
                    </Label>
                    <Input
                      id="rmaVehicleNo"
                      placeholder="RMA Vehicle No"
                      className={`input input-bordered ${fieldState.error ? "input-error" : ""
                        }`}
                      {...field}
                      value={field.value?.toUpperCase() ?? ""}
                      onChange={e => field.onChange(e.target.value.toUpperCase())}
                    />
                  </div>
                )}
              />
              <Controller
                name="vehicleDetail.fromRTO"
                control={control}
                rules={{ required: "From RTO is required" }}
                render={({ field, fieldState }) => (
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="fromRTO" className="pb-2">
                      From RTO<span className="text-red-500">*</span>
                    </Label>
                    <Select
                      required
                      value={field.value || ""} // Ensure empty string fallback
                      onValueChange={(value) => {
                        // console.log("FromRTO selected:", value);
                        field.onChange(value);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select From RTO..." />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-2">
                          <Input
                            placeholder="Search RTO"
                            value={searchRTOfrom}
                            onChange={(e) => setSearchRTOfrom(e.target.value)}
                            className="mb-2"
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                          />
                        </div>
                        {filteredCode1.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.error && (
                      <p className="text-red-600 text-xs mt-1">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
              <Controller
                name="vehicleDetail.toRTO"
                control={control}
                rules={{ required: "To RTO is required" }}
                render={({ field, fieldState }) => (
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="toRTO" className="pb-2">
                      To RTO<span className="text-red-500">*</span>
                    </Label>
                    <Select
                      required
                      value={field.value || ""} // Ensure empty string fallback
                      onValueChange={(value) => {
                        // console.log("ToRTO selected:", value);
                        field.onChange(value);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select To RTO..." />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-2">
                          <Input
                            placeholder="Search RTO"
                            value={searchRTOto}
                            onChange={(e) => setSearchRTOto(e.target.value)}
                            className="mb-2"
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                          />
                        </div>
                        {filteredCode2.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.error && (
                      <p className="text-red-600 text-xs mt-1">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />

              <Controller
                name="vehicleDetail.chassisNo"
                control={control}
                rules={{ required: "Chassis No is required" }}
                render={({ field, fieldState }) => (
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="chassisNo" className="pb-2">
                      Chassis No<span className="text-red-500">*</span>
                    </Label>
                    <Input id="chassisNo" placeholder="Chassis No"                     {...field}
                      value={field.value?.toUpperCase() ?? ""}
                      onChange={e => field.onChange(e.target.value.toUpperCase())} />
                    {fieldState.error && (
                      <p className="text-red-600 text-xs mt-1">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
              <Controller
                name="vehicleDetail.engineNo"
                control={control}
                rules={{ required: "Engine No is required" }}
                render={({ field, fieldState }) => (
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="engineNo" className="pb-2">
                      Engine No<span className="text-red-500">*</span>
                    </Label>
                    <Input id="engineNo" placeholder="Engine No"                     {...field}
                      value={field.value?.toUpperCase() ?? ""}
                      onChange={e => field.onChange(e.target.value.toUpperCase())} />
                    {fieldState.error && (
                      <p className="text-red-600 text-xs mt-1">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="grid gap-4 p-6">
            <div className="text-xl font-semibold">Expire Detail</div>
            <hr />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Controller
                name="expireDetail.insuranceExpiry"
                control={control}
                rules={{ required: "Parameter is required." }}
                render={({ field, fieldState }) => (
                  <div className="flex flex-col gap-1">
                    <Label
                      htmlFor="insuranceExpiry"
                      className="text-sm font-medium capitalize"
                    >
                      Insurance Expiry<span className="text-red-500">*</span>
                    </Label>
                    <DateInput
                      id="insuranceExpiry"
                      error={!!fieldState.error}
                      {...field}
                    />
                    {fieldState.error && (
                      <p className="text-red-500 text-xs mt-1">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
              <Controller
                name="expireDetail.pucExpiry"
                control={control}
                rules={{ required: "Parameter is required." }}
                render={({ field, fieldState }) => (
                  <div className="flex flex-col gap-1">
                    <Label
                      htmlFor="pucExpiry"
                      className="text-sm font-medium capitalize"
                    >
                      PUC Expiry<span className="text-red-500">*</span>
                    </Label>
                    <DateInput
                      id="pucExpiry"
                      error={!!fieldState.error}
                      {...field}
                    />
                    {fieldState.error && (
                      <p className="text-red-500 text-xs mt-1">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
              <Controller
                name="expireDetail.fitnessExpiry"
                control={control}
                rules={{ required: "Parameter is required." }}
                render={({ field, fieldState }) => (
                  <div className="flex flex-col gap-1">
                    <Label
                      htmlFor="fitnessExpiry"
                      className="text-sm font-medium capitalize"
                    >
                      Fitness Expiry<span className="text-red-500">*</span>
                    </Label>
                    <DateInput
                      id="fitnessExpiry"
                      error={!!fieldState.error}
                      {...field}
                    />
                    {fieldState.error && (
                      <p className="text-red-500 text-xs mt-1">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
              <Controller
                name="expireDetail.taxExpiry"
                control={control}
                rules={{ required: "Parameter is required." }}
                render={({ field, fieldState }) => (
                  <div className="flex flex-col gap-1">
                    <Label
                      htmlFor="taxExpiry"
                      className="text-sm font-medium capitalize"
                    >
                      Tax Expiry<span className="text-red-500">*</span>
                    </Label>
                    <DateInput
                      id="taxExpiry"
                      error={!!fieldState.error}
                      {...field}
                    />
                    {fieldState.error && (
                      <p className="text-red-500 text-xs mt-1">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
              <Controller
                name="expireDetail.permitExpiry"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col gap-1">
                    <Label
                      htmlFor="permitExpiry"
                      className="text-sm font-medium capitalize"
                    >
                      Permit Expiry
                    </Label>
                    <DateInput
                      id="permitExpiry"
                      {...field}
                    />
                  </div>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="grid gap-4 p-6 space-y-2">
            <div className="text-xl font-semibold">Transaction Detail</div>
            <hr></hr>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* To */}
              <Controller
                name="transactionDetail.to"
                control={control}
                rules={{ required: "To is required" }}
                render={({ field, fieldState }) => (
                  <div className="flex flex-col gap-1">
                    <Label className="py-2">To<span className="text-red-500">*</span></Label>
                    <Select
                      {...field}
                      value={field.value}
                      onValueChange={(val) => field.onChange(val as TransactionTo)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(TransactionTo).map((val) => (
                          <SelectItem key={val} value={val}>
                            {val}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.error && (
                      <p className="text-red-500 text-xs mt-1">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
              {/* HPT ID */}
              <Controller
                name="transactionDetail.hptId"
                control={control}
                rules={{ required: "HPT ID is required" }}
                render={({ field, fieldState }) => (
                  <div className="flex flex-col gap-1">
                    <Label className="py-2">HPT ID<span className="text-red-500">*</span></Label>
                    <Select
                      {...field}
                      value={field.value}
                      onValueChange={(value) => { field.onChange(value); setSearchHPT('') }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-2">
                          <Input
                            placeholder="Search a Firm"
                            value={searchHPT}
                            onChange={(e) => setSearchHPT(e.target.value)}
                            className="mb-2"
                            onClick={(e) => e.stopPropagation()} // 👈 Prevent Select from closing
                            onKeyDown={(e) => e.stopPropagation()} // 👈 Prevent bubbling to Select
                          />
                        </div>
                        {filteredfirms.map((firm) => (
                          <SelectItem key={firm.id} value={firm.id}>
                            {firm.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {fieldState.error && (
                      <p className="text-red-500 text-xs mt-1">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
              {/* HPA ID */}
              <Controller
                name="transactionDetail.hpaId"
                control={control}
                rules={{ required: "HPA ID is required" }}
                render={({ field, fieldState }) => (
                  <div className="flex flex-col gap-1">
                    <Label className="py-2">HPA ID<span className="text-red-500">*</span></Label>
                    <Select
                      required
                      {...field}
                      value={field.value}
                      onValueChange={(value) => { field.onChange(value); setSearchHPA('') }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-2">
                          <Input
                            placeholder="Search a Firm"
                            value={searchHPA}
                            onChange={(e) => setSearchHPA(e.target.value)}
                            className="mb-2"
                            onClick={(e) => e.stopPropagation()} // 👈 Prevent Select from closing
                            onKeyDown={(e) => e.stopPropagation()} // 👈 Prevent bubbling to Select
                          />
                        </div>
                        {filteredfirms.map((firm) => (
                          <SelectItem key={firm.id} value={firm.id}>
                            {firm.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.error && (
                      <p className="text-red-500 text-xs mt-1">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
              {/* Number Plate */}
              <Controller
                name="transactionDetail.numberPlate"
                control={control}
                rules={{ required: "Number Plate is required" }}
                render={({ field, fieldState }) => (
                  <div className="flex flex-col gap-1">
                    <Label className="py-2">Number Plate<span className="text-red-500">*</span></Label>
                    <Select
                      {...field}
                      value={field.value}
                      onValueChange={(val) => field.onChange(val as NumberPlate)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(NumberPlate).map((val) => (
                          <SelectItem key={val} value={val}>
                            {val}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.error && (
                      <p className="text-red-500 text-xs mt-1">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
              <Controller
                name="transactionDetail.insuranceType"
                control={control}
                rules={{ required: "Insurance Type is required" }}
                render={({ field, fieldState }) => (
                  <div className="flex flex-col gap-1">
                    <Label className="py-2">Insurance Type<span className="text-red-500">*</span></Label>
                    <Select
                      {...field}
                      value={field.value}
                      onValueChange={(val) => field.onChange(val as InsuranceType)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(InsuranceType).map((val) => (
                          <SelectItem key={val} value={val}>
                            {val}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.error && (
                      <p className="text-red-500 text-xs mt-1">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {(
                ["fitness", "rrf", "rma", "alteration"] as Array<
                  keyof Pick<
                    TransactionDetail,
                    "fitness" | "rrf" | "rma" | "alteration"
                  >
                >
              ).map((key) => (
                <div key={key} className="flex items-center space-x-2">
                  <Switch
                    checked={watch(`transactionDetail.${key}`)}
                    onCheckedChange={(val) =>
                      setValue(`transactionDetail.${key}` as any, val)
                    }
                  />
                  <Label>{key.toUpperCase()}</Label>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {(
                ["conversion", "addressChange", "drc"] as Array<
                  keyof Pick<
                    TransactionDetail,
                    "conversion" | "addressChange" | "drc"
                  >
                >
              ).map((key) => (
                <div key={key} className="flex items-center space-x-2">
                  <Switch
                    checked={watch(`transactionDetail.${key}`)}
                    onCheckedChange={(val) =>
                      setValue(`transactionDetail.${key}` as any, val)
                    }
                  />
                  <Label>{parseCamelCase(key)}</Label>
                </div>
              ))}

              <Controller
                name="transactionDetail.remarks"
                control={control}
                render={({ field }) => (
                  <div className="col-span-1 md:col-span-4 flex flex-col">
                    <Textarea
                      className=""
                      placeholder="Remarks"
                      {...field}
                      value={field.value?.toUpperCase() ?? ""}
                      onChange={e => field.onChange(e.target.value.toUpperCase())}
                    />
                  </div>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="grid gap-4 p-6">
            <div className="text-xl font-semibold">Owner Details</div>
            <hr />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="font-semibold mb-1">Registered Owner Details</div>
                <hr />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                  <Controller
                    name="ownerDetails.sellerName"
                    control={control}
                    render={({ field }) => (
                      <div className="flex flex-col gap-1">
                        <Label htmlFor="sellerName">Registered Owner Name</Label>
                        <Input id="sellerName" placeholder="Registered Owner Name"                     {...field}
                          value={field.value?.toUpperCase() ?? ""}
                          onChange={e => field.onChange(e.target.value.toUpperCase())} />
                      </div>
                    )}
                  />
                  <Controller
                    name="ownerDetails.sellerAadharNo"
                    control={control}
                    rules={{
                      pattern: {
                        value: /^\d{12}$/,
                        message: "Aadhaar No must be a 12-digit number",
                      },
                    }}
                    render={({ field, fieldState }) => (
                      <div className="flex flex-col gap-1">
                        <Label htmlFor="sellerAadharNo">Registered Owner Aadhaar No</Label>
                        <Input
                          id="sellerAadharNo"
                          placeholder="Registered Owner Aadhaar No"
                          maxLength={12}
                          {...field}
                          onChange={e => {
                            const val = e.target.value.replace(/\D/g, "");
                            field.onChange(val);
                          }}
                        />
                        {fieldState.error && (
                          <p className="text-red-500 text-xs mt-1">
                            {fieldState.error.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                  <Controller
                    name="ownerDetails.sellerAddress"
                    control={control}
                    render={({ field }) => (
                      <div className="flex flex-col gap-1 md:col-span-2">
                        <Label htmlFor="sellerAddress">Registered Owner Address</Label>
                        <Textarea id="sellerAddress" placeholder="Registered Owner Address"                     {...field}
                          value={field.value?.toUpperCase() ?? ""}
                          onChange={e => field.onChange(e.target.value.toUpperCase())} />
                      </div>
                    )}
                  />
                  <Controller
                    name="ownerDetails.sellerState"
                    control={control}
                    render={({ field }) => (
                      <div className="flex flex-col gap-1">
                        <Label htmlFor="sellerState">Registered Owner State</Label>
                        <Select
                          {...field}
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSearchSellerState('');
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a state" />
                          </SelectTrigger>
                          <SelectContent>
                            <div className="p-2">
                              <Input
                                placeholder="Search a State"
                                value={searchSellerState}
                                onChange={(e) => setSearchSellerState(e.target.value)}
                                className="mb-2"
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => e.stopPropagation()}
                              />
                            </div>
                            {ind2.map((state) => (
                              <SelectItem key={state} value={state}>
                                {state}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  />
                  <Controller
                    name="ownerDetails.sellerPhoneNo"
                    control={control}
                    rules={{
                      pattern: {
                        value: /^[6-9]\d{9}$/,
                        message: "Phone No must be a valid 10-digit",
                      },
                    }}
                    render={({ field, fieldState }) => (
                      <div className="flex flex-col gap-1">
                        <Label htmlFor="sellerPhoneNo">Registered Owner Phone No</Label>
                        <Input
                          id="sellerPhoneNo"
                          placeholder="Registered Owner Phone No"
                          maxLength={10}
                          {...field}
                          onChange={e => {
                            const val = e.target.value.replace(/\D/g, "");
                            field.onChange(val);
                          }}
                        />
                        {fieldState.error && (
                          <p className="text-red-500 text-xs mt-1">
                            {fieldState.error.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>
              <div>
                <div className="font-semibold mb-1">New Owner Details</div>
                <hr />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                  <Controller
                    name="ownerDetails.buyerName"
                    control={control}
                    render={({ field }) => (
                      <div className="flex flex-col gap-1">
                        <Label htmlFor="buyerName">New Owner Name<span className="text-red-500">*</span></Label>
                        <Input id="buyerName" placeholder="New Owner Name"                     {...field}
                          value={field.value?.toUpperCase() ?? ""}
                          onChange={e => field.onChange(e.target.value.toUpperCase())} />
                      </div>
                    )}
                  />
                  <Controller
                    name="ownerDetails.buyerAadharNo"
                    control={control}
                    rules={
                      {
                        pattern: {
                          value: /^\d{12}$/,
                          message: "Aadhaar No must be a 12-digit number",
                        },
                      }}
                    render={({ field }) => (
                      <div className="flex flex-col gap-1">
                        <Label htmlFor="buyerAadharNo">New Owner Aadhaar No<span className="text-red-500">*</span></Label>
                        <Input
                          id="buyerAadharNo"
                          placeholder="New Owner Aadhaar No"
                          maxLength={12}
                          {...field}
                          onChange={e => {
                            const val = e.target.value.replace(/\D/g, "");
                            field.onChange(val);
                          }}
                        />
                      </div>
                    )}
                  />
                  <Controller
                    name="ownerDetails.buyerAddress"
                    control={control}
                    render={({ field }) => (
                      <div className="flex flex-col gap-1 md:col-span-2">
                        <Label htmlFor="buyerAddress">New Owner Address<span className="text-red-500">*</span></Label>
                        <Textarea id="buyerAddress" placeholder="New Owner Address"                     {...field}
                          value={field.value?.toUpperCase() ?? ""}
                          onChange={e => field.onChange(e.target.value.toUpperCase())} />
                      </div>
                    )}
                  />
                  <Controller
                    name="ownerDetails.buyerState"
                    control={control}
                    render={({ field }) => (
                      <div className="flex flex-col gap-1">
                        <Label htmlFor="buyerState">New Owner State<span className="text-red-500">*</span></Label>
                        <Select
                          {...field}
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSearchBuyerState('');
                          }}

                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a state" />
                          </SelectTrigger>
                          <SelectContent>
                            <div className="p-2">
                              <Input
                                placeholder="Search a State"
                                value={searchBuyerState}
                                onChange={(e) => setSearchBuyerState(e.target.value)}
                                className="mb-2"
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => e.stopPropagation()}
                              />
                            </div>
                            {ind3.map((state) => (
                              <SelectItem key={state} value={state}>
                                {state}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  />
                  <Controller
                    name="ownerDetails.buyerPhoneNo"
                    control={control}
                    rules={{

                      pattern: {
                        value: /^[6-9]\d{9}$/,
                        message: "Phone No must be a valid 10-digit",
                      },
                    }}
                    render={({ field }) => (
                      <div className="flex flex-col gap-1">
                        <Label htmlFor="buyerPhoneNo">New Owner Phone No<span className="text-red-500">*</span></Label>
                        <Input
                          id="buyerPhoneNo"
                          placeholder="New Owner Phone No"
                          maxLength={10}
                          {...field}
                          onChange={e => {
                            const val = e.target.value.replace(/\D/g, "");
                            field.onChange(val);
                          }}
                        />
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="grid gap-4 p-6">
            <div className="text-xl font-semibold border-b-2">Expense Detail</div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {(["pucCharges", "insuranceCharges", "receiptAmount"] as const).map(
                (key) => (
                  <Controller
                    key={key}
                    name={`expenseDetail.${key}`}
                    control={control}
                    rules={{
                      required: `${key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())} is required.`,
                    }}
                    render={({ field, fieldState }) => (
                      <div className="flex flex-col gap-1">
                        <Label className="py-3" htmlFor={key}>
                          {key
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())}<span className="text-red-500">*</span>
                        </Label>
                        <Input
                          required
                          id={key}
                          type="number"
                          placeholder="Enter a value"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(val === "" ? "" : Number(val));
                          }}
                        />
                        {fieldState.error && (
                          <p className="text-red-500 text-xs mt-1">
                            {fieldState.error.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                )
              )}
              <Controller
                name="expenseDetail.otherCharges"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col gap-1">
                    <Label className="py-3" htmlFor="adminCharges">
                      Other Charges
                    </Label>
                    <Input
                      required
                      id="otherCharges"
                      type="number"
                      placeholder="Enter a value"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(val === "" ? "" : Number(val));
                      }}
                    />
                  </div>
                )}
              />
              {/* Show adminCharges only for superadmin */}
              {user?.role === "superadmin" && (
                <>
                  <Controller
                    name="expenseDetail.adminCharges"
                    control={control}
                    rules={{
                      required: "Admin Charges are required.",
                      pattern: {
                        value: /^\d+$/,
                        message: "Only digits are allowed",
                      },
                    }}
                    render={({ field, fieldState }) => (
                      <div className="flex flex-col gap-1">
                        <Label className="py-3" htmlFor="adminCharges">
                          Admin Charges <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="adminCharges"
                          placeholder="Enter a value"
                          {...field}
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            field.onChange(value);
                          }}
                        />
                        {fieldState.error && (
                          <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>
                        )}
                      </div>
                    )}
                  />
                </>
              )}

              <Controller
                name="expenseDetail.expenseRemarks"
                control={control}
                render={({ field }) => (
                  <div className="col-span-1 md:col-span-4 flex flex-col">
                    <Label className="py-3" htmlFor="expenseRemarks">
                      Expense Remarks
                    </Label>
                    <Textarea
                      className=""
                      placeholder="Remarks"
                      {...field}
                      value={field.value?.toUpperCase() ?? ""}
                      onChange={e => field.onChange(e.target.value.toUpperCase())}
                    />
                  </div>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="grid gap-4 p-6">
            <div className="text-xl font-semibold border-b-2">Reference Details</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              <Controller
                name="referenceDetail.name"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col">
                    <Label htmlFor="referenceName" className="pb-2">
                      Reference Name
                    </Label>
                    <Input
                      id="referenceName"
                      placeholder="Reference Name"
                      {...field}
                    />
                  </div>
                )}
              />
              <Controller
                name="referenceDetail.contactNo"
                control={control}
                rules={{
                  validate: value => {
                    if (!value) return true;
                    return /^[6-9]\d{9}$/.test(value) || "Phone No must be a valid 10-digit";
                  }
                }}
                render={({ field }) => (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="contactNo">Reference Contact No</Label>
                    <Input
                      id="contactNo"
                      placeholder="Reference Phone No"
                      maxLength={10}
                      {...field}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, "");
                        field.onChange(val);
                      }}
                    />
                  </div>
                )}
              />
              <Controller
                name="referenceDetail.documentLink"
                control={control}
                rules={{
                  pattern: {
                    value: /^(https?:\/\/[^\s]+)$/i,
                    message: "Only valid links are allowed",
                  },
                }}
                render={({ field, fieldState }) => (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="documentLink">Document Link</Label>
                    <Input
                      id="documentLink"
                      placeholder="Paste document URL"
                      {...field}
                      type="url"
                    />
                    {fieldState.error && (
                      <p className="text-red-500 text-xs mt-1">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>
          </CardContent>
        </Card>
        <Button
          style={{ cursor: "pointer" }}
          type="submit"
        >
          Submit Case
        </Button>
      </form>
    </div>
  );
}
