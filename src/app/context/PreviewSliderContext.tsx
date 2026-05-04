"use client";
import React, { createContext, useContext, useState } from "react";

interface PreviewSliderType {
  isModalPreviewOpen: boolean;
  initialIndex: number;
  openPreviewModal: (initialIndex?: number) => void;
  closePreviewModal: () => void;
}

const PreviewSlider = createContext<PreviewSliderType | undefined>(undefined);

export const usePreviewSlider = () => {
  const context = useContext(PreviewSlider);
  if (!context) {
    throw new Error("usePreviewSlider must be used within a ModalProvider");
  }
  return context;
};

export const PreviewSliderProvider = ({ children }: { children: React.ReactNode }) => {
  const [isModalPreviewOpen, setIsModalOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);

  const openPreviewModal = (idx: number = 0) => {
    setInitialIndex(idx);
    setIsModalOpen(true);
  };

  const closePreviewModal = () => {
    setIsModalOpen(false);
  };

  return (
    <PreviewSlider.Provider
      value={{ isModalPreviewOpen, initialIndex, openPreviewModal, closePreviewModal }}
    >
      {children}
    </PreviewSlider.Provider>
  );
};
