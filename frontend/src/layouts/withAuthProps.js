import React from "react";
import { useAuth } from "../AuthContext";

const withAuthProps = (WrappedComponent) => {
  return function WithAuthProps(props) {
    const { nickname } = useAuth(); // Access nickname using the useAuth hook
    return <WrappedComponent nickname={nickname} {...props} />;
  };
};

export default withAuthProps;
