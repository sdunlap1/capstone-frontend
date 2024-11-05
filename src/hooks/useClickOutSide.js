"use strict"

import { useEffect, useRef } from "react";

export const useClickOutSide = (ref, isOpen, handleClose) => {
  const mouseModal = useRef(false);

  useEffect(() => {
    const handleMouseDown = (event) => {
      if (ref.current && ref.current.contains(event.target)) {
        mouseModal.current = true; // MouseDown started inside the modal
      } else {
        mouseModal.current = false; // MouseDown started outside the modal
      }
    };

    const handleMouseUp = (event) => {
      if (!mouseModal.current && ref.current && !ref.current.contains(event.target)) {
        handleClose(); // Close modal if mousedown and mouseup both happened outside
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleMouseDown);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isOpen, ref, handleClose]);
};