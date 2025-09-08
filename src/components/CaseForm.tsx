import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { indianStates } from "@/components/Branchform";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import type { Branch } from "@/components/Branchform";
import { getActiveBranch } from "@/service/branch.service";
// import type { Employee } from "@/components/EmployeeForm";
import { useLoading } from "./LoadingContext";
import type { Firm } from "@/components/FirmForm";
import { getbranchEmployee } from "@/service/emp.service";
import { getActiveFirm } from "@/service/firm.service";
import { createCase } from "@/service/case.service";
import { useToast } from "@/context/ToastContext";
import { useNavigate } from "react-router-dom";
import { DateInput } from "@/components/ui/date-input";
import { getFirmsD } from "@/service/client.service";
import type { Employee } from "./EmployeeForm";
import { getActiveRto } from "@/service/rto.service";

// Interfaces
export interface FinalDetails {
  CaseNo: string;
  status: string;
  generalDetail: GeneralDetails;
  vehicleDetail: VehicleDetail;
  expireDetail: ExpireDetail;
  transactionDetail: TransactionDetail;
  expenseDetail: ExpenseDetail;
  ownerDetails?: ownerDetails;
  referenceDetail?: referenceDetail;
  logs: Logs;
}
export interface Logs {
  user: user;
  fromStatus: string;
  toStatus: string;
}

export interface referenceDetail {
  name: string,
  contactNo: string,
  documentLink?: string,
}

