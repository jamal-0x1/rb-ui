"use client";
import React, { createContext, useContext, useState } from "react";

interface PreviewSliderType {
  isModalPreviewOpen: boolean;
  currentIndex: number;
  openPreviewModal: (initialIndex?: number) => void;
  setCurrentIndex: (idx: number) => void;
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

export const PreviewSliderProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isModalPreviewOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openPreviewModal = (idx: number = 0) => {
    setCurrentIndex(idx);
    setIsModalOpen(true);
  };

  const closePreviewModal = () => {
    setIsModalOpen(false);
  };

  return (
    <PreviewSlider.Provider
      value={{
        isModalPreviewOpen,
        currentIndex,
        openPreviewModal,
        setCurrentIndex,
        closePreviewModal,
      }}
    >
      {children}
    </PreviewSlider.Provider>
  );
};
