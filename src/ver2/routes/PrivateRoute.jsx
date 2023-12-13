import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PrivateRoute = ({ user, children }) => {
  if (!user) {
    toast.warning("Please login before using the service");
    return <Navigate to={"/login"} />;
  }

  return children || <Outlet />;
};

export default PrivateRoute;
