import { memo } from "react";
import PopularBrands from "./PopularBrands.tsx";

function PopularBrandsSection() {
  return (
    <section className="py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <PopularBrands />
      </div>
    </section>
  );
}

export default memo(PopularBrandsSection);