export interface user {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface Case {
  generalDetails: GeneralDetails;
  vehicleDetail: VehicleDetail;
  expireDetail: ExpireDetail;
  transactionDetail: TransactionDetail;
  ownerDetails: ownerDetails;
  expenseDetail: ExpenseDetail;
  referenceDetail: referenceDetail;
}

export interface GeneralDetails {
  firmName: string;
  branchCodeId: string;
  employeeCodeId: string;
  incentiveAmount?: string;
  appointmentDate?: string;
  applicationNo?: string;
}

export interface VehicleDetail {
  vehicleNo: string;
  fromRTO: string;
  toRTO: string;
  chassisNo: string;
  engineNo: string;
  rmaVehicleNo?: string;
}

export interface ExpireDetail {
  insuranceExpiry: string;
  pucExpiry: string;
  fitnessExpiry: string;
  taxExpiry: string;
  permitExpiry: string;
}

export interface TransactionDetail {
  to: TransactionTo;
  hptId: string;
  hpaId: string;
  fitness: boolean;
  rrf: boolean;
  rma: boolean;
  alteration: boolean;
  conversion: boolean;
  numberPlate: NumberPlate;
  addressChange: boolean;
  insuranceType: InsuranceType;
  drc: boolean;
  remarks: string;
}

export interface ownerDetails {
  sellerName: string;
  sellerAadharNo: string;
  sellerAddress: string;
  sellerState: string;
  sellerPhoneNo: string;
  buyerName: string;
  buyerAadharNo: string;
  buyerAddress: string;
  buyerState: string;
  buyerPhoneNo: string;
}

export interface ExpenseDetail {
  pucCharges: number | string;
  insuranceCharges: number | string;
  otherCharges: number | string;
  adminCharges: number | string;
  receiptAmount: number | string;
  expenseRemarks: string;
}

export const TransactionTo = {
  LOCAL: "LOCAL",
  OTHER: "OTHER",
  NA: "NA",
} as const;
export type TransactionTo = (typeof TransactionTo)[keyof typeof TransactionTo];

export const InsuranceType = {
  NA: "NA",
  THIRD_PARTY: "Third Party",
  COMPREHENSIVE: "Comprehensive",
} as const;
export type InsuranceType = (typeof InsuranceType)[keyof typeof InsuranceType];

export const NumberPlate = {
  HSRP: "HSRP",
  NON_HSRP: "NON HSRP",
  NA: "NA",
} as const;
export type NumberPlate = (typeof NumberPlate)[keyof typeof NumberPlate];
// export const RTOOptions = [
//   { value: "N/A", label: "N/A" },
//   { value: "GJ01 (AHMEDABAD)", label: "GJ01 (AHMEDABAD)" },
//   { value: "GJ02 (MEHSANA)", label: "GJ02 (MEHSANA)" },
//   { value: "GJ03 (RAJKOT)", label: "GJ03 (RAJKOT)" },
//   { value: "GJ04 (BHAVNAGAR)", label: "GJ04 (BHAVNAGAR)" },
//   { value: "GJ05 (SURAT)", label: "GJ05 (SURAT)" },
//   { value: "GJ06 (VADODARA)", label: "GJ06 (VADODARA)" },
//   { value: "GJ07 (KHEDA)", label: "GJ07 (KHEDA)" },
//   { value: "GJ08 (BANASKANTHA)", label: "GJ08 (BANASKANTHA)" },
//   { value: "GJ09 (SABARKANTHA)", label: "GJ09 (SABARKANTHA)" },
//   { value: "GJ10 (JAMNAGAR)", label: "GJ10 (JAMNAGAR)" },
//   { value: "GJ11 (JUNAGADH)", label: "GJ11 (JUNAGADH)" },
//   { value: "GJ12 (KACHCHH)", label: "GJ12 (KACHCHH)" },
//   { value: "GJ13 (SURENDRANAGAR)", label: "GJ13 (SURENDRANAGAR)" },
//   { value: "GJ14 (AMRELI)", label: "GJ14 (AMRELI)" },
//   { value: "GJ15 (VALSAD)", label: "GJ15 (VALSAD)" },
//   { value: "GJ16 (BHARUCH)", label: "GJ16 (BHARUCH)" },
//   { value: "GJ17 (PANCHMAHAL)", label: "GJ17 (PANCHMAHAL)" },
//   { value: "GJ18 (GANDHINAGAR)", label: "GJ18 (GANDHINAGAR)" },
//   { value: "GJ19 (BARDOLI)", label: "GJ19 (BARDOLI)" },
//   { value: "GJ20 (DAHOD)", label: "GJ20 (DAHOD)" },
//   { value: "GJ21 (NAVSARI)", label: "GJ21 (NAVSARI)" },
//   { value: "GJ22 (NARMADA)", label: "GJ22 (NARMADA)" },
//   { value: "GJ23 (ANAND)", label: "GJ23 (ANAND)" },
//   { value: "GJ24 (PATAN)", label: "GJ24 (PATAN)" },
//   { value: "GJ25 (PORBANDAR)", label: "GJ25 (PORBANDAR)" },
//   { value: "GJ26 (TAPI)", label: "GJ26 (TAPI)" },
//   { value: "GJ27 (AHMEDABAD EAST)", label: "GJ27 (AHMEDABAD EAST)" },
//   { value: "GJ30 (AAHWA)", label: "GJ30 (AAHWA)" },
//   { value: "GJ31 (MODASA)", label: "GJ31 (MODASA)" },
//   { value: "GJ32 (VERAVAL)", label: "GJ32 (VERAVAL)" },
//   { value: "GJ33 (BOTAD)", label: "GJ33 (BOTAD)" },
//   { value: "GJ34 (CHHOTAUDAIPUR)", label: "GJ34 (CHHOTAUDAIPUR)" },
//   { value: "GJ35 (LUNAVADA)", label: "GJ35 (LUNAVADA)" },
//   { value: "GJ36 (MORBI)", label: "GJ36 (MORBI)" },
//   { value: "GJ37 (KHAMBHALIYA)", label: "GJ37 (KHAMBHALIYA)" },
//   { value: "GJ38 (AHMEDABAD  BAWLA ARTO)", label: "GJ38 (AHMEDABAD  BAWLA ARTO)" },
//   { value: "GJ39 (KACHCHH EAST)", label: "GJ39 (KACHCHH EAST)" },
//   { value: "GJ40 (THARAD-VAV)", label: "GJ40 (THARAD-VAV)" },
// ] as const;



export default function CaseForm() {

  const defaultFormValues = useMemo(() => ({
    generalDetails: {
      firmName: "",
      branchCodeId: "",
      employeeCodeId: "",
      incentiveAmount: "",
      appointmentDate: "",
      applicationNo: undefined,
    },
    vehicleDetail: {
      vehicleNo: "",
      rmaVehicleNo: "",
      fromRTO: "",
      toRTO: "",
      chassisNo: "",
      engineNo: "",
    },
    expireDetail: {
      insuranceExpiry: "",
      pucExpiry: "",
      fitnessExpiry: "",
      taxExpiry: "",
      permitExpiry: "",
    },
    transactionDetail: {
      to: "" as unknown as TransactionTo,
      hptId: "",
      hpaId: "",
      fitness: false,
      rrf: false,
      rma: false,
      alteration: false,
      conversion: false,
      numberPlate: "" as unknown as NumberPlate,
      addressChange: false,
      insuranceType: "" as unknown as InsuranceType,
      drc: false,
      remarks: "",
    },
    ownerDetails: {
      sellerName: "",
      sellerAadharNo: "",
      sellerAddress: "",
      sellerState: "",
      sellerPhoneNo: "",
      buyerName: "",
      buyerAadharNo: "",
      buyerAddress: "",
      buyerState: "",
      buyerPhoneNo: "",
    },
    expenseDetail: {
      pucCharges: "",
      insuranceCharges: "",
      otherCharges: "",
      adminCharges: "",
    },
    referenceDetail: {
      name: "",
      contactNo: "",
      documentLink: "",
    },
  }), []); // dependency array empty → stable reference



  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<Case>({
    defaultValues: defaultFormValues,
  });

  // type BranchEmployee = {
  //   id: string;
  //   name: string;
  //   employeeCode: string;
  // };



  const { user, logout } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [b, setB] = useState<string>("");
  const { setLoading } = useLoading();
  const [branchEmp, setbranchEmp] = useState<Employee[]>([]);
  const [firms, setfirms] = useState<Firm[]>([]);
  const [firmsD, setfirmsD] = useState<string[]>([]);
  const [searchfirm, setSearchfirm] = useState("");
  const [search, setSearch] = useState("");
  // const [done,setDone] = useState("");
  const toast = useToast();
  const navigate = useNavigate();

  const [refreshFlag] = useState(false);

  const [searchSellerState, setSearchSellerState] = useState("");
  const [searchBuyerState, setSearchBuyerState] = useState("");
  const [rtos, setRtos] = useState<string[]>([]);


  const ind2 = indianStates.filter((hostel) =>
    hostel.toLowerCase().includes((searchSellerState).toLowerCase())
  );
  const ind3 = indianStates.filter((hostel) =>
    hostel.toLowerCase().includes((searchBuyerState).toLowerCase())
  );



  useEffect(() => {
    setLoading(true);
    // console.log(user);
    getActiveBranch()
      .then((resp) => {
        setBranches(resp?.data);
      })
      .catch((err: any) => {
        if (err?.status == 401 || err?.response?.status == 401) {
          toast.showToast('Error', 'Session Expired', 'error');
          logout();
        } else {
          toast.showToast('Error:', err?.message || 'Error during fetch of Branches', 'error');
        }        // console.error("Error fetching branches:", err);
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


  useEffect(() => {
    setLoading(true);

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
  }, [refreshFlag]);

  useEffect(() => {
    setLoading(true);

    getActiveRto()
      .then((resp) => {
        const displayNames = resp?.data.map((item: any) => item.displayName);
        displayNames.unshift("NA");
        setRtos(displayNames);
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

  useEffect(() => {
    if (user?.role === "employee" && user?.branchCode && user?.employeeCode) {
      setValue("generalDetails.branchCodeId", user.branchCode);
      setValue("generalDetails.employeeCodeId", user.id);
      setB(user.branchCode); // ✅ only this triggers the next effect
    }
  }, [user, setValue]);

  const [searchHPT, setSearchHPT] = useState("");
  const [searchHPA, setSearchHPA] = useState("");
  const [searchRTOto, setSearchRTOto] = useState("");
  const [searchRTOfrom, setSearchRTOfrom] = useState("");
  const mainFirms = firmsD.filter(f => f.toLowerCase().includes(searchfirm.toLowerCase()));

  const filteredfirms = firms.filter(f => f.name.toLowerCase().includes((searchHPA || searchHPT).toLowerCase()));

  const filteredCode1 = rtos.filter(f => f.toLowerCase().includes((searchRTOfrom).toLowerCase()));
  const filteredCode2 = rtos.filter(f => f.toLowerCase().includes((searchRTOto).toLowerCase()));
  // Add a submit handler function
  const onSubmit = (data: any) => {
    setLoading(true);
    createCase(data)
      .then((resp) => {
        toast.showToast('Success', resp?.message, 'success');
        reset();

        if (user?.role === "employee")
          navigate('/employee/cases');

        else if (user?.role === "superadmin")
          navigate('/superadmin/cases/Mycases')
      })
      .catch((err: any) => {
        if (err?.status == 401 || err?.response?.status == 401) {
          toast.showToast('Error', 'Session Expired', 'error');
          logout();
        } else {
          toast.showToast('Error:', err?.message || 'Error in while Creating a Case', 'error');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };


  function parseCamelCase(str: string) {
    return str
      // Insert space before uppercase letters that follow lowercase letters
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      // Convert entire string to uppercase
      .toUpperCase();
  }

  //   useEffect(() => {
  //   // Listen to all input events, force uppercase
  //   const handler = (e:any) => {
  //     if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) {
  //       e.target.value = e.target.value.toUpperCase();
  //     }
  //   };
  //   document.addEventListener('input', handler, true);
  //   return () => document.removeEventListener('input', handler, true);
  // }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8 p-6">
      {/* General Details */}
      <Card>
        <CardContent className="grid gap-4">
          <div className="text-xl font-semibold">General Details</div>
          <hr />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Controller
              name="generalDetails.firmName"
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
            {user?.role !== "superadmin" && (
              <Controller
                name="generalDetails.branchCodeId"
                control={control}
                rules={{ required: "Branch is required" }}
                render={({ field, fieldState }) => (
                  <div className="flex flex-col w-full">
                    <Label htmlFor="branchCodeId" className="pb-2">
                      Branch Name
                    </Label>
                    {user?.role === "employee" ? (
                      <div className="flex flex-col w-full">
                        <Input
                          readOnly
                          value={
                            branches.find((branch) => branch.branchCode === user.branchCode)?.name
                          }
                          className="bg-gray-100 cursor-not-allowed"
                        />
                        {/* Hidden input, but do NOT spread `field`, only needed name + value */}
                        <input type="hidden" name={field.name} value={user.branchCode} />
                      </div>
                    ) : (
                      <div className="flex flex-col w-full">
                        <Select
                          required
                          value={field.value}
                          onValueChange={(val) => {
                            field.onChange(val);
                            setB(val);
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Branch" />
                          </SelectTrigger>
                          <SelectContent>
                            <div className="p-2">
                              <Input
                                placeholder="Search a Branch"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="mb-2"
                              />
                            </div>
                            {branches.map((branch) => (
                              <SelectItem
                                key={branch?.branchCode}
                                value={branch?.branchCode || "default"}
                              >
                                {branch.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {fieldState.error && (
                      <p className="text-red-500 text-xs mt-1">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />)}
            {user?.role !== "superadmin" && (
              <Controller
                name="generalDetails.employeeCodeId"
                control={control}
                rules={{ required: "Employee is required" }}
                render={({ field, fieldState }) => (
                  <div className="flex flex-col w-full">
                    <Label htmlFor="employeeCodeId" className="pb-2">
                      Employee Name
                    </Label>
                    {user?.role === "employee" ? (
                      <>
                        <Input
                          readOnly
                          value={
                            branchEmp
                              .filter((emp) => emp.employeeCode === user.employeeCode)
                              .map((emp) => `${emp.firstName?.trim() ?? ""} ${emp.lastName?.trim() ?? ""}`)
                              .join("") // in case filter returns 1 or 0 items
                          }
                          className="bg-gray-100 cursor-not-allowed"
                        />

                      </>
                    ) : (
                      <>
                        <Select
                          required
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Employee" />
                          </SelectTrigger>
                          <SelectContent>
                            <div className="p-2">
                              <Input
                                placeholder="Search an Employee"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="mb-2"
                              />
                            </div>
                            {branchEmp.map((emp) => (
                              <SelectItem key={emp?.id ?? ""} value={emp?.id ?? ""}>
                                {emp?.firstName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {fieldState.error && (
                          <p className="text-red-500 text-xs mt-1">
                            {fieldState.error.message}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}
              />
            )}


            {/* Incentive Type - Only show for superadmin */}
            {user?.role === "superadmin" && (
              <Controller
                name="generalDetails.incentiveAmount"
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
              name="generalDetails.appointmentDate"
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
              name="generalDetails.applicationNo"
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
                  {errors.vehicleDetail?.vehicleNo && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.vehicleDetail.vehicleNo?.message}
                    </p>
                  )}
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
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="fromRTO" className="w-full">
                      <SelectValue placeholder="Select From RTO..." />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2">
                        <Input
                          placeholder="Search a Firm"
                          value={searchRTOfrom}
                          onChange={(e) => setSearchRTOfrom(e.target.value)}
                          className="mb-2"
                          onClick={(e) => e.stopPropagation()} // 👈 Prevent Select from closing
                          onKeyDown={(e) => e.stopPropagation()} // 👈 Prevent bubbling to Select
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
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="toRTO" className="w-full">
                      <SelectValue placeholder="Select To RTO..." />
                    </SelectTrigger>
                    <SelectContent>
                      <Input
                        placeholder="Search a Firm"
                        value={searchRTOto}
                        onChange={(e) => setSearchRTOto(e.target.value)}
                        className="mb-2"
                        onClick={(e) => e.stopPropagation()} // 👈 Prevent Select from closing
                        onKeyDown={(e) => e.stopPropagation()} // 👈 Prevent bubbling to Select
                      />
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
                  render={({ field, fieldState }) => (
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="buyerName">New Owner Name</Label>
                      <Input id="buyerName" placeholder="New Owner Name"                     {...field}
                        value={field.value?.toUpperCase() ?? ""}
                        onChange={e => field.onChange(e.target.value.toUpperCase())} />
                      {fieldState.error && (
                        <p className="text-red-500 text-xs mt-1">
                          {fieldState.error.message}
                        </p>
                      )}
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
                  render={({ field, fieldState }) => (
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="buyerAadharNo">New Owner Aadhaar No</Label>
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
                      {fieldState.error && (
                        <p className="text-red-500 text-xs mt-1">
                          {fieldState.error.message}
                        </p>
                      )}
                    </div>
                  )}
                />
                <Controller
                  name="ownerDetails.buyerAddress"
                  control={control}
                  render={({ field, fieldState }) => (
                    <div className="flex flex-col gap-1 md:col-span-2">
                      <Label htmlFor="buyerAddress">New Owner Address</Label>
                      <Textarea id="buyerAddress" placeholder="New Owner Address"                     {...field}
                        value={field.value?.toUpperCase() ?? ""}
                        onChange={e => field.onChange(e.target.value.toUpperCase())} />
                      {fieldState.error && (
                        <p className="text-red-500 text-xs mt-1">
                          {fieldState.error.message}
                        </p>
                      )}
                    </div>
                  )}
                />
                <Controller
                  name="ownerDetails.buyerState"
                  control={control}
                  render={({ field, fieldState }) => (
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="buyerState">New Owner State</Label>
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
                      {fieldState.error && (
                        <p className="text-red-500 text-xs mt-1">
                          {fieldState.error.message}
                        </p>
                      )}
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
                  render={({ field, fieldState }) => (
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="buyerPhoneNo">New Owner Phone No</Label>
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
            {/* Show adminCharges only for superadmin */}
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
                  <Label htmlFor="applicationNo" className="pb-2">
                    Reference Name
                  </Label>
                  <Input
                    placeholder="Name"
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
                  <Label htmlFor="buyerPhoneNo">Reference Contact No</Label>
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
      <Button style={{ cursor: "pointer" }} type="submit">Submit Case</Button>
    </form>
  );
}
