import type { Employee } from "@/components/EmployeeForm";
import axios from "axios";
import { url,getConfig } from "@/service/auth.service";

export async function createEmployee(firmData: any): Promise<Employee> {
    const token = localStorage.getItem("token"); // Assuming user is logged in
    try {
        const response = await axios.post(
            `${url}/auth/add-user`,
            firmData,
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            }
        );
        const result = response.data;

        if (!response.status || !result.success) {
            throw new Error(result.message || "Failed to create Firm");
        }

        return result.data || "Firm created successfully";
    } catch (error: any) {
        throw new Error(error.response?.data?.message || error.message || "Failed to create Firm");
    }
}

export async function updateEmployee(firmData: any, employeeId:string): Promise<Employee> {
  const token = localStorage.getItem("token"); // Assuming user is logged in
  try {
      const response = await axios.post(
          `${url}/auth/update-user/${employeeId}`,
          firmData,
          {
              headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`,
              },
          }
      );
      const result = response.data;

      if (!response.status || !result.success) {
          throw new Error(result.message || "Failed to update Employee");
      }

      return result.data || "Employee updated successfully";
  } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || "Failed to update Employee");
  }
}

export const getEmployee= async () => {
  const config = getConfig();
  return axios
    .get(url + "/auth/getall-employees", config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error occurred during login:", error);
      throw error;
    });
};

export const getbranchEmployee= async (branchId:any) => {
  const config = getConfig();
  return axios
    .get(`${url}/auth/get-employees/${branchId}`, config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error occurred during login:", error);
      throw error;
    });
};

