export const errorCallback = (error: any) => {
  let message = "Something went wrong";

  const ZOD_ERRORS = ["Validation failed"];

  // Axios error?
  if (error.response && error.response.data) {
    message = error.response.data.message || message;
  }

  if (ZOD_ERRORS.includes(error?.response?.data?.message)) {
    message = JSON.stringify(error?.response?.data?.data);
  }

  return {
    message,
    error: error.response.data.error || [],
  };
};

export const successCallback = (response: any) => {
  const message = response?.data?.message ?? "successfully!";

  return message;
};
