"use client";

import Disclaimer from "@/components/Disclaimer";
import LocalizedScreenHeader from "@/components/LocalizedScreenHeader";
import MedicinePhotoUpload from "@/components/MedicinePhotoUpload";

export default function MedicinesPage() {
  return (
    <div className="flex flex-1 flex-col">
      <LocalizedScreenHeader titleKey="whatIsThisMedicine" />

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-3 px-4 py-6 sm:px-6">
        <MedicinePhotoUpload />
      </main>

      <Disclaimer />
    </div>
  );
}
