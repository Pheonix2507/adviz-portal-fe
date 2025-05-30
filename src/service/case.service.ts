import axios from "axios";
import { url,getConfig } from "@/service/auth.service";
// import { type Case } from "@/components/CaseForm";

export async function createCase(CaseData: any){
    const token = localStorage.getItem("token"); // Assuming user is logged in
    try {
        const response = await axios.post(
            `${url}/case/new`,
            CaseData,
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            }
        );
        const result = response.data;

        if (!response.status || !result.success) {
            throw new Error(result.message || "Failed to create Case");
        }

        return result || "Case created successfully";
    } catch (error: any) {
        throw new Error(error.response?.data?.message || error.message || "Failed to create Case");
    }
}

export const getAllCases= async () => {
  const config = getConfig();
  return axios
    .get(url + "/case/all", config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error occurred during login:", error);
      throw error;
    });
};

export const getAllCasesE= async () => {
  const config = getConfig();
  return axios
    .get(url + "/case/employee", config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error occurred during login:", error);
      throw error;
    });
};

export const getCaseID= async (Id:any) => {
  const config = getConfig();
  return axios
    .get(`${url}/case/${Id}`, config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error occurred during login:", error);
      throw error;
    });
};