import { cn } from "#/lib/utils";
import React from "react";

interface ButtonProps extends React.ComponentProps<"button"> {}

const Button = ({ children, className, ...rest }: ButtonProps) => {
  return (
    <button className={cn("matrix-button cursor-pointer", className)} {...rest}>
      {children}
    </button>
  );
};

export default Button;
