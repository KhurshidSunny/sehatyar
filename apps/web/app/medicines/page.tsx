import Disclaimer from "@/components/Disclaimer";
import ScreenHeader from "@/components/ScreenHeader";

export default function MedicinesPage() {
  return (
    <div className="flex flex-1 flex-col">
      <ScreenHeader title="دا درمل څه دی؟" />

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-3 px-4 py-6 sm:px-6">
        <p className="text-center text-lg text-muted sm:text-xl">
          د درملو پیک عکس واخلئ یا نوم ولیکئ
        </p>
      </main>

      <Disclaimer />
    </div>
  );
}
