declare module "@/components/ui/dialog" {
  import * as React from "react";
  import {
    DialogProps,
    DialogTriggerProps,
    DialogPortalProps,
    DialogOverlayProps,
    DialogContentProps,
    DialogCloseProps,
    DialogTitleProps,
    DialogDescriptionProps,
  } from "@radix-ui/react-dialog";

  export const Dialog: React.FC<DialogProps>;
  export const DialogTrigger: React.FC<DialogTriggerProps>;
  export const DialogPortal: React.FC<DialogPortalProps>;
  export const DialogOverlay: React.ForwardRefExoticComponent<
    React.PropsWithoutRef<DialogOverlayProps> & React.RefAttributes<HTMLDivElement>
  >;
  export const DialogContent: React.ForwardRefExoticComponent<
    React.PropsWithoutRef<DialogContentProps> & React.RefAttributes<HTMLDivElement>
  >;
  export const DialogClose: React.FC<DialogCloseProps>;
  export const DialogTitle: React.ForwardRefExoticComponent<
    React.PropsWithoutRef<DialogTitleProps> & React.RefAttributes<HTMLHeadingElement>
  >;
  export const DialogDescription: React.ForwardRefExoticComponent<
    React.PropsWithoutRef<DialogDescriptionProps> & React.RefAttributes<HTMLParagraphElement>
  >;
  export const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const DialogFooter: React.FC<React.HTMLAttributes<HTMLDivElement>>;

  export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "ghost";
    size?: "default" | "sm";
    asChild?: boolean;
  }

  export const Button: React.ForwardRefExoticComponent<
    ButtonProps & React.RefAttributes<HTMLButtonElement>
  >;
}
